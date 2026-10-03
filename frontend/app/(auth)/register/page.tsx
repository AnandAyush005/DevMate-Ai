"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Code2, Eye, EyeOff, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRegister } from "@/hooks/useAuth";

export default function Register() {
  const router = useRouter();

  const [registerCredentials, setRegisterCredentials] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending } = useRegister();

  const handleRegister = () => {
    if (
      !registerCredentials.name ||
      !registerCredentials.email ||
      !registerCredentials.password
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    mutate(registerCredentials, {
      onSuccess: () => {
        toast.success("Account created successfully");
        router.push("/login");
      },

      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.error?.message ||
              "Registration failed"
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
        <div className="absolute left-1/2 top-[-220px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

        <div className="absolute bottom-[-250px] left-[-100px] h-[400px] w-[400px] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      {/* Register Container */}
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-[#111113] p-8 shadow-2xl shadow-black/40">
          
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white text-black shadow-lg shadow-white/10">
              <Code2 className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Start building with your DevMate workspace
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">

            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-zinc-200"
              >
                Name
              </label>

              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={registerCredentials.name}
                onChange={(e) =>
                  setRegisterCredentials((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                disabled={isPending}
                className="h-11 border-white/10 bg-[#18181b] text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
              />
            </div>

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
                value={registerCredentials.email}
                onChange={(e) =>
                  setRegisterCredentials((prev) => ({
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
                  placeholder="Create a password"
                  value={registerCredentials.password}
                  onChange={(e) =>
                    setRegisterCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  disabled={isPending}
                  className="h-11 border-white/10 bg-[#18181b] pr-10 text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
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

            {/* Register Button */}
            <Button
              type="button"
              className="h-11 w-full bg-white font-medium text-black transition-colors hover:bg-zinc-200"
              disabled={isPending}
              onClick={handleRegister}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </div>

          {/* Login */}
          <div className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-zinc-200 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Sign in
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