const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

interface GeneratedItem {
  description: string;
  details: string[];
}

export interface ExtractedQuotation {
  clientName: string;
  deliveryTime: string;
  items: Array<{
    description: string;
    details: string[];
    price: number;
    quantity: number;
  }>;
}

async function callGroq(systemPrompt: string, userContent: string, maxTokens = 400): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.4,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

export async function generateItemDescription(userInput: string): Promise<GeneratedItem> {
  const systemPrompt = `You are a professional quotation writer for a digital services agency.
When given a brief service description, generate a professional quotation line item.
Return ONLY valid JSON with exactly this structure:
{
  "description": "concise professional title (max 8 words)",
  "details": ["specific deliverable 1", "specific deliverable 2", "specific deliverable 3"]
}
Rules:
- description: clear, professional service title
- details: 3 to 5 specific deliverables or inclusions
- Keep it concise and client-facing
- Do NOT include pricing or quantities
- Return ONLY the JSON object, no markdown fences, no explanation`;

  const text = await callGroq(systemPrompt, userInput, 300);

  try {
    const parsed = JSON.parse(text);
    if (!parsed.description || !Array.isArray(parsed.details)) throw new Error('Invalid structure');
    return parsed as GeneratedItem;
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

export async function extractQuotationFromConversation(conversation: string): Promise<ExtractedQuotation> {
  const systemPrompt = `You are an expert at reading client conversations (WhatsApp, email, Slack, etc.) and extracting quotation data for a digital services agency.

Analyse the conversation and extract a complete quotation. Return ONLY valid JSON matching this exact structure:
{
  "clientName": "The client's name or company (use 'Client' if unclear)",
  "deliveryTime": "Estimated delivery time as mentioned, or '2-4 weeks' if not specified",
  "items": [
    {
      "description": "Professional service title (max 8 words)",
      "details": ["deliverable 1", "deliverable 2", "deliverable 3"],
      "price": 0,
      "quantity": 1
    }
  ]
}

Rules:
- Extract ALL distinct services or deliverables mentioned as separate line items
- If a price is mentioned for a service, use it. Otherwise set price to 0
- If a quantity is mentioned (e.g. "5 pages", "10 posts"), set it correctly; otherwise 1
- details should list specific inclusions or sub-tasks for each item (3-5 per item)
- Be generous — if something is implied as part of the project, include it
- clientName: use their first name or company name from the conversation
- Return ONLY the JSON object, no markdown, no explanation`;

  const text = await callGroq(systemPrompt, conversation, 1200);

  try {
    const parsed = JSON.parse(text);
    if (!parsed.items || !Array.isArray(parsed.items)) throw new Error('Invalid structure');
    // Ensure all items have required fields
    parsed.items = parsed.items.map((item: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      description: item.description ?? '',
      details: Array.isArray(item.details) ? item.details : [],
      price: typeof item.price === 'number' ? item.price : 0,
      quantity: typeof item.quantity === 'number' ? item.quantity : 1,
    }));
    return parsed as ExtractedQuotation;
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
