"use client";

import { Editor } from "@monaco-editor/react";
import type { Dispatch, SetStateAction } from "react";
import { getLanguageFromFileName } from "./language";

type WorkspaceFile = {
  id: string;
  name: string;
  path: string;
  content: string;
};

type CodeEditorProps = {
  selectedFile: WorkspaceFile | null;
  setSelectedFile: Dispatch<SetStateAction<WorkspaceFile | null>>;
  files: WorkspaceFile[];
  setFiles: Dispatch<SetStateAction<WorkspaceFile[]>>;
};

export default function CodeEditor({
  selectedFile,
  setSelectedFile,
  files,
  setFiles,
}: CodeEditorProps) {
  if (!selectedFile) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
        Select a file to start editing
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        width="100%"
        theme="hc-black"
        value={selectedFile.content}
        language={getLanguageFromFileName(selectedFile.name)}
        onChange={(value) => {
          const content = value ?? "";

          setSelectedFile((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              content,
            };
          });

          setFiles((prevFiles) =>
            prevFiles.map((file) =>
              file.id === selectedFile.id
                ? {
                    ...file,
                    content,
                  }
                : file
            )
          );
        }}
      />
    </div>
  );
}