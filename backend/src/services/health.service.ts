import { db } from "../prisma/db.ts";

export const healthCheckService = async () => {
  await db.orm.public.Project.first();
};
