// src/schemas/chat.ts

import { z } from 'zod'

export const chatRequestSchema = z.object({
  conversationId: z.uuid().optional(),
  message: z.string().min(1).max(4000),
})

export const chatResponseSchema = z.object({
  conversationId: z.uuid(),
  message: z.string(),
  usage: z
    .object({
      promptTokens: z.number(),
      completionTokens: z.number(),
      totalTokens: z.number(),
    })
    .optional(),
  latencyMs: z.number().optional(),
  toolsUsed: z.array(z.string()).optional(),
})

export type ChatRequest = z.infer<typeof chatRequestSchema>
export type ChatResponse = z.infer<typeof chatResponseSchema>