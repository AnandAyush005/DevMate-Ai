import { z } from "zod";

const emailSchema = z.string().trim().email().max(254).toLowerCase();

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: emailSchema,
  password: z.string().min(12).max(128),
}).strict();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
}).strict();

export const forgotPasswordSchema = z.object({
  email: emailSchema,
}).strict();

export const resetPasswordTokenParamSchema = z
  .string()
  .trim()
  .min(32)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/);

export const resetPasswordSchema = z.object({
  password: z.string().min(12).max(128),
  confirmPassword: z.string().min(12).max(128),
}).strict().refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});
