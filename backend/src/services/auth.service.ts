import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { z } from "zod";
import { ApiError } from "../utils/api-error.js";
import { env } from "../config/env.js";
import { authConfig } from "../config/auth.js";
import { db } from "../prisma/db.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { createAuthToken } from "./auth-token.service.js";
import { hashPassword, verifyPassword } from "./password.service.js";
import { isUniqueConstraintViolation } from "./database-error.service.js";
import { sendPasswordResetEmail } from "./mail.service.js";

type RegistrationInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

const toPublicUser = <T extends {
  passwordHash: string;
  passwordResetTokenHash?: string | null;
  passwordResetExpiresAt?: string | null;
}>(user: T) => {
  const {
    passwordHash: _passwordHash,
    passwordResetTokenHash: _passwordResetTokenHash,
    passwordResetExpiresAt: _passwordResetExpiresAt,
    ...publicUser
  } = user;

  return publicUser;
};

export const registerUserService = async (data: RegistrationInput) => {
  const existing = await db.orm.public.User
    .where({ email: data.email })
    .first();

  if (existing) {
    throw new ApiError(409, "EMAIL_TAKEN", "An account with this email already exists.");
  }

  try {
    const { name, email, password } = data;
    const user = await db.orm.public.User.create({
      name,
      email,
      passwordHash: await hashPassword(password),
    });
    return {
      user: toPublicUser(user),
      token: createAuthToken(user.id),
    };
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      throw new ApiError(409, "EMAIL_TAKEN", "An account with this email already exists.");
    }
    throw error;
  }
};

export const loginUserService = async (data: LoginInput) => {
  const user = await db.orm.public.User
    .where({ email: data.email })
    .first();

  if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  return {
    user: toPublicUser(user),
    token: createAuthToken(user.id),
  };
};

export const getCurrentUserService = async (userId: string) => {
  const user = await db.orm.public.User
    .where({ id: userId })
    .select("id", "name", "email", "createdAt", "updatedAt")
    .first();

  if (!user) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication is required.");
  }

  return user;
};

const hashPasswordResetToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const isValidResetExpiry = (expiresAt: string | null) => {
  if (!expiresAt) {
    return false;
  }

  const expiresAtMs = Date.parse(expiresAt);
  return Number.isFinite(expiresAtMs) && expiresAtMs > Date.now();
};

const tokensEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

const findUserForValidResetToken = async (token: string) => {
  const tokenHash = hashPasswordResetToken(token);
  const user = await db.orm.public.User
    .where({ passwordResetTokenHash: tokenHash })
    .first();

  if (
    !user?.passwordResetTokenHash ||
    !tokensEqual(user.passwordResetTokenHash, tokenHash) ||
    !isValidResetExpiry(user.passwordResetExpiresAt)
  ) {
    throw new ApiError(401, "INVALID_RESET_TOKEN", "This reset link is invalid or has expired.");
  }

  return user;
};

export const requestPasswordResetService = async (email: string) => {
  const user = await db.orm.public.User
    .where({ email })
    .first();

  if (!user) {
    return;
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + authConfig.passwordResetLifetimeSeconds * 1000,
  ).toISOString();

  await db.orm.public.User
    .where({ id: user.id })
    .update({
      passwordResetTokenHash: hashPasswordResetToken(token),
      passwordResetExpiresAt: expiresAt,
    });

  const resetUrl = `${env.frontendOrigin}/reset-password/${token}`;
  await sendPasswordResetEmail(user.email, resetUrl);
};

export const getPasswordResetUserIdService = async (token: string) => {
  const user = await findUserForValidResetToken(token);
  return user.id;
};

export const resetPasswordService = async (
  userId: string,
  token: string,
  password: string,
) => {
  const tokenHash = hashPasswordResetToken(token);
  const user = await db.orm.public.User
    .where({ id: userId, passwordResetTokenHash: tokenHash })
    .first();

  if (
    !user?.passwordResetTokenHash ||
    !tokensEqual(user.passwordResetTokenHash, tokenHash) ||
    !isValidResetExpiry(user.passwordResetExpiresAt)
  ) {
    throw new ApiError(401, "INVALID_RESET_TOKEN", "This reset link is invalid or has expired.");
  }

  const updated = await db.orm.public.User
    .where({
      id: userId,
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: user.passwordResetExpiresAt,
    })
    .update({
      passwordHash: await hashPassword(password),
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    });

  if (!updated) {
    throw new ApiError(401, "INVALID_RESET_TOKEN", "This reset link is invalid or has expired.");
  }

  return {
    user: toPublicUser(updated),
    token: createAuthToken(user.id),
  };
};
