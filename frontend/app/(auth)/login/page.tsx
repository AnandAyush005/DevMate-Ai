"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, Code2, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ForgotPasswordDialog from "@/components/auth/ForgotPasswordDialog";
import { useLogin } from "@/hooks/useAuth";

export default function Login() {
  const router = useRouter();

  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending } = useLogin();

  const handleLogin = () => {
    if (!loginCredentials.email || !loginCredentials.password) {
      toast.error("Please enter your email and password");
      return;
    }

    mutate(loginCredentials, {
      onSuccess: () => {
        toast.success("Login successful");
        router.push("/");
      },

      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.error?.message || "Login failed"
          );
          return;
        }

        toast.error("Something went wrong. Please try again.");
      },
    });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 text-white">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-55 h-125 w-125 -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

        <div className="absolute -bottom-62.5 -right-25 h-100 w-100 rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      {/* Login Container */}
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-[#111113] p-8 shadow-2xl shadow-black/40">
          
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white text-black shadow-lg shadow-white/10">
              <Code2 className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Sign in to continue to your DevMate workspace
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-200"
              >
                Email
              </label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={loginCredentials.email}
                onChange={(e) =>
                  setLoginCredentials((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                disabled={isPending}
                className="h-11 border-white/10 bg-[#18181b] text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-zinc-200"
              >
                Password
              </label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginCredentials.password}
                  onChange={(e) =>
                    setLoginCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  disabled={isPending}
                  className="h-11 border-white/10 bg-[#18181b] pr-10 text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <ForgotPasswordDialog />
            </div>

            {/* Login Button */}
            <Button
              type="button"
              className="h-11 w-full bg-white font-medium text-black transition-colors hover:bg-zinc-200 cursor-pointer"
              disabled={isPending}
              onClick={handleLogin}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </div>

          {/* Register */}
          <div className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-zinc-200 underline-offset-4 transition-colors hover:text-white hover:underline cursor-pointer"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-600">
          DevMate AI · Developer workspace
        </p>
      </div>
    </main>
  );
}