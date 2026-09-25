import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

const snapInput = z.object({ caption: z.string().max(120).default(""), imageUrl: z.string().min(1), mood: z.string().max(8).default("💛") });
const now = new Date();

export const snapRouter = createTRPCRouter({
  seed: publicProcedure.query(() => ({
    couple: { name: "Kane × Love", inviteCode: "DUO-2509", streak: 14, privacy: "Chỉ hai người thấy được" },
    snaps: [
      { id: "seed-1", author: "partner" as const, caption: "Nhớ uống nước nhaaa", imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=80", mood: "💗", reactions: 7, createdAt: new Date(now.getTime() - 1440000).toISOString() },
      { id: "seed-2", author: "me" as const, caption: "Một góc nhỏ cho hai đứa mình", imageUrl: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=900&q=80", mood: "✨", reactions: 4, createdAt: new Date(now.getTime() - 5100000).toISOString() },
    ],
  })),
  createLocalPreview: publicProcedure.input(snapInput).mutation(({ input }) => ({
    id: crypto.randomUUID(),
    author: "me" as const,
    caption: input.caption,
    imageUrl: input.imageUrl,
    mood: input.mood,
    reactions: 0,
    createdAt: new Date().toISOString(),
  })),
});
