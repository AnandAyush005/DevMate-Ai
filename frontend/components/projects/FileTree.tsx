"use client";

import { File, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";

export type FileTreeNode = {
  type: "file" | "folder";
  id?: string;
  name: string;
  path?: string;
  children?: FileTreeNode[];
};

type SelectedFile = {
  id: string;
  name: string;
  path: string;
  content: string;
};

type FileTreeProps = {
  node: FileTreeNode;
  level?: number;
  onSelectedFile: (file: {
    id: string;
    name: string;
    path: string;
  }) => void;
  selectedFile?: SelectedFile;
};

export default function FileTree({
  node,
  level = 0,
  onSelectedFile,
  selectedFile,
}: FileTreeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (node.type === "file") {
    return (
      <div
        className={`group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-zinc-800 ${
          selectedFile?.id === node.id
            ? "bg-zinc-800 text-white"
            : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (!node.id || !node.path) return;

          onSelectedFile({
            id: node.id,
            name: node.name,
            path: node.path,
          });
        }}
      >
        <File className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-white" />

        <span className="truncate group-hover:text-white">
          {node.name}
        </span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-zinc-800"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-zinc-400" />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-zinc-400" />
        )}

        <span className="flex-1 truncate">
          {node.name}
        </span>
      </div>

      {isExpanded &&
        node.children?.map((child) => (
          <FileTree
            key={child.id ?? child.path ?? child.name}
            node={child}
            level={level + 1}
            onSelectedFile={onSelectedFile}
            selectedFile={selectedFile}
          />
        ))}
    </div>
  );
}