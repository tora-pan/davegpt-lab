import { randomUUID } from "crypto";
import OpenAI from "openai";
import type { ChatRequest, ChatResponse } from "../schemas/chat";
import type { ChatStreamEvent } from "../types/chat";
import { ensureConversation, loadHistory, saveMessage } from "../db/conversations";
import { executeTool, toOpenAiTools } from "./tools";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT =
  "You are DaveGPT, a helpful financial assistant. Answer clearly and concisely.";

const MAX_TOOL_ROUNDTRIPS = 4;

export const chatOrchestrator = {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const conversationId = request.conversationId ?? randomUUID();
    const start = Date.now();

    await ensureConversation(conversationId);
    const history = await loadHistory(conversationId);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role, content: m.content }) as OpenAI.Chat.ChatCompletionMessageParam),
      { role: "user", content: request.message },
    ];
    await saveMessage(conversationId, "user", request.message);

    const toolsUsed: string[] = [];
    let completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: toOpenAiTools(),
    });
    let choice = completion.choices[0];

    for (let i = 0; i < MAX_TOOL_ROUNDTRIPS && choice?.message.tool_calls?.length; i++) {
      messages.push(choice.message);

      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type !== "function") continue;

        const args = JSON.parse(toolCall.function.arguments || "{}");
        const result = await executeTool(toolCall.function.name, args);
        toolsUsed.push(toolCall.function.name);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        tools: toOpenAiTools(),
      });
      choice = completion.choices[0];
    }

    const message = choice?.message?.content ?? "";
    if (message) {
      await saveMessage(conversationId, "assistant", message);
    }

    return {
      conversationId,
      message,
      usage: completion.usage
        ? {
            promptTokens: completion.usage.prompt_tokens,
            completionTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
          }
        : undefined,
      latencyMs: Date.now() - start,
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
    };
  },

  async *chatStream(request: ChatRequest): AsyncGenerator<ChatStreamEvent> {
    const conversationId = request.conversationId ?? randomUUID();

    yield { type: "start", conversationId };

    await ensureConversation(conversationId);
    const history = await loadHistory(conversationId);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role, content: m.content }) as OpenAI.Chat.ChatCompletionMessageParam),
      { role: "user", content: request.message },
    ];
    await saveMessage(conversationId, "user", request.message);

    let fullContent = "";

    for (let round = 0; round < MAX_TOOL_ROUNDTRIPS; round++) {
      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        stream: true,
        stream_options: { include_usage: true },
        messages,
        tools: toOpenAiTools(),
      });

      let finishReason: string | null = null;
      const toolCalls: Record<
        number,
        { id: string; name: string; arguments: string }
      > = {};

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
          fullContent += delta.content;
          yield { type: "token", content: delta.content };
        }

        for (const toolCallDelta of delta?.tool_calls ?? []) {
          const acc = (toolCalls[toolCallDelta.index] ??= {
            id: "",
            name: "",
            arguments: "",
          });
          if (toolCallDelta.id) acc.id = toolCallDelta.id;
          if (toolCallDelta.function?.name) acc.name += toolCallDelta.function.name;
          if (toolCallDelta.function?.arguments) {
            acc.arguments += toolCallDelta.function.arguments;
          }
        }

        if (chunk.choices[0]?.finish_reason) {
          finishReason = chunk.choices[0].finish_reason;
        }

        if (chunk.usage) {
          yield {
            type: "usage",
            usage: {
              promptTokens: chunk.usage.prompt_tokens,
              completionTokens: chunk.usage.completion_tokens,
              totalTokens: chunk.usage.total_tokens,
            },
          };
        }
      }

      const pendingToolCalls = Object.values(toolCalls);
      if (finishReason !== "tool_calls" || pendingToolCalls.length === 0) {
        break;
      }

      messages.push({
        role: "assistant",
        tool_calls: pendingToolCalls.map((toolCall) => ({
          id: toolCall.id,
          type: "function",
          function: { name: toolCall.name, arguments: toolCall.arguments },
        })),
      });

      for (const toolCall of pendingToolCalls) {
        const args = JSON.parse(toolCall.arguments || "{}");
        const result = await executeTool(toolCall.name, args);

        yield { type: "tool_call", name: toolCall.name };

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }

    if (fullContent) {
      await saveMessage(conversationId, "assistant", fullContent);
    }

    yield { type: "done" };
  },
};
