import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { saveChat } from "@/lib/chat-store";

const message = z.object({
  role: z.enum(["user", "model"]),
  text: z.string().trim().min(1).max(1000),
});

const bodySchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("chat"), messages: z.array(message).min(1).max(12) }),
  z.object({ mode: z.literal("creature"), idea: z.string().trim().min(3).max(200) }),
]);

const CHAT_SYSTEM = `You are Genesis, the friendly guide of a website called TechnoGenesis about how AI, biotechnology and robotics are creating new forms of life.
Rules:
- Explain things so a 12-year-old can understand. Use simple words and short sentences.
- Keep answers to 3 to 5 sentences unless the person asks for more.
- Use one everyday comparison when it helps.
- Only talk about science, technology, AI, biology and robotics. If asked about something unrelated, kindly steer back.
- Never invent facts, numbers or names. If you are not sure, say so.
- Do not use markdown headings or tables. Plain sentences only.`;

const CREATURE_SYSTEM = `You design imaginary "living machines" for a kids-friendly science website about AI, biotechnology and robotics.
The person describes an idea. Reply with ONLY a JSON object, with no markdown and no extra text, using exactly these keys:
{"name": a cool short name (max 3 words),
"kind": what it is, in one short phrase,
"mind": one sentence about its AI brain,
"body": one sentence about its living, biotech part,
"frame": one sentence about its robotic part,
"power": its superpower, in one sentence,
"weakness": one weakness, in one sentence,
"real": one sentence naming a REAL existing technology that is a first step toward this idea (for example CRISPR gene editing, AlphaFold protein prediction, Xenobots, robotic arms or self-driving cars). If you are not sure of a real example, write "No close real example yet.",
"mix": {"ai": number, "bio": number, "robo": number}}
Rules: use simple words a 12-year-old understands. Never invent real facts. Never create weapons or anything harmful. If the idea is unsuitable, design a friendly helper creature instead.`;

const short = (n: number) =>
  z
    .string()
    .trim()
    .min(1)
    .transform((s) => s.slice(0, n));

const cardSchema = z.object({
  name: short(40),
  kind: short(70),
  mind: short(220),
  body: short(220),
  frame: short(220),
  power: short(220),
  weakness: short(220),
  real: short(260),
  mix: z.object({
    ai: z.coerce.number().min(0).max(1000),
    bio: z.coerce.number().min(0).max(1000),
    robo: z.coerce.number().min(0).max(1000),
  }),
});

function parseCard(text: string) {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  let raw: unknown;
  try {
    raw = JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      raw = JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
  const p = cardSchema.safeParse(raw);
  if (!p.success) return null;

  const { mix } = p.data;
  const total = Math.max(1, mix.ai + mix.bio + mix.robo);
  const ai = Math.round((mix.ai / total) * 100);
  const bio = Math.round((mix.bio / total) * 100);
  const robo = Math.max(0, 100 - ai - bio);
  return { card: { ...p.data, mix: { ai, bio, robo } } };
}

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  promptFeedback?: { blockReason?: string };
};

type Job = {
  system: string;
  contents: { role: "user" | "model"; parts: { text: string }[] }[];
  json: boolean;
  maxTokens: number;
  temperature: number;
  accept: (text: string) => unknown;
};

const split = (v?: string) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

// Combinations that recently failed rest for a while, so we skip them.
const resting = new Map<string, number>();
const isResting = (id: string) => (resting.get(id) ?? 0) > Date.now();
const rest = (id: string, ms: number) => resting.set(id, Date.now() + ms);
let rotation = 0;

type Attempt = { status: number; reply?: string; blocked?: boolean; detail?: string };

async function callGemini(model: string, key: string, job: Job): Promise<Attempt> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: job.system }] },
          contents: job.contents,
          generationConfig: {
            temperature: job.temperature,
            maxOutputTokens: job.maxTokens,
            ...(job.json ? { responseMimeType: "application/json" } : {}),
          },
        }),
      },
    );
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      return { status: res.status, detail };
    }
    const data = (await res.json()) as GeminiResponse;
    const reply = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim();
    if (!reply) return { status: 200, blocked: !!data.promptFeedback?.blockReason };
    return { status: 200, reply };
  } catch {
    return { status: 0 }; // network problem or timeout
  }
}

export async function POST(req: Request) {
  const keys = split(process.env.GEMINI_API_KEYS);
  if (keys.length === 0 && process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY.trim());
  const models = split(process.env.GEMINI_MODELS);
  if (models.length === 0) models.push(process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash");

  if (keys.length === 0) {
    return NextResponse.json(
      { error: "The AI is not set up yet. Add GEMINI_API_KEYS to the .env file and restart." },
      { status: 503 },
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = rateLimit(`ai:${ip}`, 15, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You are asking very fast. Please wait a few seconds and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const d = parsed.data;
  const job: Job =
    d.mode === "chat"
      ? {
          system: CHAT_SYSTEM,
          contents: d.messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
          json: false,
          maxTokens: 1500,
          temperature: 0.7,
          accept: (t) => ({ reply: t }),
        }
      : {
          system: CREATURE_SYSTEM,
          contents: [{ role: "user", parts: [{ text: `Idea: ${d.idea}` }] }],
          json: true,
          maxTokens: 3000,
          temperature: 0.9,
          accept: parseCard,
        };

  // Spread load: each request starts from a different key.
  const start = rotation++ % keys.length;
  const orderedKeys = keys.map((_, i) => keys[(start + i) % keys.length]);

  const MAX_ATTEMPTS = 8;
  let attempts = 0;
  let sawQuota = false;
  let sawBusy = false;

  outer: for (const model of models) {
    for (const key of orderedKeys) {
      const keyId = `key|${key.slice(-8)}`;
      const modelId = `model|${model}`;
      const pairId = `${model}|${key.slice(-8)}`;
      if (isResting(keyId) || isResting(modelId) || isResting(pairId)) continue;
      if (attempts >= MAX_ATTEMPTS) break outer;
      attempts++;

      const r = await callGemini(model, key, job);

      if (r.status === 200) {
        if (r.reply) {
          const out = job.accept(r.reply);
          if (out) {
            console.log(`[ai] ${d.mode} answered by ${model} (key …${key.slice(-4)})`);
            if (d.mode === "chat") await saveChat(d.messages[d.messages.length - 1].text, (out as { reply: string }).reply);
            return NextResponse.json(out);
          }
          rest(modelId, 15_000); // unusable answer: try the next model
          continue outer;
        }
        if (r.blocked) {
          return NextResponse.json(
            { error: "The AI cannot answer that one. Try describing it a different way." },
            { status: 422 },
          );
        }
        rest(modelId, 15_000); // empty answer: try the next model
        continue outer;
      }

      console.error(`[ai] ${model} (key …${key.slice(-4)}) -> ${r.status} ${r.detail ?? ""}`);

      const badKey =
        r.status === 401 ||
        r.status === 403 ||
        (r.status === 400 && /API key|API_KEY/i.test(r.detail ?? ""));

      if (badKey) {
        rest(keyId, 60 * 60_000); // this key is broken: skip it for an hour
        continue; // next key
      }
      if (r.status === 429) {
        sawQuota = true;
        rest(pairId, 60_000); // this key is out of quota for this model
        continue; // next key
      }
      if (r.status === 404) {
        rest(modelId, 60 * 60_000); // model name is wrong
        continue outer;
      }
      if (r.status === 0 || r.status >= 500) {
        sawBusy = true;
        rest(modelId, 20_000); // model is overloaded: switch model
        continue outer;
      }
      rest(modelId, 30_000); // anything else: switch model
      continue outer;
    }
  }

  const error = sawQuota
    ? "The AI is very busy right now. Please try again in a minute."
    : sawBusy
      ? "The AI could not be reached right now. Please try again in a moment."
      : "The AI could not answer right now. Please try again.";
  return NextResponse.json({ error }, { status: 503 });
}