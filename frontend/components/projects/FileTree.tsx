"use client";

import { File, Folder, FolderOpen, FilePlus, FolderPlus, Pencil } from "lucide-react";
import { useState } from "react";

export type FileTreeNode = {
  type: "file" | "folder";
  id?: string;
  name: string;
  path?: string;
  folderId?: string;
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
  onRename?: (node: FileTreeNode) => void;
  onCreateInFolder?: (type: "file" | "folder", folderId: string) => void;
  selectedFolderId?: string | null;
  onSelectFolder?: (folderId: string) => void;
};

export default function FileTree({
  node,
  level = 0,
  onSelectedFile,
  selectedFile,
  onRename,
  onCreateInFolder,
  selectedFolderId,
  onSelectFolder,
}: FileTreeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (node.type === "file") {
    return (
      <div
        className={`group flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-zinc-800 ${
          selectedFile?.id === node.id
            ? "bg-zinc-800 text-white font-medium"
            : "text-zinc-300"
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
        <div className="flex items-center gap-2 min-w-0">
          <File className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-white" />
          <span className="truncate group-hover:text-white">
            {node.name}
          </span>
        </div>

        {onRename && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRename(node);
              }}
              title="Rename file"
              className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-700"
              aria-label="Rename file"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        className={`group flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium hover:bg-zinc-800 ${
          selectedFolderId === node.id ? "bg-zinc-800/60 text-white" : "text-zinc-200"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          setIsExpanded((prev) => !prev);
          if (node.id && onSelectFolder) {
            onSelectFolder(node.id);
          }
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-amber-400" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-amber-400" />
          )}

          <span className="truncate">
            {node.name}
          </span>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          {onCreateInFolder && node.id && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                  onCreateInFolder("file", node.id!);
                }}
                title="New File in folder"
                className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-700"
                aria-label="New file in folder"
              >
                <FilePlus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                  onCreateInFolder("folder", node.id!);
                }}
                title="New Folder in folder"
                className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-700"
                aria-label="New folder in folder"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {onRename && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRename(node);
              }}
              title="Rename folder"
              className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-700"
              aria-label="Rename folder"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {isExpanded &&
        node.children?.map((child) => (
          <FileTree
            key={child.id ?? child.path ?? child.name}
            node={child}
            level={level + 1}
            onSelectedFile={onSelectedFile}
            selectedFile={selectedFile}
            onRename={onRename}
            onCreateInFolder={onCreateInFolder}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
          />
        ))}
    </div>
  );
}