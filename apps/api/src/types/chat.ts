export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  createdAt?: Date;
}

export interface ConversationContext {
  conversationId: string;
  messages: ChatMessage[];
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatResult {
  message: string;
  model: string;
  latencyMs: number;
  usage?: TokenUsage;
  toolsUsed?: string[];
}

export type ChatStreamEvent =
  | { type: 'start'; conversationId: string }
  | { type: 'token'; content: string }
  | { type: 'tool_call'; name: string }
  | { type: 'usage'; usage: TokenUsage }
  | { type: 'done' }
  | { type: 'error'; error: string };