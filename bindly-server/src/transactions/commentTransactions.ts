import { PrismaClient } from '@prisma/client';
import { Comment, DatabaseResponse } from '../types';

const prisma = new PrismaClient();

async function addComment(
  postid: string,
  groupid: string,
  username: string,
  message: string
): Promise<DatabaseResponse<Comment>> {
  const timestamp = new Date();

  try {
    // Check if the user is part of the group
    console.log("Checking if user is part of the group", ' the new Messashe');
    const userGroup = await prisma.usergroup.findMany({
      where: {
        groupid,
        username,
      },
      select: {
        username: true,
      },
    });
    console.log('usergorup from prisma');


    if (userGroup.length === 0) {
      return { data: null, error: new Error('User not in group') };
    }

    // Add the comment
    const comment = await prisma.comment.create({
      data: {
        postid,
        username,
        message,
        created: timestamp,
      },
    });

    return { data: comment, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
  }
}

async function getCommentByPost(postid: string): Promise<DatabaseResponse<Partial<Comment>[]>> {
  try {
    // Fetch comments by post ID
    const comments = await prisma.comment.findMany({
      where: { postid },
      select: {
        commentid: true,
        username: true,
        message: true,
        created: true,
      },
      orderBy: {
        created: 'desc',
      },
    });

    return { data: comments, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
  }
}

export { addComment, getCommentByPost };
