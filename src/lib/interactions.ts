import { prisma } from "@/lib/prisma";

export type InteractionType =
  | "SIGNED_UP"
  | "LOGGED_IN"
  | "DEMO_VIEWED"
  | "NETWORK_TRAINED"
  | "EXPERIMENT_SAVED"
  | "ROBOT_SAVED"
  | "EVENT_BOOKMARKED"
  | "PROFILE_UPDATED"
  | "PASSWORD_CHANGED";

/** Adds a line to the user's activity history. Never crashes the caller. */
export async function logInteraction(
  userId: string,
  type: InteractionType,
  label: string,
  demo?: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await prisma.interaction.create({
      data: {
        userId,
        type,
        label,
        demo: demo ?? null,
        metadata: JSON.stringify(metadata ?? {}),
      },
    });
  } catch (error) {
    console.error("Failed to log interaction:", error);
  }
}