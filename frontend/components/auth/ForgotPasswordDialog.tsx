"use client";

import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRequestPasswordReset } from "@/hooks/useAuth";

export default function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { mutate, isPending } = useRequestPasswordReset();

  const handleSendResetLink = () => {
    if (!email.trim()) {
      toast.error("Please enter your registered email");
      return;
    }

    mutate(
      { email: email.trim() },
      {
        onSuccess: () => {
          setEmail("");
          setOpen(false);
          toast.success("If this email is registered, a reset link has been sent.");
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            toast.error(
              error.response?.data?.error?.message || "Unable to send reset email",
            );
            return;
          }

          toast.error("Something went wrong. Please try again.");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-sm font-medium text-zinc-400 underline-offset-4 transition-colors hover:text-white hover:underline">
        Reset password
      </DialogTrigger>

      <DialogContent className="border-white/10 bg-[#111113] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Reset password</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Enter your registered email and we will send you a password reset link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="reset-email" className="text-sm font-medium text-zinc-200">
            Registered email
          </label>
          <Input
            id="reset-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            className="h-11 border-white/10 bg-[#18181b] text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
          />
        </div>

        <Button
          type="button"
          className="h-11 w-full bg-white font-medium text-black transition-colors hover:bg-zinc-200"
          disabled={isPending}
          onClick={handleSendResetLink}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending link...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
