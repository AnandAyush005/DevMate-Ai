"use client";

import Link from "next/link";
import axios from "axios";
import { AlertCircle, ArrowRight, FolderKanban, LogIn } from "lucide-react";
import CreateProjectButton from "@/components/projects/CreateProjectButton";
import GetProjects from "@/components/projects/ProjectsList";
import { useMe } from "@/hooks/useAuth";

function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
      <div className="animate-pulse">
        <div className="h-3 w-24 rounded bg-white/[0.07]" />
        <div className="mt-4 h-9 w-72 max-w-full rounded-lg bg-white/[0.08]" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-white/[0.05]" />
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-52 animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.025]"
            aria-hidden="true"
          />
        ))}
      </div>
    </main>
  );
}

export default function DashboardView() {
  const { data, isPending, isError, error, refetch } = useMe();
  const user = data?.data;
  const isUnauthenticated =
    isError && axios.isAxiosError(error) && error.response?.status === 401;

  if (isPending) return <DashboardLoading />;

  if (isError && !isUnauthenticated) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-5 py-16 sm:px-8">
        <div className="max-w-md rounded-2xl border border-[#1b2732] bg-[#080d12] p-8 text-center">
          <AlertCircle className="mx-auto size-7 text-rose-300" />
          <h1 className="mt-4 text-xl font-semibold text-slate-100">We couldn&apos;t verify your session</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Try again to load your account and workspace.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-5 py-16 sm:px-8">
        <div className="relative max-w-lg overflow-hidden rounded-2xl border border-[#1b2732] bg-[#080d12] p-8 text-center sm:p-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-violet-300/10 bg-violet-400/[0.06] text-violet-200">
            <FolderKanban className="size-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">Your workspace awaits</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Sign in to manage projects, open your files, and continue building with DevMate AI.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-400">
              <LogIn className="size-4" /> Sign in
            </Link>
            <Link href="/register" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-medium text-slate-200 transition hover:bg-white/[0.05]">
              Create account <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14 lg:px-12">
      <section className="mb-10 flex flex-col gap-6 border-b border-white/[0.07] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Your developer workspace</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Welcome back, <span className="bg-gradient-to-r from-violet-200 to-teal-200 bg-clip-text text-transparent">{user.name || "builder"}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Your projects are ready when you are. Pick up where you left off or start something new.
          </p>
          <p className="mt-3 text-xs text-slate-500">{user.email}</p>
        </div>
        <CreateProjectButton />
      </section>

      <section aria-labelledby="projects-heading">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 id="projects-heading" className="text-lg font-semibold text-slate-100">Your projects</h2>
            <p className="mt-1 text-sm text-slate-500">A home for the things you&apos;re building.</p>
          </div>
        </div>
        <GetProjects />
      </section>
    </main>
  );
}
