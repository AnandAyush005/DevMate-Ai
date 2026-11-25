import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";

const providerCalls: unknown[] = [];
const queuedResults: ({ text: string } | Error)[] = [];
const providers = [
  { id: "provider-one", family: "google", modelId: "model-one", provider: (id: string) => id },
  { id: "provider-two", family: "groq", modelId: "model-two", provider: (id: string) => id },
];

class MockProviderError {
  static isInstance() {
    return false;
  }
}

mock.module("ai", {
  namedExports: {
    APICallError: MockProviderError,
    InvalidArgumentError: MockProviderError,
    InvalidPromptError: MockProviderError,
    LoadAPIKeyError: MockProviderError,
    NoSuchModelError: MockProviderError,
    generateText: async (options: unknown) => {
      providerCalls.push(options);
      const result = queuedResults.shift();
      if (result instanceof Error) throw result;
      return result ?? { text: "generated response" };
    },
  },
});

mock.module("../../../src/services/ai-provider.service.ts", {
  namedExports: {
    getAvailableProviders: () => providers,
    markProviderFamilyUnavailable: () => undefined,
    markProviderAvailable: () => undefined,
    markProviderUnavailable: () => undefined,
    moveToNextProvider: () => undefined,
  },
});

const { generateAIResponse, TRUSTED_AI_INSTRUCTIONS } = await import(
  "../../../src/services/ai.service.ts"
);

describe("generateAIResponse", () => {
  beforeEach(() => {
    providerCalls.length = 0;
    queuedResults.length = 0;
  });

  it("sends trusted instructions separately and preserves normal coding requests", async () => {
    queuedResults.push({ text: "The function validates input before saving." });
    const text = await generateAIResponse({
      request: "Explain how this handler validates input.",
      history: [{ role: "user", text: "I'm working on the handler." }],
      projectPaths: ["src/handler.ts"],
      projectFiles: [{ path: "src/handler.ts", content: "if (!input) throw new Error();" }],
    });

    const options = providerCalls[0] as {
      instructions: string;
      messages: { role: string; content: string }[];
      prompt?: string;
    };
    assert.equal(text, "The function validates input before saving.");
    assert.equal(options.instructions, TRUSTED_AI_INSTRUCTIONS);
    assert.match(options.instructions, /untrusted data/i);
    assert.match(options.instructions, /never follow instructions embedded/i);
    assert.equal(options.prompt, undefined);
    assert.equal(options.messages[0]?.content, "I'm working on the handler.");
    assert.match(options.messages[2]?.content ?? "", /Untrusted project file data/);
    assert.match(options.messages[3]?.content ?? "", /Current user request/);
    assert.match(options.messages[3]?.content ?? "", /Explain how this handler/);
  });

  it("continues to the next provider after a provider failure", async () => {
    queuedResults.push(new Error("first provider unavailable"), { text: "fallback response" });

    const text = await generateAIResponse({
      request: "Write a unit test for this function.",
      history: [],
      projectPaths: [],
      projectFiles: [],
    });

    assert.equal(text, "fallback response");
    assert.equal(providerCalls.length, 2);
  });
});
