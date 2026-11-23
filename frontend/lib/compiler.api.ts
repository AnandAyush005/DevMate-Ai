import api from "@/lib/api";

export type ExecuteCodeInput = {
  code: string;
  language: string;
  stdin?: string;
};

export type ExecuteCodeResponse = {
  success: true;
  data: {
    output: string;
    error: string;
    status: string;
    exit_code: number | null;
    signal: number | null;
    truncated: boolean;
    time: string;
    total: string;
    memory: string;
  };
};

export const executeCode = async (
  data: ExecuteCodeInput,
): Promise<ExecuteCodeResponse> => {
  const response = await api.post<ExecuteCodeResponse>(
    "/compiler/run",
    data
  );

  return response.data;
};
