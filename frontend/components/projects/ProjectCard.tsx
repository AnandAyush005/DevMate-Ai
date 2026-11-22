"use client";

import {
  CalendarDays,
  FolderKanban,
  Pencil,
  Save,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDeleteProject, useUpdateProject } from "@/hooks/useProjects";
import type { Project } from "./ProjectsList";

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const createdDate = new Date(project.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [projectDescription, setProjectDescription] = useState(project.description ?? "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { mutate: updateProject, isPending } = useUpdateProject();
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  const handleUpdate = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!projectName.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }

    updateProject(
      {
        projectId: project.id,
        name: projectName.trim(),
        description: projectDescription.trim(),
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Project is updated");
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.error?.message || "Failed to update project");
            return;
          }
          toast.error("Failed to update project");
        },
      },
    );
  };

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#1b2732] bg-[#080d12] ring-0 transition duration-200 hover:-translate-y-0.5 hover:border-slate-500/50 hover:bg-[#101820]"
      onClick={() => {
        if (!isEditing) router.push(`/projects/${project.id}`);
      }}
    >
      <CardHeader className="relative pb-4">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl border border-violet-300/10 bg-violet-400/[0.06] text-violet-200 transition-colors group-hover:border-violet-300/20">
            <FolderKanban className="size-[18px]" />
          </div>
          <button
            type="button"
            aria-label={`Delete ${project.name}`}
            onClick={(event) => {
              event.stopPropagation();
              setDeleteDialogOpen(true);
            }}
            className="flex size-8 items-center justify-center rounded-lg text-slate-500 opacity-100 transition hover:bg-rose-400/10 hover:text-rose-300 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        {isEditing ? (
          <Input
            className="h-9 border-[#1b2732] bg-[#000102] px-3 text-sm text-white focus-visible:border-violet-300/40"
            placeholder="Project name"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            onClick={(event) => event.stopPropagation()}
          />
        ) : (
          <CardTitle className="truncate text-base font-semibold tracking-tight text-slate-100">
            {project.name}
          </CardTitle>
        )}

        {isEditing ? (
          <Input
            className="mt-2 h-9 border-[#1b2732] bg-[#000102] px-3 text-sm text-white focus-visible:border-violet-300/40"
            placeholder="Project description (optional)"
            value={projectDescription}
            onChange={(event) => setProjectDescription(event.target.value)}
            onClick={(event) => event.stopPropagation()}
          />
        ) : (
          <CardDescription className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">
            {project.description || "A new space for your next idea."}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="relative flex items-center justify-between border-t border-white/[0.06] pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays className="size-3.5 text-slate-600" />
          <span>Created {createdDate}</span>
        </div>
        {isEditing ? (
          <button
            type="button"
            aria-label="Save project changes"
            disabled={isPending}
            onClick={handleUpdate}
            className="flex size-8 items-center justify-center rounded-lg text-violet-200 transition hover:bg-violet-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? <span className="size-4 animate-spin rounded-full border-2 border-violet-300/30 border-t-violet-200" /> : <Save className="size-4" />}
          </button>
        ) : (
          <button
            type="button"
            aria-label={`Edit ${project.name}`}
            onClick={(event) => {
              event.stopPropagation();
              setIsEditing(true);
            }}
            className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Pencil className="size-3.5" />
          </button>
        )}
      </CardContent>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border border-[#1b2732] bg-[#101820] text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete &quot;{project.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.05]"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                deleteProject(
                  { projectId: project.id },
                  {
                    onSuccess: () => {
                      setDeleteDialogOpen(false);
                      toast.success("Project is successfully deleted");
                    },
                    onError: (error) => {
                      if (axios.isAxiosError(error)) {
                        toast.error(error.response?.data?.error?.message || "Failed to delete project");
                        return;
                      }
                      toast.error("Failed to delete project");
                    },
                  },
                );
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
