"use client";

import axios from "axios";
import { useGetProjectbyId } from "@/hooks/useGetProjects";
import { fileTreeValues } from "./constants";
import FileTree from "./FileTree";
import { useState } from "react";
import { FileTreeNode } from "./FileTree";

export default function ProjectWorkspace({
  projectId,
}: {
  projectId: string;
}) {
  const { data, isLoading, isError, error } = useGetProjectbyId(projectId);

  const [selectedFile, setSelectedFile] = useState({
    name : "",
    content : ""
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading project...</p>
      </div>
    );
  }

  if (isError) {
    if (axios.isAxiosError(error)) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <p>
            {error.response?.data?.error?.message ||
              "Failed to load project"}
          </p>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Failed to load project</p>
      </div>
    );
  }

  const project = data?.data;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div>
          <h1 className="font-semibold">
            {project?.name || "Untitled Project"}
          </h1>
        </div>

        <button className="rounded-md border px-3 py-1.5 text-sm">
          Settings
        </button>
      </header>

      {/* Workspace */}
      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* File Explorer */}
        <aside className="flex h-64 w-full shrink-0 flex-col border-b lg:h-full lg:w-64 lg:border-b-0 lg:border-r">
          <div className="flex h-10 items-center border-b px-4">
            <span className="text-sm font-medium">Files</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
              {fileTreeValues.map((node) => (
                <FileTree
                  key={node.name}
                  node={node as FileTreeNode}
                  onSelectedFile={setSelectedFile}
                  selectedFile={selectedFile}
                />
              ))}
          </div>
        </aside>

        {/* Editor Area */}
        <section className="flex min-h-0 flex-1 flex-col">
          {/* Editor Header */}
          <div className="flex h-10 shrink-0 items-center border-b px-4">
            <span className="text-sm text-zinc-400">
              {selectedFile.name || "No file selected"}
            </span>
          </div>

          {/* Code Editor */}
          <div className="min-h-0 flex-1 overflow-auto p-4">
            <p className="text-sm text-zinc-500">
              {selectedFile.content || "No content to display"}
            </p>
          </div>

          {/* AI Input */}
          <div className="shrink-0 border-t p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask DevMate..."
                className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
              />

              <button className="rounded-md border px-4 py-2 text-sm">
                Send
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}