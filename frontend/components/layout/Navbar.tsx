"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, LogOut, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useLogout, useMe } from "@/hooks/useAuth";

export default function Navbar() {
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { data, isPending, isError } = useMe();

  const {
    mutate: logout,
    isPending: isPendingLogout,
  } = useLogout();

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
    <nav className="flex items-center justify-between border-b border-white/10 bg-[#09090b] px-6 py-3 text-white">
      {/* Logo */}
      <Link
        href="/"
        className="text-xl font-semibold tracking-tight"
      >
        DevMate <span className="text-zinc-500">AI</span>
      </Link>

      <div className="flex items-center gap-5">
        {/* Dashboard */}
        <Link
          href="/"
          className="text-sm text-zinc-400 transition-colors hover:text-white"
        >
          Dashboard
        </Link>

        {/* Loading */}
        {isPending && (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#18181b]">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
          </div>
        )}

        {/* Not logged in */}
        {!isPending && (isError || !user) && (
          <Button
            type="button"
            onClick={() => router.push("/login")}
            className="h-9 bg-white px-4 text-sm font-medium text-black hover:bg-zinc-200"
          >
            Login
          </Button>
        )}

        {/* Logged in */}
        {!isPending && !isError && user && (
          <div className="relative">
            {/* Profile Button */}
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setIsProfileOpen((prev) => !prev)
              }
              className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-[#18181b] px-2 hover:bg-[#222225]"
            >
              {/* Avatar */}
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <span className="hidden max-w-24 truncate text-sm sm:block">
                {user.name}
              </span>

              <ChevronDown
                className={`h-4 w-4 text-zinc-500 transition-transform ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </Button>

            {/* Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#111113] shadow-2xl shadow-black/40">
                
                {/* User information */}
                <div className="border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {user.name}
                      </p>

                      <p className="truncate text-xs text-zinc-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu */}
                <div className="p-1">
                  
                  {/* Profile */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      toast.info("Profile settings coming soon");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>

                  {/* Logout */}
                  <button
                    type="button"
                    disabled={isPendingLogout}
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPendingLogout ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}

                    {isPendingLogout
                      ? "Logging out..."
                      : "Logout"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}