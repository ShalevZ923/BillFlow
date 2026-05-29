import OpenAI from "openai";
import { z } from "zod";
import { getEnv } from "@/lib/env";

export async function generateStructuredResponse<T>(input: {
  system: string;
  user: string;
  schema: z.ZodSchema<T>;
  model?: OpenAI;
}): Promise<T> {
  const env = getEnv();
  const client = input.model ?? new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `${input.system}\n\nRespond with valid JSON only.` },
      { role: "user", content: input.user }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 1000
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty AI response");
  }

  const parsed = input.schema.parse(JSON.parse(content));
  return parsed;
}
