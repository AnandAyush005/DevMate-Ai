"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useGetProjectbyId } from "@/hooks/useGetProjects";
import {
  useGetProjectFiles,
  useGetProjectFileContent,
  useUpdateProjectFile,
} from "@/hooks/useProjects";

import FileTree from "./FileTree";
import type { FileTreeNode } from "./FileTree";
import CodeEditor from "./CodeEditor";

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

  const projectFiles = projectFilesResponse?.data?.files;
  
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

  const fileTree: FileTreeNode[] = (projectFiles ?? []).map(
    (file: { id: string; name: string; path: string }) => ({
      type: "file",
      id: file.id,
      name: file.name,
      path: file.path,
    })
  );

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
          <div className="flex h-10 items-center border-b px-4">
            <span className="text-sm font-medium">Files</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {isFilesLoading ? (
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
                  key={node.id}
                  node={node}
                  onSelectedFile={handleFileSelect}
                  selectedFile={selectedFile ?? undefined}
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


    </div>
  );
}