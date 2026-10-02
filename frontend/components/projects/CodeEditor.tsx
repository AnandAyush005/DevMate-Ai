"use client";

import { Editor } from "@monaco-editor/react";
import type { Dispatch, SetStateAction } from "react";

type CodeEditorState = Dispatch<
  SetStateAction<{ name: string; content: string }>
>;

type CodeEditorProps = {
    selectedFile: { name: string; content: string };
  language?: string;
  setSelectedFile: CodeEditorState;
  files: { name: string; content: string }[];
  setFiles: Dispatch<SetStateAction<{ name: string; content: string }[]>>;
};

export default function CodeEditor({
  selectedFile ,
  language,
  setSelectedFile,
  files,
  setFiles,
}: CodeEditorProps) {

  return (

    <div className="h-full w-full">
      <Editor
        height="100%"
        width="100%"
        value={selectedFile.content}
        language={language || "javascript"}
        onChange={
            (value)=>{

                setSelectedFile((prev) => ({
                    ...prev,
                    content: value || "",
                }));

                setFiles((prevFiles) =>
                    prevFiles.map((f) =>
                        f.name === selectedFile.name ? { ...f, content: value || "" } : f
                    )
                );
            }
        }
      />
    </div>
  );
}