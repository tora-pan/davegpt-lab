import type OpenAI from "openai";

interface ToolDefinition<Args = any> {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Args) => Promise<unknown>;
}

const MOCK_BALANCES = {
  checking: 1284.53,
  savings: 6120.0,
} as const;

type AccountType = keyof typeof MOCK_BALANCES;

export const tools: ToolDefinition[] = [
  {
    name: "getAccountBalance",
    description: "Get the user's current balance for a given account type.",
    parameters: {
      type: "object",
      properties: {
        accountType: {
          type: "string",
          enum: ["checking", "savings"],
          description: "Which account to check the balance for.",
        },
      },
      required: ["accountType"],
      additionalProperties: false,
    },
    async execute({ accountType }: { accountType: AccountType }) {
      return { accountType, balance: MOCK_BALANCES[accountType] };
    },
  },
];

export function toOpenAiTools(): OpenAI.Chat.ChatCompletionTool[] {
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

export async function executeTool(name: string, args: unknown): Promise<unknown> {
  const tool = tools.find((t) => t.name === name);
  if (!tool) {
    return { error: `Unknown tool: ${name}` };
  }
  return tool.execute(args);
}
