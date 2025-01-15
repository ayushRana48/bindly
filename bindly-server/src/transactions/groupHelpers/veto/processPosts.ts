import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Adjust according to your Prisma schema
interface PostRecord {
  postid: string;
  username: string;
  timecycle: Date | null;  // or Date, depending on your Prisma schema
  veto: string[];     // array of usernames who vetoed the post
  valid: boolean | null;
}

async function processPosts(
  prisma: PrismaClient,
  postData: PostRecord[],
  memberCount: number,
  groupid: string
): Promise<void> {
  // 48-hour cutoff
  const currentTime = new Date();
  const cutoffTime = new Date(currentTime.getTime() - 48 * 60 * 60 * 1000);

  // Filter posts older than 48 hours
  const latePosts = postData.filter(
    (post) => post.timecycle && new Date(post.timecycle) < cutoffTime
  );

  if (latePosts.length === 0) {
    return; // Nothing to do
  }

  // Partition into "to invalidate" vs. "to validate"
  const threshold = Math.ceil(memberCount / 2);
  const postIdsToInvalidate = latePosts
    .filter((post) => post.veto.length >= threshold)
    .map((post) => post.postid);

  const postIdsToValidate = latePosts
    .filter((post) => post.veto.length < threshold)
    .map((post) => post.postid);

  // Validate posts
  if (postIdsToValidate.length > 0) {
    await prisma.post.updateMany({
      where: {
        postid: { in: postIdsToValidate }
      },
      data: {
        valid: true
      }
    });
  }

  // Invalidate posts
  if (postIdsToInvalidate.length > 0) {
    await prisma.post.updateMany({
      where: {
        postid: { in: postIdsToInvalidate }
      },
      data: {
        valid: false
      }
    });

    // Build notifications for invalidated posts
    const notifications = latePosts
      .filter((post) => postIdsToInvalidate.includes(post.postid))
      .map((post) => ({
        id: uuidv4(),  // Assuming your schema uses 'id' instead of 'notifyvetoid'
        postid: post.postid,
        username: post.username,
        groupid: groupid,
      }));

    if (notifications.length > 0) {
      await prisma.notifyveto.createMany({
        data: notifications
      });
    }
  }
}

export { processPosts };