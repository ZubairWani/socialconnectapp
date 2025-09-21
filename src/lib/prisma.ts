//src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// This prevents Next.js from creating a new PrismaClient instance on every hot reload
// in development. In production, it will only ever be created once.

// Add `prisma` to the NodeJS `globalThis` type
declare global {
  var prisma: PrismaClient | undefined;
}

// If `globalThis.prisma` exists, use it. Otherwise, create a new PrismaClient.
const prisma = globalThis.prisma || new PrismaClient();

// In development, set the global prisma instance to the one we just created.
// THE FIX IS HERE: The extra curly brace has been removed.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;