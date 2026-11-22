"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Command,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useLogout, useMe } from "@/hooks/useAuth";

const navigation = [
  { label: "Features", href: "/#features" },
  { label: "About", href: "/#about" },
  { label: "Workspace", href: "/#workspace-preview" },
];

export default function Navbar() {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data, isPending, isError } = useMe();
  const { mutate: logout, isPending: isPendingLogout } = useLogout();
  const user = data?.data;

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        setIsProfileOpen(false);
        router.push("/login");
      },
      onError: () => {
        toast.error("Failed to logout. Please try again.");
      },
    });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1b2732] bg-background/90 text-white backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-12">
        <Link href="/" className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-4 focus-visible:ring-offset-background">
          <span className="flex size-9 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-500/90 text-white transition-colors duration-200 group-hover:bg-violet-400">
            <Command className="size-[18px]" />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.03em] text-slate-100">
            DevMate <span className="text-violet-300">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex lg:justify-self-center">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group relative rounded-sm py-2 text-[13px] font-medium text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              {item.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-teal-300/70 transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex lg:justify-self-end">
          {isPending && (
            <div className="flex size-9 items-center justify-center rounded-full border border-[#1b2732] bg-[#080d12]">
              <Loader2 className="size-4 animate-spin text-slate-400" />
            </div>
          )}

          {!isPending && (isError || !user) && (
            <>
              <Link href="/login" className="rounded-sm px-2 py-2 text-[13px] font-medium text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">
                Log in
              </Link>
              <Button
                type="button"
                onClick={() => router.push("/register")}
                className="h-9 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-violet-400"
              >
                <Sparkles className="mr-1.5 size-3.5" /> Get started
              </Button>
            </>
          )}

          {!isPending && !isError && user && (
            <>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-teal-300/15 bg-teal-300/[0.045] px-3 text-[13px] font-medium text-teal-100 transition hover:border-teal-300/30 hover:bg-teal-300/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              <LayoutDashboard className="size-3.5" /> Dashboard
            </Link>
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                aria-expanded={isProfileOpen}
                onClick={() => setIsProfileOpen((previous) => !previous)}
                className="flex h-9 items-center gap-2 rounded-full border border-[#1b2732] bg-[#080d12] px-2 hover:bg-[#141d27]"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-violet-400/15 text-xs font-semibold text-violet-200">
                  {user.name?.charAt(0).toUpperCase() || "D"}
                </span>
                <span className="hidden max-w-24 truncate text-sm sm:block">{user.name}</span>
                <ChevronDown className={`size-4 text-slate-500 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
              </Button>

              {isProfileOpen && (
                <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl border border-[#1b2732] bg-[#101820] animate-rise-in">
                  <div className="border-b border-white/[0.07] px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-400/15 text-sm font-semibold text-violet-200">
                        {user.name?.charAt(0).toUpperCase() || "D"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{user.name}</p>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        toast.info("Profile settings coming soon");
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                    >
                      <User className="size-4" /> Profile
                    </button>
                    <button
                      type="button"
                      disabled={isPendingLogout}
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-300 transition-colors hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPendingLogout ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                      {isPendingLogout ? "Logging out..." : "Log out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-lg border border-[#1b2732] bg-[#080d12] text-slate-300 transition-colors hover:bg-[#141d27] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 lg:hidden"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-[#1b2732] bg-[#080d12] px-5 py-3 lg:hidden">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 transition-colors hover:bg-[#141d27] hover:text-white"
              >
                <Sparkles className="size-4 text-violet-300" />
                {item.label}
              </Link>
            ))}
            {!isPending && !isError && user && (
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg border border-teal-300/10 bg-teal-300/[0.04] px-3 py-3 text-sm text-teal-100 transition-colors hover:bg-teal-300/[0.08]"
              >
                <LayoutDashboard className="size-4" /> Dashboard
              </Link>
            )}
            {!isPending && (!user || isError) && (
              <div className="mt-2 flex gap-2 border-t border-white/[0.07] pt-3">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 rounded-lg border border-[#1b2732] px-4 py-2.5 text-center text-sm text-slate-300">
                  Log in
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white">
                  Get started
                </Link>
              </div>
            )}
            {!isPending && user && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isPendingLogout}
                className="mt-2 flex items-center gap-3 border-t border-white/[0.07] px-3 py-3 text-sm text-rose-300 disabled:opacity-50"
              >
                {isPendingLogout ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                {isPendingLogout ? "Logging out..." : "Log out"}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
