declare global {
  namespace Express {
    interface Request {
      authenticatedUserId?: string;
      passwordResetUserId?: string;
    }
  }
}

export {};
