"use client";

import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { FilePlus, FolderPlus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useGetProjectbyId } from "@/hooks/useGetProjects";
import {
  useGetProjectFiles,
  useGetProjectFileContent,
  useUpdateProjectFile,
  useGetProjectFolders,
  useCreateProjectFile,
  useCreateProjectFolder,
  useRenameProjectFile,
  useRenameProjectFolder,
  useDeleteProjectFile,
  useDeleteProjectFolder,
  useRelocateProjectFile,
  useRelocateProjectFolder,
} from "@/hooks/useProjects";

import FileTree, {
  readDraggedItem,
} from "./FileTree";
import type { FileTreeNode } from "./FileTree";
import CodeEditor from "./CodeEditor";
import AIChatPanel, { type AIProjectFile } from "./AIChatPanel";
import { getLanguageFromFileName } from "./language";

type WorkspaceFile = {
  id: string;
  name: string;
  path: string;
  content: string;
};

type FileSelection = {
  id: string;
  name: string;
  path: string;
};

type ItemActionDialog = {
  type: "file" | "folder";
  id: string;
  name: string;
  currentPath?: string;
};

type ResizeAxis = "x" | "y";

type ResizeSession = {
  pointerId: number;
  axis: ResizeAxis;
  direction: 1 | -1;
  startPosition: number;
  startSize: number;
  minSize: number;
  maxSize: number;
  setSize: (size: number) => void;
};

export default function ProjectWorkspace({
  projectId,
}: {
  projectId: string;
}) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetProjectbyId(projectId);

  const {
    data: projectFilesResponse,
    isLoading: isFilesLoading,
  } = useGetProjectFiles(projectId);

  const {
    data: projectFoldersResponse,
    isLoading: isFoldersLoading,
  } = useGetProjectFolders(projectId);

  const projectFiles = projectFilesResponse?.data?.files;
  const projectFolders = projectFoldersResponse?.data ?? [];
  const rootFolderId = projectFolders.find(
    (folder: { id: string; path: string }) => folder.path === "/",
  )?.id;
  const aiProjectFiles: AIProjectFile[] = (projectFiles ?? []).map(
    (file: AIProjectFile) => ({
      id: file.id,
      name: file.name,
      path: file.path,
    }),
  );

  const createFileMutation = useCreateProjectFile(projectId);
  const createFolderMutation = useCreateProjectFolder(projectId);
  const renameFileMutation = useRenameProjectFile(projectId);
  const renameFolderMutation = useRenameProjectFolder(projectId);
  const relocateFileMutation = useRelocateProjectFile(projectId);
  const relocateFolderMutation = useRelocateProjectFolder(projectId);
  const deleteFileMutation = useDeleteProjectFile(projectId);
  const deleteFolderMutation = useDeleteProjectFolder(projectId);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [filePaneSize, setFilePaneSize] = useState(256);
  const [aiPaneWidth, setAIPaneWidth] = useState(380);
  const [aiPaneHeight, setAIPaneHeight] = useState(420);
  const [isRootDropTarget, setIsRootDropTarget] = useState(false);
  const resizeSession = useRef<ResizeSession | null>(null);

  const [createDialog, setCreateDialog] = useState<{
    isOpen: boolean;
    type: "file" | "folder";
    targetFolderId?: string;
    name: string;
  }>({
    isOpen: false,
    type: "file",
    name: "",
  });

  const [renameDialog, setRenameDialog] = useState<{
    isOpen: boolean;
    type: "file" | "folder";
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: "file",
    id: "",
    name: "",
  });
  const [itemActionDialog, setItemActionDialog] =
    useState<ItemActionDialog | null>(null);

  const [savedContents, setSavedContents] = useState<
    Record<string, string>
  >({});

  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [selectedFile, setSelectedFile] =
    useState<WorkspaceFile | null>(null);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [loadedFileIds, setLoadedFileIds] = useState<string[]>([]);
  const [pendingCloseFileId, setPendingCloseFileId] =
  useState<string | null>(null);

  const startResize = (
    event: ReactPointerEvent<HTMLDivElement>,
    axis: ResizeAxis,
    direction: 1 | -1,
    size: number,
    minSize: number,
    maxSize: number,
    setSize: (size: number) => void,
  ) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeSession.current = {
      pointerId: event.pointerId,
      axis,
      direction,
      startPosition: axis === "x" ? event.clientX : event.clientY,
      startSize: size,
      minSize,
      maxSize,
      setSize,
    };
  };

  const moveResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = resizeSession.current;
    if (!session || session.pointerId !== event.pointerId) return;

    const position = session.axis === "x" ? event.clientX : event.clientY;
    const delta = (position - session.startPosition) * session.direction;
    session.setSize(
      Math.min(
        session.maxSize,
        Math.max(session.minSize, session.startSize + delta),
      ),
    );
  };

  const endResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (resizeSession.current?.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resizeSession.current = null;
  };

  const resizeByKeyboard = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    axis: ResizeAxis,
    direction: 1 | -1,
    size: number,
    minSize: number,
    maxSize: number,
    setSize: (size: number) => void,
  ) => {
    const growsOnPositiveArrow =
      axis === "x" ? event.key === "ArrowRight" : event.key === "ArrowDown";
    const growsOnNegativeArrow =
      axis === "x" ? event.key === "ArrowLeft" : event.key === "ArrowUp";

    if (!growsOnPositiveArrow && !growsOnNegativeArrow) return;

    event.preventDefault();
    const delta = (growsOnPositiveArrow ? 16 : -16) * direction;
    setSize(Math.min(maxSize, Math.max(minSize, size + delta)));
  };

  const getAIPaneHeightBounds = (element: HTMLDivElement) => {
    const maxSize = Math.min(
      800,
      element.parentElement?.parentElement?.clientHeight ?? 800,
    );

    return {
      size: Math.min(aiPaneHeight, maxSize),
      minSize: Math.min(120, maxSize),
      maxSize,
    };
  };

  const hasUnsavedChanges = files.some(
    (file) =>
      savedContents[file.id] !== undefined &&
      file.content !== savedContents[file.id]
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);


  // Initialize file metadata without replacing existing local content.
  useEffect(() => {
    if (!projectFiles) return;

    if (projectFiles.length === 0) {
      setFiles([]);
      setSelectedFile(null);
      setOpenFiles([]);
      setLoadedFileIds([]);
      return;
    }

    setFiles((currentFiles) =>
      projectFiles.map((file: {
        id: string;
        name: string;
        path: string;
      }) => {
        const existingFile = currentFiles.find(
          (currentFile) => currentFile.id === file.id
        );

        return {
          id: file.id,
          name: file.name,
          path: file.path,
          content: existingFile?.content ?? "",
        };
      })
    );
  }, [projectFiles]);


  const selectedFileId = selectedFile?.id ?? "";

  // The query is enabled only when a file is selected.
  const {
    data: fileContentResponse,
    isLoading: isFileContentLoading,
    isError: isFileContentError,
  } = useGetProjectFileContent(projectId, selectedFileId);

  // Load content once per file; never overwrite edits already in local state.
  useEffect(() => {
    const content = fileContentResponse?.data?.content;
    if (content === undefined || !selectedFileId) return;

    setSavedContents((current) => ({
      ...current,
      [selectedFileId]: content,
    }));

    if (loadedFileIds.includes(selectedFileId)) return;

    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.id === selectedFileId
          ? { ...file, content }
          : file
      )
    );

    setSelectedFile((currentFile) =>
      currentFile?.id === selectedFileId
        ? { ...currentFile, content }
        : currentFile
    );

    setLoadedFileIds((current) =>
      current.includes(selectedFileId)
        ? current
        : [...current, selectedFileId]
    );
  }, [fileContentResponse, selectedFileId, loadedFileIds]);

  const handleFileSelect = (file: FileSelection) => {
    const existingFile = files.find(
      (workspaceFile) => workspaceFile.id === file.id
    );

    if (!existingFile) return;

    setSelectedFile(existingFile);

    setOpenFiles((current) =>
      current.includes(file.id)
        ? current
        : [...current, file.id]
    );
  };

const { mutate, isPending } = useUpdateProjectFile(
  projectId,
  selectedFile?.id ?? ""
);


  const handleFileSave = () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    const fileId = selectedFile.id;
    const contentToSave = selectedFile.content;

    mutate(contentToSave, {
      onSuccess: () => {
        setSavedContents((current) => ({
          ...current,
          [fileId]: contentToSave,
        }));

        toast.success("File saved successfully");
      },

      onError: () => {
        toast.error("Failed to save file");
      },
    });
  };

  

const closeFileTab = (fileId: string) => {
  const remainingFiles = openFiles.filter(
    (id) => id !== fileId
  );

  if (selectedFile?.id === fileId) {
    const nextFileId = remainingFiles[0];
    const nextFile = files.find(
      (file) => file.id === nextFileId
    );

    setSelectedFile(nextFile ?? null);
  }

  setOpenFiles(remainingFiles);
};

const discardFileChanges = (fileId: string) => {
  const savedContent = savedContents[fileId];

  if (savedContent === undefined) {
    toast.error("Unable to restore the saved content");
    return;
  }

  // Restore the file's last-saved content in workspace state.
  setFiles((currentFiles) =>
    currentFiles.map((file) =>
      file.id === fileId
        ? { ...file, content: savedContent }
        : file
    )
  );

  // Keep the selected editor synchronized with the restored content.
  setSelectedFile((currentFile) =>
    currentFile?.id === fileId
      ? { ...currentFile, content: savedContent }
      : currentFile
  );

  // Close the tab after scheduling the restoration.
  closeFileTab(fileId);
};

const handleFileClose = (fileId: string) => {
  const fileToClose = files.find(
    (file) => file.id === fileId
  );

  if (
    fileToClose &&
    savedContents[fileId] !== undefined &&
    fileToClose.content !== savedContents[fileId]
  ) {
    setPendingCloseFileId(fileId);
    return;
  }

  closeFileTab(fileId);
};

  const handleOpenCreate = (type: "file" | "folder", targetFolderId?: string) => {
    setCreateDialog({
      isOpen: true,
      type,
      targetFolderId: targetFolderId ?? selectedFolderId ?? undefined,
      name: "",
    });
  };

  const handleOpenRename = (node: FileTreeNode) => {
    if (!node.id) return;
    setRenameDialog({
      isOpen: true,
      type: node.type,
      id: node.id,
      name: node.name,
    });
  };

  const handleOpenDelete = (node: FileTreeNode) => {
    if (!node.id) return;

    setItemActionDialog({
      type: node.type,
      id: node.id,
      name: node.name,
      currentPath: node.type === "folder" ? node.path : undefined,
    });
  };

  const handleDropItem = (
    node: FileTreeNode,
    targetFolderId: string,
  ) => {
    if (
      !node.id ||
      relocateFileMutation.isPending ||
      relocateFolderMutation.isPending
    ) {
      return;
    }

    const onSuccess = () => {
      toast.success(
        `${node.type === "file" ? "File" : "Folder"} moved successfully`,
      );
    };
    const onError = (error: unknown) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error?.message
          ? error.response.data.error.message
          : `Failed to move ${node.type}`;
      toast.error(message);
    };

    if (node.type === "file") {
      const currentFolderId =
        node.folderId ??
        projectFiles?.find(
          (file: { id: string; folderId?: string }) => file.id === node.id,
        )?.folderId;
      if (currentFolderId === targetFolderId) return;

      relocateFileMutation.mutate(
        { fileId: node.id, folderId: targetFolderId },
        { onSuccess, onError },
      );
      return;
    }

    const sourceFolder = projectFolders.find(
      (folder: { id: string; path: string; parentFolderId?: string | null }) =>
        folder.id === node.id,
    );
    const targetFolder = projectFolders.find(
      (folder: { id: string; path: string }) => folder.id === targetFolderId,
    );

    if (!sourceFolder || !targetFolder) {
      toast.error("Unable to find the source or destination folder.");
      return;
    }
    if (sourceFolder.parentFolderId === targetFolderId) return;
    if (targetFolder.path.startsWith(sourceFolder.path)) {
      toast.error("A folder cannot be moved into itself or one of its subfolders.");
      return;
    }

    relocateFolderMutation.mutate(
      { folderId: node.id, parentFolderId: targetFolderId },
      { onSuccess, onError },
    );
  };

  const handleItemActionSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!itemActionDialog) return;

    const action = itemActionDialog;

    const removeWorkspaceFiles = (fileIds: string[]) => {
      const removedIds = new Set(fileIds);
      setFiles((current) =>
        current.filter((file) => !removedIds.has(file.id)),
      );
      setOpenFiles((current) => current.filter((id) => !removedIds.has(id)));
      setLoadedFileIds((current) =>
        current.filter((id) => !removedIds.has(id)),
      );
      setSavedContents((current) => {
        const next = { ...current };
        for (const id of removedIds) {
          delete next[id];
        }
        return next;
      });
      setSelectedFile((current) =>
        current && removedIds.has(current.id) ? null : current,
      );
    };

    const onDeleteSuccess = (fileIds: string[], folderIds: Set<string>) => {
      removeWorkspaceFiles(fileIds);
      if (selectedFolderId && folderIds.has(selectedFolderId)) {
        setSelectedFolderId(null);
      }
      toast.success(
        `${action.type === "file" ? "File" : "Folder"} deleted successfully`,
      );
      setItemActionDialog(null);
    };
    const onDeleteError = (error: unknown) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error?.message
          ? error.response.data.error.message
          : `Failed to delete ${action.type}`;
      toast.error(message);
    };

    if (action.type === "file") {
      deleteFileMutation.mutate(action.id, {
        onSuccess: () => onDeleteSuccess([action.id], new Set<string>()),
        onError: onDeleteError,
      });
      return;
    }

    const folderPath =
      projectFolders.find(
        (folder: { id: string }) => folder.id === action.id,
      )?.path ?? action.currentPath;
    const deletedFolders = new Set<string>(
      projectFolders
        .filter(
          (folder: { id: string; path: string }) =>
            folder.id === action.id ||
            (!!folderPath && folder.path.startsWith(folderPath)),
        )
        .map((folder: { id: string }) => folder.id),
    );
    const deletedFileIds = (projectFiles ?? [])
      .filter(
        (file: { id: string; folderId?: string }) =>
          file.folderId && deletedFolders.has(file.folderId),
      )
      .map((file: { id: string }) => file.id);

    deleteFolderMutation.mutate(action.id, {
      onSuccess: () => onDeleteSuccess(deletedFileIds, deletedFolders),
      onError: onDeleteError,
    });
  };

  const handleCreateSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = createDialog.name.trim();

    if (!trimmedName) {
      toast.error(`Please enter a ${createDialog.type} name`);
      return;
    }

    if (/[\\/]/.test(trimmedName)) {
      toast.error(
        `${createDialog.type === "file" ? "File" : "Folder"} name cannot contain path separators`
      );
      return;
    }

    if (createDialog.type === "file") {
      createFileMutation.mutate(
        {
          name: trimmedName,
          folderId: createDialog.targetFolderId,
          language: getLanguageFromFileName(trimmedName),
          content: "",
        },
        {
          onSuccess: (res) => {
            toast.success("File created successfully");
            setCreateDialog((prev) => ({ ...prev, isOpen: false, name: "" }));

            const newFile = res?.data;
            if (newFile?.id) {
              const workspaceFile: WorkspaceFile = {
                id: newFile.id,
                name: newFile.name,
                path: newFile.path || `/${newFile.name}`,
                content: newFile.content || "",
              };
              setFiles((prev) => {
                const exists = prev.some((f) => f.id === newFile.id);
                return exists ? prev : [...prev, workspaceFile];
              });
              setSelectedFile(workspaceFile);
              setOpenFiles((prev) =>
                prev.includes(newFile.id) ? prev : [...prev, newFile.id]
              );
            }
          },
          onError: (err) => {
            const message =
              axios.isAxiosError(err) && err.response?.data?.error?.message
                ? err.response.data.error.message
                : "Failed to create file";
            toast.error(message);
          },
        }
      );
    } else {
      createFolderMutation.mutate(
        {
          name: trimmedName,
          parentFolderId: createDialog.targetFolderId,
        },
        {
          onSuccess: () => {
            toast.success("Folder created successfully");
            setCreateDialog((prev) => ({ ...prev, isOpen: false, name: "" }));
          },
          onError: (err) => {
            const message =
              axios.isAxiosError(err) && err.response?.data?.error?.message
                ? err.response.data.error.message
                : "Failed to create folder";
            toast.error(message);
          },
        }
      );
    }
  };

  const handleRenameSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = renameDialog.name.trim();

    if (!trimmedName) {
      toast.error(`Please enter a ${renameDialog.type} name`);
      return;
    }

    if (/[\\/]/.test(trimmedName)) {
      toast.error(
        `${renameDialog.type === "file" ? "File" : "Folder"} name cannot contain path separators`
      );
      return;
    }

    if (renameDialog.type === "file") {
      renameFileMutation.mutate(
        {
          fileId: renameDialog.id,
          name: trimmedName,
        },
        {
          onSuccess: () => {
            toast.success("File renamed successfully");
            setFiles((prev) =>
              prev.map((f) =>
                f.id === renameDialog.id ? { ...f, name: trimmedName } : f
              )
            );
            setSelectedFile((prev) =>
              prev?.id === renameDialog.id
                ? { ...prev, name: trimmedName }
                : prev
            );
            setRenameDialog((prev) => ({
              ...prev,
              isOpen: false,
              name: "",
              id: "",
            }));
          },
          onError: (err) => {
            const message =
              axios.isAxiosError(err) && err.response?.data?.error?.message
                ? err.response.data.error.message
                : "Failed to rename file";
            toast.error(message);
          },
        }
      );
    } else {
      renameFolderMutation.mutate(
        {
          folderId: renameDialog.id,
          name: trimmedName,
        },
        {
          onSuccess: () => {
            toast.success("Folder renamed successfully");
            setRenameDialog((prev) => ({
              ...prev,
              isOpen: false,
              name: "",
              id: "",
            }));
          },
          onError: (err) => {
            const message =
              axios.isAxiosError(err) && err.response?.data?.error?.message
                ? err.response.data.error.message
                : "Failed to rename folder";
            toast.error(message);
          },
        }
      );
    }
  };

  const fileTree = useMemo(() => {
    const rawFolders: Array<{
      id: string;
      name: string;
      path: string;
      parentFolderId: string | null;
    }> = projectFolders ?? [];

    const rawFiles: Array<{
      id: string;
      name: string;
      path: string;
      folderId?: string;
    }> = projectFiles ?? [];

    const rootFolder = rawFolders.find(
      (f) => f.path === "/" || f.parentFolderId === null || f.name === "root"
    );
    const rootFolderId = rootFolder?.id;

    const buildFolderNode = (folder: {
      id: string;
      name: string;
      path: string;
      parentFolderId: string | null;
    }): FileTreeNode => {
      const childFolders = rawFolders
        .filter((f) => f.parentFolderId === folder.id && f.id !== folder.id)
        .sort((a, b) => a.name.localeCompare(b.name));

      const childFiles = rawFiles
        .filter((file) => file.folderId === folder.id)
        .sort((a, b) => a.name.localeCompare(b.name));

      const children: FileTreeNode[] = [
        ...childFolders.map(buildFolderNode),
        ...childFiles.map((file) => ({
          type: "file" as const,
          id: file.id,
          name: file.name,
          path: file.path,
          folderId: file.folderId,
        })),
      ];

      return {
        type: "folder" as const,
        id: folder.id,
        name: folder.name,
        path: folder.path,
        children,
      };
    };

    if (rootFolder) {
      const topFolders = rawFolders
        .filter((f) => f.parentFolderId === rootFolderId && f.id !== rootFolderId)
        .sort((a, b) => a.name.localeCompare(b.name));

      const topFiles = rawFiles
        .filter((file) => file.folderId === rootFolderId || !file.folderId)
        .sort((a, b) => a.name.localeCompare(b.name));

      return [
        ...topFolders.map(buildFolderNode),
        ...topFiles.map((file) => ({
          type: "file" as const,
          id: file.id,
          name: file.name,
          path: file.path,
          folderId: file.folderId,
        })),
      ];
    }

    return rawFiles.map((file) => ({
      type: "file" as const,
      id: file.id,
      name: file.name,
      path: file.path,
      folderId: file.folderId,
    }));
  }, [projectFolders, projectFiles]);

  if (isLoading) {
    return (
      <div className="dark flex min-h-screen items-center justify-center bg-background text-foreground">
        <p>Loading project...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="dark flex min-h-screen items-center justify-center bg-background text-foreground">
        <p>
          {axios.isAxiosError(error)
            ? error.response?.data?.error?.message ??
              "Failed to load project"
            : "Failed to load project"}
        </p>
      </div>
    );
  }

  const project = data?.data;

  return (
    <div className="dark flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
   
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <h1 className="font-semibold">
        {project?.name || "Untitled Project"}
      </h1>

      <div className="flex items-center gap-2">
        <button
          onClick={handleFileSave}
          disabled={!selectedFile || isPending}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          aria-expanded={isAIChatOpen}
          onClick={() => setIsAIChatOpen((open) => !open)}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-zinc-700 px-2 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-zinc-800 sm:px-3 sm:text-sm"
        >
          <Sparkles aria-hidden="true" className="h-4 w-4" />
          {isAIChatOpen ? "Close AI" : "AI Assistant"}
        </button>

        <button className="rounded-md border px-3 py-1.5 text-sm">
          Settings
        </button>
      </div>
    </header>


      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside
          className="flex h-[var(--file-pane-size)] w-full shrink-0 flex-col border-b lg:h-full lg:w-[var(--file-pane-size)] lg:border-b-0 lg:border-r"
          style={{ "--file-pane-size": `${filePaneSize}px` } as CSSProperties}
        >
          <div className="flex h-10 items-center justify-between border-b px-4">
            <span className="text-sm font-medium">Files</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleOpenCreate("file")}
                title="New File"
                className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                aria-label="Create file"
              >
                <FilePlus className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => handleOpenCreate("folder")}
                title="New Folder"
                className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                aria-label="Create folder"
              >
                <FolderPlus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {rootFolderId && (
              <div
                className={`mb-2 flex items-center justify-between rounded-md border border-dashed px-3 py-2 text-xs transition-colors ${
                  isRootDropTarget
                    ? "border-amber-400 bg-amber-400/10 text-amber-200"
                    : "border-zinc-800 text-zinc-500"
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setIsRootDropTarget(true);
                }}
                onDragLeave={(event) => {
                  const nextTarget = event.relatedTarget;
                  if (
                    nextTarget instanceof Node &&
                    event.currentTarget.contains(nextTarget)
                  ) {
                    return;
                  }
                  setIsRootDropTarget(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsRootDropTarget(false);
                  const draggedItem = readDraggedItem(event.dataTransfer);
                  if (draggedItem) {
                    handleDropItem(draggedItem, rootFolderId);
                  }
                }}
              >
                <span>Project root</span>
                <span className="font-mono">/</span>
              </div>
            )}

            {isFilesLoading || isFoldersLoading ? (
              <p className="px-2 text-sm text-zinc-500">
                Loading files...
              </p>
            ) : fileTree.length === 0 ? (
              <p className="px-2 text-sm text-zinc-500">
                No files yet.
              </p>
            ) : (
              fileTree.map((node) => (
                <FileTree
                  key={node.id ?? node.path ?? node.name}
                  node={node}
                  onSelectedFile={handleFileSelect}
                  selectedFile={selectedFile ?? undefined}
                  onRename={handleOpenRename}
                  onDelete={handleOpenDelete}
                  onDropItem={handleDropItem}
                  onCreateInFolder={handleOpenCreate}
                  selectedFolderId={selectedFolderId}
                  onSelectFolder={setSelectedFolderId}
                />
              ))
            )}
          </div>
        </aside>

        <div
          aria-label="Resize file explorer height"
          aria-orientation="horizontal"
          aria-valuemax={600}
          aria-valuemin={160}
          aria-valuenow={filePaneSize}
          className="h-2 w-full shrink-0 cursor-row-resize touch-none bg-zinc-900/80 transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 lg:hidden"
          onKeyDown={(event) =>
            resizeByKeyboard(
              event,
              "y",
              1,
              filePaneSize,
              160,
              600,
              setFilePaneSize,
            )
          }
          onPointerCancel={endResize}
          onPointerDown={(event) =>
            startResize(
              event,
              "y",
              1,
              filePaneSize,
              160,
              600,
              setFilePaneSize,
            )
          }
          onPointerMove={moveResize}
          onPointerUp={endResize}
          role="separator"
          tabIndex={0}
        />
        <div
          aria-label="Resize file explorer width"
          aria-orientation="vertical"
          aria-valuemax={600}
          aria-valuemin={160}
          aria-valuenow={filePaneSize}
          className="hidden h-full w-2 shrink-0 cursor-col-resize touch-none bg-zinc-900/80 transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 lg:block"
          onKeyDown={(event) =>
            resizeByKeyboard(
              event,
              "x",
              1,
              filePaneSize,
              160,
              600,
              setFilePaneSize,
            )
          }
          onPointerCancel={endResize}
          onPointerDown={(event) =>
            startResize(
              event,
              "x",
              1,
              filePaneSize,
              160,
              600,
              setFilePaneSize,
            )
          }
          onPointerMove={moveResize}
          onPointerUp={endResize}
          role="separator"
          tabIndex={0}
        />

        <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex h-10 shrink-0 items-center border-b px-4">
            {openFiles.map((fileId) => {
              const file = files.find(
                (item) => item.id === fileId
              );

              if (!file) return null;

              return (
                <div
                  key={file.id}
                  className={`flex cursor-pointer items-center gap-2 border-r p-2 hover:underline ${
                    selectedFile?.id === file.id
                      ? "bg-muted text-foreground"
                      : "text-zinc-400"
                  }`}
                  onClick={() => handleFileSelect(file)}
                >
                <span className="flex items-center gap-2">
                  {file.name}

                  {savedContents[file.id] !== undefined &&
                    file.content !== savedContents[file.id] && (
                      <span
                        className="size-2 rounded-full bg-orange-400"
                        title="Unsaved changes"
                        aria-label="Unsaved changes"
                      />
                    )}
                </span>


                  <X
                    className="size-4 hover:opacity-50"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleFileClose(file.id);
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden p-4">
            {selectedFile &&
            !loadedFileIds.includes(selectedFile.id) &&
            isFileContentLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                Loading {selectedFile.name}...
              </div>
            ) : isFileContentError &&
              selectedFile &&
              !loadedFileIds.includes(selectedFile.id) ? (
              <div className="flex h-full items-center justify-center text-sm text-red-400">
                Failed to load file content. Select the file again to retry.
              </div>
            ) : selectedFile ? (
              <CodeEditor
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                files={files}
                setFiles={setFiles}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                Select a file to start editing
              </div>
            )}
          </div>
        </section>
        <div
          aria-hidden={!isAIChatOpen}
          style={{
            "--ai-pane-height": `${aiPaneHeight}px`,
            "--ai-pane-width": `${aiPaneWidth}px`,
          } as CSSProperties}
          className={
            isAIChatOpen
              ? "absolute inset-x-0 bottom-0 z-20 h-[var(--ai-pane-height)] max-h-full bg-background p-3 lg:relative lg:inset-auto lg:z-auto lg:h-full lg:w-[var(--ai-pane-width)] lg:shrink-0 lg:border-l lg:border-zinc-800 lg:bg-transparent"
              : "hidden"
          }
        >
          <div
            aria-label="Resize AI assistant height"
            aria-orientation="horizontal"
            aria-valuemax={800}
            aria-valuemin={120}
            aria-valuenow={aiPaneHeight}
            className="absolute inset-x-0 top-0 z-30 h-2 cursor-row-resize touch-none bg-transparent transition-colors hover:bg-zinc-600/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 lg:hidden"
            onKeyDown={(event) => {
              const bounds = getAIPaneHeightBounds(event.currentTarget);
              resizeByKeyboard(
                event,
                "y",
                -1,
                bounds.size,
                bounds.minSize,
                bounds.maxSize,
                setAIPaneHeight,
              );
            }}
            onPointerCancel={endResize}
            onPointerDown={(event) => {
              const bounds = getAIPaneHeightBounds(event.currentTarget);
              startResize(
                event,
                "y",
                -1,
                bounds.size,
                bounds.minSize,
                bounds.maxSize,
                setAIPaneHeight,
              );
            }}
            onPointerMove={moveResize}
            onPointerUp={endResize}
            role="separator"
            tabIndex={0}
          />
          <div
            aria-label="Resize AI assistant width"
            aria-orientation="vertical"
            aria-valuemax={600}
            aria-valuemin={280}
            aria-valuenow={aiPaneWidth}
            className="absolute inset-y-0 -left-1 z-30 hidden w-2 cursor-col-resize touch-none bg-transparent transition-colors hover:bg-zinc-600/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 lg:block"
            onKeyDown={(event) =>
              resizeByKeyboard(
                event,
                "x",
                -1,
                aiPaneWidth,
                280,
                600,
                setAIPaneWidth,
              )
            }
            onPointerCancel={endResize}
            onPointerDown={(event) =>
              startResize(
                event,
                "x",
                -1,
                aiPaneWidth,
                280,
                600,
                setAIPaneWidth,
              )
            }
            onPointerMove={moveResize}
            onPointerUp={endResize}
            role="separator"
            tabIndex={0}
          />
          <AIChatPanel
            projectId={projectId}
            files={aiProjectFiles}
            activeFile={
              selectedFile && loadedFileIds.includes(selectedFile.id)
                ? selectedFile
                : null
            }
          />
        </div>
        </div>
      </main>


  <Dialog
    open={pendingCloseFileId !== null}
    onOpenChange={(open) => {
      if (!open) setPendingCloseFileId(null);
    }}
  >
  <DialogContent className="border border-zinc-800 bg-[#09090b] text-zinc-100 shadow-2xl sm:max-w-md">
    <DialogHeader className="space-y-3">
      <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-100">
        Discard unsaved changes?
      </DialogTitle>

      <DialogDescription className="text-sm leading-6 text-zinc-400">
        This file has unsaved changes. If you close it without
        saving, your latest edits will be lost.
      </DialogDescription>
    </DialogHeader>

    <DialogFooter className="mt-2 gap-2 sm:gap-2">
      <button
        type="button"
        onClick={() => {
          if (pendingCloseFileId) {
            discardFileChanges(pendingCloseFileId);
          }

          setPendingCloseFileId(null);
        }}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] active:scale-[0.98]"
      >
        Cancel
      </button>

    <button
      type="button"
      onClick={() => {
        if (pendingCloseFileId) {
          discardFileChanges(pendingCloseFileId);
        }

        setPendingCloseFileId(null);
      }}
      className="inline-flex h-10 items-center justify-center rounded-lg border border-red-500/30 bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-500"
    >
      Discard changes
    </button>
    </DialogFooter>
  </DialogContent>
</Dialog>


    <Dialog
      open={createDialog.isOpen}
      onOpenChange={(open) => {
        if (!open) setCreateDialog((prev) => ({ ...prev, isOpen: false }));
      }}
    >
      <DialogContent className="border border-zinc-800 bg-[#09090b] text-zinc-100 shadow-2xl sm:max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-100">
            Create New {createDialog.type === "file" ? "File" : "Folder"}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400">
            Enter the name for the new {createDialog.type}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Name
            </label>
            <Input
              value={createDialog.name}
              onChange={(e) =>
                setCreateDialog((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={
                createDialog.type === "file"
                  ? "e.g. index.ts, styles.css"
                  : "e.g. components, utils"
              }
              autoFocus
              className="border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-zinc-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Location
            </label>
            <select
              value={createDialog.targetFolderId ?? ""}
              onChange={(e) =>
                setCreateDialog((prev) => ({
                  ...prev,
                  targetFolderId: e.target.value || undefined,
                }))
              }
              className="h-9 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-500"
            >
              <option value="">Root (/)</option>
              {projectFolders
                .filter((f: any) => f.path !== "/" && f.name !== "root")
                .map((f: any) => (
                  <option key={f.id} value={f.id}>
                    {f.path || f.name}
                  </option>
                ))}
            </select>
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() =>
                setCreateDialog((prev) => ({ ...prev, isOpen: false }))
              }
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                createFileMutation.isPending || createFolderMutation.isPending
              }
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createFileMutation.isPending || createFolderMutation.isPending
                ? "Creating..."
                : "Create"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog
      open={renameDialog.isOpen}
      onOpenChange={(open) => {
        if (!open) setRenameDialog((prev) => ({ ...prev, isOpen: false }));
      }}
    >
      <DialogContent className="border border-zinc-800 bg-[#09090b] text-zinc-100 shadow-2xl sm:max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-100">
            Rename {renameDialog.type === "file" ? "File" : "Folder"}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400">
            Enter the new name for this {renameDialog.type}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRenameSubmit} className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              New Name
            </label>
            <Input
              value={renameDialog.name}
              onChange={(e) =>
                setRenameDialog((prev) => ({ ...prev, name: e.target.value }))
              }
              autoFocus
              className="border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-zinc-500"
            />
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() =>
                setRenameDialog((prev) => ({ ...prev, isOpen: false }))
              }
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                renameFileMutation.isPending || renameFolderMutation.isPending
              }
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {renameFileMutation.isPending || renameFolderMutation.isPending
                ? "Renaming..."
                : "Rename"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog
      open={itemActionDialog !== null}
      onOpenChange={(open) => {
        if (!open) setItemActionDialog(null);
      }}
    >
      <DialogContent className="border border-zinc-800 bg-[#09090b] text-zinc-100 shadow-2xl sm:max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-100">
            Delete {itemActionDialog?.type}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400">
            {itemActionDialog?.type === "folder"
              ? `This permanently deletes ${itemActionDialog.name} and all nested folders and files.`
              : `This permanently deletes ${itemActionDialog?.name} and discards any unsaved edits.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleItemActionSubmit} className="space-y-4 py-2">
          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => setItemActionDialog(null)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                deleteFileMutation.isPending ||
                deleteFolderMutation.isPending
              }
              className="inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteFileMutation.isPending || deleteFolderMutation.isPending
                ? "Deleting..."
                : "Delete"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    </div>
  );
}