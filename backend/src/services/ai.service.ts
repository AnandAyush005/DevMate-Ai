
import { generateText } from "ai";
import {
  getAvailableProviders,
  markProviderAvailable,
  markProviderUnavailable,
} from "./ai-provider.service.ts";

const isRetryableError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const errorDetails = error as {
    statusCode?: number;
    isRetryable?: boolean;
  };

  const statusCode = errorDetails.statusCode;

  return (
    errorDetails.isRetryable === true ||
    statusCode === 408 ||
    statusCode === 429 ||
    (typeof statusCode === "number" && statusCode >= 500)
  );
};

export const generateAIResponse = async (
  prompt: string,
): Promise<string> => {
  const availableProviders = getAvailableProviders();

  if (availableProviders.length === 0) {
    throw new Error("No AI providers are currently available.");
  }

  for (const entry of availableProviders) {
    try {
      const result = await generateText({
        model: entry.provider(entry.modelId),
        prompt,
        maxRetries: 0,
      });

      markProviderAvailable(entry.id);

      return result.text;
    } catch (error) {
      if (!isRetryableError(error)) {
        throw error;
      }

      markProviderUnavailable(entry.id);
    }
  }

  throw new Error(
    "All configured AI providers are temporarily unavailable. Please try again later.",
  );
};
