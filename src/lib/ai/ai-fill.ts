import { generateStructuredResponse } from "./client";
import { aiFillResponseSchema } from "./schemas";
import type { AiFillResponse } from "./schemas";

export async function generateFillSuggestion(text: string): Promise<AiFillResponse> {
  const system =
    "You extract bill information from user-provided text. " +
    "Return structured JSON with these fields: name, amount (as string like '120.50'), " +
    "currency (USD, EUR, GBP, or ILS), dueDate (YYYY-MM-DD), cycle (one-time, monthly, yearly, custom), " +
    "category, priority (low, medium, high, critical), tags (array of strings), notes. " +
    "If any field cannot be determined, use reasonable defaults: amount='0', currency='USD', " +
    "dueDate=today, cycle='one-time', category='Other', priority='medium', tags=[], notes=''.";

  return generateStructuredResponse({
    system,
    user: text,
    schema: aiFillResponseSchema
  });
}
