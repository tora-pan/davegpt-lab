import { asc, eq } from "drizzle-orm";
import type { ChatRole } from "../types/chat";
import { db } from "./client";
import { conversations, messages } from "./schema";

export async function ensureConversation(conversationId: string): Promise<void> {
  await db.insert(conversations).values({ id: conversationId }).onConflictDoNothing();
}

export async function loadHistory(
  conversationId: string,
): Promise<Array<{ role: ChatRole; content: string }>> {
  const rows = await db
    .select({ role: messages.role, content: messages.content })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.id));

  return rows.map((row) => ({ role: row.role as ChatRole, content: row.content }));
}

export async function saveMessage(
  conversationId: string,
  role: ChatRole,
  content: string,
): Promise<void> {
  await db.insert(messages).values({ conversationId, role, content });
}
