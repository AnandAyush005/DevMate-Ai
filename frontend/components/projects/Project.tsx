"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { FilePlus, FolderPlus, X } from "lucide-react";
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
} from "@/hooks/useProjects";

import FileTree from "./FileTree";
import type { FileTreeNode } from "./FileTree";
import CodeEditor from "./CodeEditor";
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

  const createFileMutation = useCreateProjectFile(projectId);
  const createFolderMutation = useCreateProjectFolder(projectId);
  const renameFileMutation = useRenameProjectFile(projectId);
  const renameFolderMutation = useRenameProjectFolder(projectId);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

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

    setSavedContents((current) => ({
      ...current,
      [selectedFileId]: content,
    }));

    if (
      content === undefined ||
      !selectedFileId ||
      loadedFileIds.includes(selectedFileId)
    ) {
      return;
    }

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

        <button className="rounded-md border px-3 py-1.5 text-sm">
          Settings
        </button>
      </div>
    </header>


      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex h-64 w-full shrink-0 flex-col border-b lg:h-full lg:w-64 lg:border-b-0 lg:border-r">
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
                  onCreateInFolder={handleOpenCreate}
                  selectedFolderId={selectedFolderId}
                  onSelectFolder={setSelectedFolderId}
                />
              ))
            )}
          </div>
        </aside>

        <section className="flex min-h-0 flex-1 flex-col">
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

    </div>
  );
}