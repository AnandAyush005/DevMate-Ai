"use client";

import { Editor } from "@monaco-editor/react";
import type { Dispatch, SetStateAction } from "react";
import { getLanguageFromFileName } from "./language";

type CodeEditorState = Dispatch<
  SetStateAction<{ name: string; content: string }>
>;

type CodeEditorProps = {
selectedFile: { name: string; content: string };
  setSelectedFile: CodeEditorState;
  files: { name: string; content: string }[];
  setFiles: Dispatch<SetStateAction<{ name: string; content: string }[]>>;
};

export default function CodeEditor({
  selectedFile ,
  setSelectedFile,
  files,
  setFiles,
}: CodeEditorProps) {

  return (

    <div className="h-full w-full">
      <Editor
        height="100%"
        width="100%"
        theme="hc-black"
        value={selectedFile.content}
        language={getLanguageFromFileName(selectedFile.name) }
        onChange={
            (value)=>{

                setSelectedFile((prev) => ({
                    ...prev,
                    content: value ?? "",
                }));

                setFiles((prevFiles) =>
                    prevFiles.map((f) =>
                        f.name === selectedFile.name ? { ...f, content: value ?? "" } : f
                    )
                );
            }
        }
      />
    </div>
  );
}