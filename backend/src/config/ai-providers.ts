import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

const geminiApiKeys = [
  process.env["GEMINI_API_KEY_1"],
  process.env["GEMINI_API_KEY_2"],
].filter((key): key is string => Boolean(key?.trim()));

const groqApiKeys = [
  process.env["GROQ_API_KEY_1"],
  process.env["GROQ_API_KEY_2"],
].filter((key): key is string => Boolean(key?.trim()));

export const googleProviders = geminiApiKeys.map((apiKey, index) => ({
  id: `gemini-${index + 1}`,
  provider: createGoogleGenerativeAI({ apiKey }),
  modelId: "gemini-3.8-flash",
}));

export const groqProviders = groqApiKeys.map((apiKey, index) => ({
  id: `groq-${index + 1}`,
  provider: createGroq({ apiKey }),
  modelId: "openai/gpt-oss-20b",
}));