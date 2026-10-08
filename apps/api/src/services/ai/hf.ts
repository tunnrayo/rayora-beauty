import * as hf from "@huggingface/inference";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http.js";

export const DEFAULT_IMAGE_MODEL = "black-forest-labs/FLUX.1-schnell";
export const DEFAULT_CHAT_MODEL = "meta-llama/Llama-3.1-8B-Instruct";

export const ASPECTS = {
  "1:1": { width: 1024, height: 1024 },
  "4:5": { width: 896, height: 1120 },
  "3:4": { width: 896, height: 1152 },
  "16:9": { width: 1344, height: 768 },
} as const;
export type Aspect = keyof typeof ASPECTS;

// The package is loaded loosely so the server still starts if its typings change between versions.
function client(): any {
  if (!env.HF_TOKEN) {
    throw new HttpError(503, "Hugging Face is not set up yet. Add HF_TOKEN in the server settings.");
  }
  const Ctor = (hf as any).InferenceClient ?? (hf as any).HfInference;
  return new Ctor(env.HF_TOKEN);
}

function friendlyError(err: unknown): HttpError {
  const message = String((err as { message?: string })?.message ?? err).toLowerCase();
  console.error("Hugging Face error:", message.slice(0, 300));
  if (message.includes("401") || message.includes("unauthorized") || message.includes("invalid token"))
    return new HttpError(502, "Hugging Face did not accept the access token. Check HF_TOKEN.");
  if (message.includes("402") || message.includes("credit") || message.includes("quota"))
    return new HttpError(502, "The Hugging Face account has run out of free credits. Add credits or try again later.");
  if (message.includes("429") || message.includes("rate"))
    return new HttpError(429, "Hugging Face is busy right now. Please wait a minute and try again.");
  if (message.includes("not found") || message.includes("404") || message.includes("not supported"))
    return new HttpError(502, "That image model is not available. Check HF_IMAGE_MODEL.");
  return new HttpError(502, "Image generation failed. Please try again in a moment.");
}

export async function generateImage(prompt: string, aspect: Aspect): Promise<{ data: Buffer; mime: string }> {
  const c = client();
  try {
    const size = ASPECTS[aspect];
    const result = await c.textToImage(
      {
        provider: "auto",
        model: env.HF_IMAGE_MODEL || DEFAULT_IMAGE_MODEL,
        inputs: prompt,
        parameters: { width: size.width, height: size.height },
      },
      { outputType: "blob" }
    );
    if (!(result instanceof Blob)) throw new Error("unexpected response");
    return { data: Buffer.from(await result.arrayBuffer()), mime: result.type || "image/png" };
  } catch (err) {
    throw friendlyError(err);
  }
}

export async function chat(system: string, user: string): Promise<string> {
  const c = client();
  try {
    const result = await c.chatCompletion({
      provider: "auto",
      model: env.HF_CHAT_MODEL || DEFAULT_CHAT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 350,
      temperature: 0.5,
    });
    const text = result?.choices?.[0]?.message?.content;
    if (!text) throw new Error("empty");
    return String(text).trim();
  } catch (err) {
    throw friendlyError(err);
  }
}
