
import {
  APICallError,
  generateText,
  InvalidArgumentError,
  InvalidPromptError,
  LoadAPIKeyError,
  NoSuchModelError,
} from "ai";
import { ApiError } from "../utils/api-error.js";
import {
  getAvailableProviders,
  markProviderFamilyUnavailable,
  markProviderAvailable,
  markProviderUnavailable,
  moveToNextProvider,
} from "./ai-provider.service.ts";

type FailureCategory =
  | "invalid_request"
  | "model_configuration"
  | "provider_configuration"
  | "rate_limit_or_quota"
  | "temporary_http_failure"
  | "authentication_or_permission"
  | "server_error"
  | "retryable_provider_error"
  | "provider_error"
  | "network_error";

type FailureClassification = {
  category: FailureCategory;
  statusCode?: number;
  providerWideConfigurationError?: boolean;
  invalidRequest?: boolean;
};

const NETWORK_ERROR_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "EPIPE",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ENOTFOUND",
  "ENETUNREACH",
  "EHOSTUNREACH",
  "UND_ERR_BODY_TIMEOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
  "ERR_SOCKET_CONNECTION_TIMEOUT",
]);

const getErrorChain = (error: unknown): unknown[] => {
  const chain: unknown[] = [];
  const pending = [error];
  const seen = new Set<unknown>();

  while (pending.length > 0) {
    const current = pending.pop();
    if (
      !current ||
      typeof current !== "object" ||
      seen.has(current)
    ) {
      continue;
    }

    seen.add(current);
    chain.push(current);

    const nested = current as {
      cause?: unknown;
      errors?: unknown[];
      lastError?: unknown;
    };

    if (nested.cause) pending.push(nested.cause);
    if (nested.lastError) pending.push(nested.lastError);
    if (Array.isArray(nested.errors)) pending.push(...nested.errors);
  }

  return chain;
};

const isNetworkFailure = (errorChain: unknown[]): boolean =>
  errorChain.some((error) => {
    const details = error as {
      code?: unknown;
      message?: unknown;
    };

    if (
      typeof details.code === "string" &&
      NETWORK_ERROR_CODES.has(details.code)
    ) {
      return true;
    }

    return (
      typeof details.message === "string" &&
      ((error instanceof TypeError &&
        /fetch failed|network error/i.test(details.message)) ||
        /socket hang up|network socket disconnected|connection (?:reset|refused|timed out)/i.test(
          details.message,
        ))
    );
  });

const getApiCallError = (errorChain: unknown[]) =>
  errorChain.find((error) => APICallError.isInstance(error));

const isQuotaFailure = (error: APICallError): boolean =>
  /quota|resource[_\s-]?exhausted|billing|insufficient[_\s-]?quota/i.test(
    `${error.message} ${error.responseBody ?? ""}`,
  );

const classifyFailure = (error: unknown): FailureClassification => {
  const errorChain = getErrorChain(error);

  if (
    errorChain.some(
      (nested) =>
        InvalidPromptError.isInstance(nested) ||
        InvalidArgumentError.isInstance(nested),
    )
  ) {
    return { category: "invalid_request", invalidRequest: true };
  }

  if (errorChain.some((nested) => NoSuchModelError.isInstance(nested))) {
    return {
      category: "model_configuration",
      providerWideConfigurationError: true,
    };
  }

  if (errorChain.some((nested) => LoadAPIKeyError.isInstance(nested))) {
    return { category: "provider_configuration" };
  }

  const apiCallError = getApiCallError(errorChain);
  if (apiCallError) {
    const statusCode = apiCallError.statusCode;

    if ([400, 413, 415, 422].includes(statusCode ?? 0)) {
      return { category: "invalid_request", statusCode, invalidRequest: true };
    }

    if (statusCode === 404) {
      return {
        category: "model_configuration",
        statusCode,
        providerWideConfigurationError: true,
      };
    }

    if (statusCode === 429 || (statusCode === 403 && isQuotaFailure(apiCallError))) {
      return { category: "rate_limit_or_quota", statusCode };
    }

    if (statusCode === 408 || statusCode === 409) {
      return { category: "temporary_http_failure", statusCode };
    }

    if (statusCode === 401 || statusCode === 403) {
      return { category: "authentication_or_permission", statusCode };
    }

    if (typeof statusCode === "number" && statusCode >= 500) {
      return { category: "server_error", statusCode };
    }

    if (apiCallError.isRetryable) {
      return { category: "retryable_provider_error", statusCode };
    }

    return { category: "provider_error", statusCode };
  }

  if (isNetworkFailure(errorChain)) {
    return { category: "network_error" };
  }

  return { category: "provider_error" };
};

export const generateAIResponse = async (
  prompt: string,
): Promise<string> => {
  const availableProviders = getAvailableProviders();

  if (availableProviders.length === 0) {
    throw new ApiError(
      503,
      "AI_SERVICE_UNAVAILABLE",
      "The AI service is temporarily unavailable. Please try again later.",
    );
  }

  moveToNextProvider();

  const unavailableFamilies = new Set<string>();

  for (const entry of availableProviders) {
    if (unavailableFamilies.has(entry.family)) {
      continue;
    }

    try {
      const result = await generateText({
        model: entry.provider(entry.modelId),
        prompt,
        maxRetries: 0,
      });

      markProviderAvailable(entry.id);

      return result.text;
    } catch (error) {
      const failure = classifyFailure(error);

      console.error("[AI] Provider request failed", {
        providerId: entry.id,
        category: failure.category,
        ...(failure.statusCode === undefined
          ? {}
          : { statusCode: failure.statusCode }),
      });

      if (failure.invalidRequest) {
        throw new ApiError(
          400,
          "INVALID_AI_REQUEST",
          "The AI request could not be processed.",
        );
      }

      if (failure.providerWideConfigurationError) {
        unavailableFamilies.add(entry.family);
        markProviderFamilyUnavailable(entry.family);
      }

      markProviderUnavailable(entry.id);
    }
  }

  throw new ApiError(
    503,
    "AI_SERVICE_UNAVAILABLE",
    "The AI service is temporarily unavailable. Please try again later.",
  );
};
