import { PrismaClient } from '@prisma/client';
import { User, DatabaseResponse } from '../types';

const prisma = new PrismaClient();

async function registerToken(username: string, token: string): Promise<DatabaseResponse<User>> {
  try {
    const user = await prisma.users.findUnique({
      where: { username },
      select: { tokens: true }
    });

    if (!user) {
      return { data: null, error: new Error('User not found') };
    }

    const newTokens = user.tokens;
    if (!newTokens.includes(token)) {
      newTokens.push(token);
    }

    const data = await prisma.users.update({
      where: { username },
      data: { tokens: newTokens }
    });

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
  }
}

async function removeToken(username: string, token: string): Promise<DatabaseResponse<User>> {
  try {
    const user = await prisma.users.findUnique({
      where: { username },
      select: { tokens: true }
    });

    if (!user) {
      return { data: null, error: new Error('User not found') };
    }

    const newTokens = user.tokens.filter((t: string) => t !== token);

    const data = await prisma.users.update({
      where: { username },
      data: { tokens: newTokens }
    });

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
  }
}

export { registerToken, removeToken };