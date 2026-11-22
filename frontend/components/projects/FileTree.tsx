"use client";

import {
  File,
  Folder,
  FolderOpen,
  FilePlus,
  FolderPlus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { DragEvent as ReactDragEvent } from "react";

export const DRAG_ITEM_DATA_TYPE = "application/x-devmate-project-item";

export type DraggedProjectItem = {
  id: string;
  type: "file" | "folder";
  name: string;
  path?: string;
  folderId?: string;
};

export const readDraggedItem = (
  dataTransfer: DataTransfer,
): DraggedProjectItem | null => {
  const value =
    dataTransfer.getData(DRAG_ITEM_DATA_TYPE) ||
    dataTransfer.getData("text/plain");
  if (!value) return null;

  try {
    const item = JSON.parse(value) as Partial<DraggedProjectItem>;
    if (
      typeof item.id !== "string" ||
      typeof item.name !== "string" ||
      (item.type !== "file" && item.type !== "folder")
    ) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
      type: item.type,
      path: item.path,
      folderId: item.folderId,
    };
  } catch {
    return null;
  }
};

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
  onDelete?: (node: FileTreeNode) => void;
  onDropItem?: (node: FileTreeNode, targetFolderId: string) => void;
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
  onDelete,
  onDropItem,
  onCreateInFolder,
  selectedFolderId,
  onSelectFolder,
}: FileTreeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleDragStart = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!node.id) return;

    event.dataTransfer.effectAllowed = "move";
    const item = JSON.stringify({
      id: node.id,
      type: node.type,
      name: node.name,
      path: node.path,
      folderId: node.folderId,
    });
    event.dataTransfer.setData(DRAG_ITEM_DATA_TYPE, item);
    event.dataTransfer.setData("text/plain", item);
  };

  const handleFolderDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsDropTarget(true);
  };

  const handleFolderDragLeave = (event: ReactDragEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    setIsDropTarget(false);
  };

  const handleFolderDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDropTarget(false);

    const draggedItem = readDraggedItem(event.dataTransfer);
    if (!draggedItem || !node.id || node.type !== "folder") return;

    setIsExpanded(true);
    onDropItem?.(draggedItem, node.id);
  };

  if (node.type === "file") {
    return (
      <div
        draggable={Boolean(node.id)}
        onDragStart={handleDragStart}
        className={`group flex cursor-grab items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-white/[0.05] active:cursor-grabbing ${
          selectedFile?.id === node.id
            ? "bg-violet-400/[0.10] font-medium text-violet-100 ring-1 ring-inset ring-violet-300/10"
            : "text-slate-400"
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
          <File className="h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-cyan-200" />
          <span className="truncate group-hover:text-slate-100">
            {node.name}
          </span>
        </div>

        {(onRename || onDelete) && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
            {onRename && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(node);
                }}
                title="Rename file"
                className="rounded p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Rename file"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node);
                }}
                title="Delete file"
                className="rounded p-1 text-slate-500 transition-colors hover:bg-red-900/50 hover:text-red-300"
                aria-label="Delete file"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        draggable={Boolean(node.id)}
        onDragStart={handleDragStart}
        onDragOver={handleFolderDragOver}
        onDragLeave={handleFolderDragLeave}
        onDrop={handleFolderDrop}
        className={`group flex cursor-grab items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white/[0.05] active:cursor-grabbing ${
          isDropTarget
            ? "bg-cyan-500/10 text-cyan-100 ring-1 ring-inset ring-cyan-300/30"
            : selectedFolderId === node.id
              ? "bg-violet-400/[0.06] text-violet-100"
              : "text-slate-300"
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
            <FolderOpen className="h-4 w-4 shrink-0 text-violet-300" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-indigo-300" />
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
                className="rounded p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
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
                className="rounded p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="New folder in folder"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {(onRename || onDelete) && (
            <>
              {onRename && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename(node);
                  }}
                  title="Rename folder"
                  className="rounded p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Rename folder"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node);
                  }}
                  title="Delete folder"
                  className="rounded p-1 text-slate-500 transition-colors hover:bg-red-900/50 hover:text-red-300"
                  aria-label="Delete folder"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </>
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
            onDelete={onDelete}
            onDropItem={onDropItem}
            onCreateInFolder={onCreateInFolder}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
          />
        ))}
    </div>
  );
}