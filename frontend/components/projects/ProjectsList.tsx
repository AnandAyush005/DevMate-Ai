"use client";

import { AlertCircle, FolderKanban, Sparkles } from "lucide-react";
import { useGetProjects } from "@/hooks/useProjects";
import ProjectCard from "./ProjectCard";

export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
};

export default function GetProjects() {
  const { data, isPending, isFetching, isError } = useGetProjects();

  if (isPending || isFetching) {
    return (
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-52 animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.025]"
            aria-hidden="true"
          >
            <div className="m-5 size-10 rounded-xl bg-white/[0.05]" />
            <div className="mx-5 mt-7 h-4 w-2/3 rounded bg-white/[0.06]" />
            <div className="mx-5 mt-3 h-3 w-1/2 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-[#1b2732] bg-[#080d12] px-6 text-center">
        <AlertCircle className="size-6 text-rose-300" />
        <p className="mt-3 text-sm font-medium text-slate-200">Couldn&apos;t load your projects</p>
        <p className="mt-1 text-sm text-slate-500">Please refresh the page and try again.</p>
      </div>
    );
  }

  const projects = data?.data ?? [];

  if (projects.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#1b2732] bg-[#080d12] px-6 py-10 text-center">
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-[#1b2732] bg-[#101820] text-violet-200">
          <FolderKanban className="size-6" />
          <Sparkles className="absolute -right-1 -top-1 size-4 text-cyan-200" />
        </div>
        <h3 className="relative mt-5 text-lg font-semibold text-slate-100">Your first project starts here</h3>
        <p className="relative mt-2 max-w-sm text-sm leading-6 text-slate-400">
          Create a project to bring your files, editor, and AI assistant into one focused workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project: Project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
