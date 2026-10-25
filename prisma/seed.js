const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "demo@technogenesis.app";
  if (await prisma.user.findUnique({ where: { email } })) {
    console.log("[seed] demo account already exists");
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: "Demo Judge",
      email,
      passwordHash: await bcrypt.hash("Genesis2026", 12),
      bio: "A demo account for trying the site.",
      interests: "ai,biotech,robotics",
      avatarHue: 140,
    },
  });

  await prisma.interaction.create({
    data: { userId: user.id, type: "SIGNED_UP", demo: "site", label: "Created your account" },
  });

  await prisma.robotConfig.create({
    data: {
      userId: user.id,
      name: "Bio-Bot 1",
      chassis: "living",
      locomotion: "legs",
      powerCore: "biocell",
      aiCore: "neural",
      stats: JSON.stringify({ speed: 4, strength: 3, endurance: 9, smarts: 5, adapt: 10 }),
      terrainScore: 4,
    },
  });

  await prisma.savedCreature.create({
    data: {
      userId: user.id,
      name: "Aquabot Coral",
      data: JSON.stringify({
        name: "Aquabot Coral",
        kind: "Ocean-cleaning living robot",
        mind: "A small AI brain that learns to tell plastic from sea life.",
        body: "Living coral skin that heals itself and grows with the reef.",
        frame: "Soft robotic arms and tiny propellers that glide between the rocks.",
        power: "It collects tiny pieces of plastic and stores them safely inside itself.",
        weakness: "It needs clean, warm water and can lose its way in strong currents.",
        real: "Some robots already collect floating rubbish from harbours.",
        mix: { ai: 30, bio: 40, robo: 30 },
      }),
    },
  });

  console.log("[seed] demo account created");
}

main()
  .catch((e) => console.error("[seed] failed", e))
  .finally(() => prisma.$disconnect());