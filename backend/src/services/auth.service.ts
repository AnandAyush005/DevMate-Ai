import type { z } from "zod";
import { ApiError } from "../utils/api-error.ts";
import { db } from "../prisma/db.ts";
import { loginSchema, registerSchema } from "../schemas/auth.schema.ts";
import { createAuthToken } from "./auth-token.service.ts";
import { hashPassword, verifyPassword } from "./password.service.ts";
import { isUniqueConstraintViolation } from "./database-error.service.ts";

type RegistrationInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

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
    const { passwordHash: _passwordHash, ...publicUser } = user;

    return {
      user: publicUser,
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

  const { passwordHash: _passwordHash, ...publicUser } = user;
  return {
    user: publicUser,
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
