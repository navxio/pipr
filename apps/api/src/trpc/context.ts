import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
export const createContext = () => ({ prisma });
export type Context = ReturnType<typeof createContext>;
