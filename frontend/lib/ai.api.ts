import api from "@/lib/api";

export type GenerateAIResponse = {
  success: true;
  data: {
    text: string;
  };
};

export const generateAIResponse = async (
  prompt: string,
): Promise<GenerateAIResponse> => {
  const response = await api.post<GenerateAIResponse>("/ai/generate", {
    prompt,
  });

  return response.data;
};
