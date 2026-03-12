import Anthropic from "@anthropic-ai/sdk";

const key = process.env.ANTHROPIC_API_KEY;
if (!key || key === "your-anthropic-api-key") {
  console.warn(
    "[brand-intelligence] ANTHROPIC_API_KEY is not set. AI features (generate, import) will fail until you add a real key to .env"
  );
}

export const anthropic = new Anthropic({
  apiKey: key,
});

const EXTRACTION_PROMPT = `You are a brand intelligence extraction specialist. Analyse this brand guidelines document and extract all brand information into a structured JSON object.

Extract and structure the following categories where present:
- logoSystem: logo types, variants, usage rules, clear space, minimum sizes, restrictions
- colourSystem: all palettes with hex/RGB/CMYK/Pantone values, usage rules, accessibility notes
- typography: typefaces, roles, weights, hierarchy rules, usage guidelines
- photography: style, mood, composition, colour treatment, lighting, subjects, do/don't lists
- illustration: style, technique, line weight, colour application, subjects, do/don't lists
- motion: principles, character, easing, duration tokens, transition types, do/don't lists
- iconography: style, grid size, stroke weight, corner radius, usage rules
- gridLayout: grid system, spacing scale, layout principles, composition rules
- pattern: graphic devices, pattern style, texture notes, usage rules
- brandVoice: personality traits, tone variants, messaging hierarchy, vocabulary rules, do/don't lists

Return ONLY valid JSON. For any category not present in the document, use null.
For arrays like doList and dontList, extract specific actionable rules.
For colour values, always include hex. Add other formats (RGB, CMYK, Pantone) if present.`;

export async function extractBrandGuidelinesFromPDF(
  pdfBase64: string,
  brandName: string
): Promise<Record<string, unknown>> {
  const message = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
          } as any,
          { type: "text", text: `Brand name: "${brandName}"\n\n${EXTRACTION_PROMPT}` },
        ],
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");

  return JSON.parse(jsonMatch[0]);
}

export async function extractBrandGuidelinesFromText(
  text: string,
  brandName: string
): Promise<Record<string, unknown>> {
  const message = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Brand name: "${brandName}"\n\n${EXTRACTION_PROMPT}\n\nDocument text:\n${text}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");

  return JSON.parse(jsonMatch[0]);
}

export async function generateBrandConfig(brand: {
  name: string;
  logoSystem?: Record<string, unknown> | null;
  colourSystem?: Record<string, unknown> | null;
  typography?: Record<string, unknown> | null;
  photography?: Record<string, unknown> | null;
  illustration?: Record<string, unknown> | null;
  motion?: Record<string, unknown> | null;
  iconography?: Record<string, unknown> | null;
  gridLayout?: Record<string, unknown> | null;
  pattern?: Record<string, unknown> | null;
  brandVoice?: Record<string, unknown> | null;
}): Promise<Record<string, unknown>> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `You are a brand intelligence synthesist. Given the following brand system data for "${brand.name}", generate a comprehensive machine-readable Brand Intelligence Config.

Brand Data:
${JSON.stringify(brand, null, 2)}

Generate a structured Brand Intelligence Config JSON with these sections:

1. "meta": brand name, version, generated timestamp
2. "identity": distilled visual identity descriptors for AI image generation
3. "imageGenPrompts": optimised prompts for:
   - "midjourney": style reference string with --ar, --style, --v params
   - "dalle": detailed DALL-E 3 system prompt
   - "firefly": Adobe Firefly style descriptor
   - "photography": photography-specific generation prompt
   - "illustration": illustration-specific generation prompt
4. "llmSystemPrompts":
   - "full": complete system prompt for LLM assistants covering brand voice, visual rules, usage
   - "concise": shortened version for context-limited use
   - "imageContext": visual brand context block for multimodal LLMs
5. "designTokens":
   - "colours": all brand colours as CSS custom properties and JSON tokens
   - "typography": font stack, scale tokens
   - "spacing": spacing scale tokens
   - "motion": easing and duration tokens
6. "universalConfig": complete structured brand data optimised for API consumption

Return ONLY valid JSON.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");

  return JSON.parse(jsonMatch[0]);
}

export async function generatePlatformPrompt(
  brandConfig: Record<string, unknown>,
  platform: "midjourney" | "dalle" | "claude" | "chatgpt" | "firefly" | "canva"
): Promise<string> {
  const platformInstructions: Record<string, string> = {
    midjourney:
      "Generate an optimised Midjourney prompt string with style parameters (--ar, --style, --v 6, --stylize). Include visual descriptors, colour references, mood, and photography/illustration style.",
    dalle:
      "Generate a DALL-E 3 optimised prompt. Be descriptive and specific about visual style, composition, colours, and mood. Include negative space guidance.",
    claude:
      "Generate a comprehensive Claude system prompt that covers: brand voice and tone, visual brand guidelines the model should reference when describing images to generate, usage rules, and example language patterns.",
    chatgpt:
      "Generate a ChatGPT system prompt covering brand voice, messaging guidelines, tone variants by context, vocabulary preferences, and content creation rules.",
    firefly:
      "Generate an Adobe Firefly style descriptor optimised for the Firefly generative model. Include visual style, colour mood, composition style, and subject guidance.",
    canva:
      "Generate a Canva AI brand style description covering colour palette (with hex values), typography guidance, visual style, and composition principles for use in Canva's AI tools.",
  };

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Using this brand config:
${JSON.stringify(brandConfig, null, 2)}

${platformInstructions[platform]}

Return only the prompt/system prompt text, no explanation.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  return content.text.trim();
}
