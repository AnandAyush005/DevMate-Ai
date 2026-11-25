import api from "@/lib/api";

export type GenerateAIResponse = {
  success: true;
  data: {
    text: string;
  };
};

export type AIRequestPayload = {
  request: string;
  history: { role: "user" | "assistant"; text: string }[];
  projectPaths: string[];
  projectFiles: { path: string; content: string }[];
};

export const generateAIResponse = async (
  input: AIRequestPayload,
): Promise<GenerateAIResponse> => {
  const response = await api.post<GenerateAIResponse>("/ai/generate", {
    ...input,
  });

  return response.data;
};
