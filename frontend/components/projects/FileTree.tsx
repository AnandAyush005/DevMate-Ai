"use client";

import { File, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";

export type FileTreeNode = {
  type: "file" | "folder";
  name: string;
  content?: string; // Only for files
  children?: FileTreeNode[];
};

type FileTreeProps = {
  node: FileTreeNode;
  level?: number;
  onSelectedFile: ( fileName: string) => void;
  selectedFile?: { name: string; content: string };
};

export default function FileTree({ node, level = 0, onSelectedFile, selectedFile }: FileTreeProps) {

    const [isExpanded, setIsExpanded] = useState(false);

  if (node.type === "file") {
    return (
      <div
        className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-zinc-800 group ${selectedFile?.name === node.name ? 'bg-zinc-800 text-white' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectedFile(node.name)}
      >
        <File className={`h-4 w-4 shrink-0 text-zinc-400 group-hover:text-white ` }/>
        <span className={`truncate group-hover:text-white `}>{node.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-zinc-800"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <div onClick={() => setIsExpanded((prev) => !prev)} className="flex items-center gap-2 w-full group  ">
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-white"  />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-white" />
          )} <span className="flex-1 group-hover:text-white">{node.name}</span>
        </div>
        
      </div>
      

      {isExpanded && node.children?.map((child) => (
        <FileTree
          key={child.name}
          node={child}
          level={level + 1}
            onSelectedFile={onSelectedFile}
            selectedFile={selectedFile}
        />
      ))}
    </div>
  );
}