"use client";

import axios from "axios";
import Link from "next/link";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Code2, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePasswordResetToken, useResetPassword } from "@/hooks/useAuth";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const { isPending: isValidating, isError } = usePasswordResetToken(token);
  const { mutate, isPending } = useResetPassword();

  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    if (!passwords.password || !passwords.confirmPassword) {
      toast.error("Please enter and confirm your new password");
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    mutate(
      {
        token,
        password: passwords.password,
        confirmPassword: passwords.confirmPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password updated successfully");
          router.push("/");
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            toast.error(
              error.response?.data?.error?.message || "Unable to update password",
            );
            return;
          }

          toast.error("Something went wrong. Please try again.");
        },
      },
    );
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-55 h-125 w-125 -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -bottom-62.5 -right-25 h-100 w-100 rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-[#111113] p-8 shadow-2xl shadow-black/40">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white text-black shadow-lg shadow-white/10">
              <Code2 className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Set a new password
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Choose a new password for your DevMate account
            </p>
          </div>

          {isValidating ? (
            <div className="flex items-center justify-center py-10 text-zinc-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying reset link...
            </div>
          ) : isError ? (
            <div className="space-y-5 text-center">
              <p className="text-sm text-zinc-400">
                This reset link is invalid or has expired. Request a new one from the login page.
              </p>
              <Button
                render={<Link href="/login" />}
                className="h-11 w-full bg-white font-medium text-black transition-colors hover:bg-zinc-200"
              >
                Back to login
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium text-zinc-200">
                  New password
                </label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter a new password"
                    value={passwords.password}
                    onChange={(e) =>
                      setPasswords((prev) => ({ ...prev, password: e.target.value }))
                    }
                    disabled={isPending}
                    className="h-11 border-white/10 bg-[#18181b] pr-10 text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium text-zinc-200">
                  Confirm password
                </label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  disabled={isPending}
                  className="h-11 border-white/10 bg-[#18181b] text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
                />
              </div>

              <Button
                type="button"
                className="h-11 w-full bg-white font-medium text-black transition-colors hover:bg-zinc-200"
                disabled={isPending}
                onClick={handleSave}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
