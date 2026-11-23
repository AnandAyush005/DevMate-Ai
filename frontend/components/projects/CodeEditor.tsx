"use client";

import { Editor } from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
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
  setFiles: Dispatch<SetStateAction<WorkspaceFile[]>>;
  onSelectionChange: (selection: string) => void;
};

export default function CodeEditor({
  selectedFile,
  setSelectedFile,
  setFiles,
  onSelectionChange,
}: CodeEditorProps) {
  
   const handleEditorMount: OnMount = (editorInstance) => {
      editorInstance.onDidChangeCursorSelection(() => {
        const selection = editorInstance.getSelection();

        if (!selection || selection.isEmpty()) {
          onSelectionChange("");
          return;
        }

        const selectedText = editorInstance.getModel()?.getValueInRange(selection) ?? "";

        onSelectionChange(selectedText);
      });
    };

  if (!selectedFile) {

    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
        Select a file to start editing
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-white/[0.05]">
      <Editor
        height="100%"
        width="100%"
        theme="vs-dark"
        value={selectedFile.content}
        onMount={handleEditorMount}
        language={getLanguageFromFileName(selectedFile.name)}
        options={{
          automaticLayout: true,
          fontSize: 13,
          lineHeight: 22,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
        }}
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