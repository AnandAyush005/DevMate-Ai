import { z } from "zod";
import { env } from "../config/env.js";
import type { ExecuteCodeInput } from "../schemas/compiler.schema.js";
import { ApiError } from "../utils/api-error.js";

export interface OnlineCompilerResponse {
  output: string;
  error: string;
  status: string;
  exit_code: number | null;
  signal: number | null;
  truncated: boolean;
  time: string;
  total: string;
  memory: string;
}

const compilerMapping = {
  python: "python-3.14",
  javascript: "nodejs-24",
  typescript: "typescript-deno",
  c: "gcc-15",
  cpp: "g++-15",
  java: "openjdk-25",
  go: "go-1.26",
  rust: "rust-1.93",
  php: "php-8.5"
} as const;

const onlineCompilerResponseSchema = z.object({
  output: z.string(),
  error: z.string(),
  status: z.string(),
  exit_code: z.number().nullable(),
  signal: z.number().nullable(),
  truncated: z.boolean(),
  time: z.string(),
  total: z.string(),
  memory: z.string(),
});

const resolveCompiler = (language: string): string | undefined => {
  if (Object.prototype.hasOwnProperty.call(compilerMapping, language)) {
    return compilerMapping[
      language as keyof typeof compilerMapping
    ];
  }

  return undefined;
};

export const executeCode = async (
  data: ExecuteCodeInput,
): Promise<OnlineCompilerResponse> => {
  const compiler = resolveCompiler(data.language);

  if (!compiler) {
    throw new ApiError(
      400,
      "UNSUPPORTED_LANGUAGE",
      "The requested programming language is not supported.",
    );
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => {
    abortController.abort();
  }, 35_000);

  let upstreamData: unknown;

  try {
    const response = await fetch(
      "https://api.onlinecompiler.io/api/run-code-sync/",
      {
        method: "POST",
        headers: {
          "Authorization": env.onlineCompiler.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          compiler,
          code: data.code,
          input: data.stdin ?? "",
        }),
        signal: abortController.signal,
      },
    );

    if (response.status === 429) {
      throw new ApiError(
        429,
        "COMPILER_RATE_LIMITED",
        "The code execution service is receiving too many requests.",
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new ApiError(
        500,
        "COMPILER_NOT_CONFIGURED",
        "The code execution service is not configured correctly.",
      );
    }

    if (!response.ok) {
      throw new ApiError(
        502,
        "COMPILER_GATEWAY_ERROR",
        "The code execution service failed to process the request.",
      );
    }

    try {
      upstreamData = await response.json();
    } catch (error) {
      if (abortController.signal.aborted) {
        throw error;
      }

      throw new ApiError(
        502,
        "COMPILER_INVALID_RESPONSE",
        "The code execution service returned an invalid response.",
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (abortController.signal.aborted) {
      throw new ApiError(
        504,
        "COMPILER_TIMEOUT",
        "The code execution request timed out.",
      );
    }

    throw new ApiError(
      502,
      "COMPILER_NETWORK_ERROR",
      "The code execution service could not be reached.",
    );
  } finally {
    clearTimeout(timeout);
  }

  const parsed = onlineCompilerResponseSchema.safeParse(upstreamData);

  if (!parsed.success) {
    throw new ApiError(
      502,
      "COMPILER_INVALID_RESPONSE",
      "The code execution service returned an invalid response.",
    );
  }

  return parsed.data;
};
