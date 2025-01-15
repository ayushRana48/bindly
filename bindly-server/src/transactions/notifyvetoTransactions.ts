import { PrismaClient } from '@prisma/client';
import { NotifyVeto, Post, Group, DatabaseResponse } from '../types';

const prisma = new PrismaClient();

interface NotifyVetoWithDetails extends NotifyVeto {
  post: Post;
  groups: Group;
}

async function getNotifyveto(username: string): Promise<DatabaseResponse<NotifyVetoWithDetails[]>> {
  try {
    // First fetch the notifications
    const data = await prisma.notifyveto.findMany({
      where: { username },
      include: {
        post: true,
        groups: true
      }
    });

    // Then delete them in the same transaction
    await prisma.notifyveto.deleteMany({
      where: { username }
    });

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
  }
}

export { getNotifyveto };