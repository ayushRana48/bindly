import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { Post, DatabaseResponse } from '../types';
import { sendBatchNotifications } from '../utils/sendNotificationUtil';
import { supabase } from '../initSupabase';

const prisma = new PrismaClient();
const expo = new Expo();

interface CreatePostParams {
  username: string;
  groupid: string;
  photolink: string;
  videolink: string;
  caption: string;
  timepost: string;
  timecycle: string;
}


interface UpdatePostParams {
  username: string;
  groupId: string;
  photolink: string;
  videolink: string;
  caption: string;
  time: string;
  prevFileName: string;
  timecycle: string;
}

interface PostWithComments extends Post {
  comment: {
    commentid: string;
    username: string;
    message: string;
    created: Date;
    users: {
      pfp: string | null;
    };
  }[];
}



async function createPost(params: CreatePostParams): Promise<DatabaseResponse<Post>> {
  try {
    const postid = uuidv4();
    const { username, groupid, photolink, videolink, caption, timepost, timecycle } = params;

    const data = await prisma.post.create({
      data: {
        postid,
        username,
        groupid,
        photolink,
        videolink,
        caption,
        timepost: new Date(timepost),
        timecycle: new Date(timecycle),
        veto: [],
        likes: []
      }
    });

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
  }
}

async function getPresignedUrl(
  fileName: string, 
  date: string, 
  isImage: boolean
): Promise<DatabaseResponse<{presignedUrl: string, permanentUrl: string}>> {
  try {
    let filePath = `${fileName}-${date}${isImage ? 'p' : 'v'}`;

    const { data, error } = await supabase
      .storage
      .from('posts')
      .createSignedUploadUrl(filePath); // URL expires in 60 seconds

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const permanentUrl = `https://lxnzgnvhkrgxpfsokwos.supabase.co/storage/v1/object/public/posts/${filePath}`;
    return { 
      data: { 
        presignedUrl: data.signedUrl, 
        permanentUrl 
      }, 
      error: null 
    };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function compressVideo(fileName: string): Promise<DatabaseResponse<any>> {
  try {
    console.log('Starting video compression process...');

    const { data: downloadData, error: downloadError } = await supabase
      .storage
      .from('posts')
      .createSignedUrl(fileName, 60);

    if (downloadError) {
      console.error('Error creating signed URL:', downloadError);
      return { data: null, error: new Error(downloadError.message) };
    }

    const response = await fetch(downloadData.signedUrl);
    if (!response.ok) {
      return { data: null, error: new Error(`Failed to fetch the video. Status: ${response.status}`) };
    }

    const arrayBuffer = await response.arrayBuffer();
    const videoBuffer = Buffer.from(arrayBuffer);

    const tempInputPath = path.join(os.tmpdir(), `${fileName}.mp4`);
    fs.writeFileSync(tempInputPath, videoBuffer);

    const outputPath = path.join(os.tmpdir(), 'compressed_' + fileName + '.mp4');
    const ffmpegPath = process.env.AWS_EXECUTION_ENV ? path.join(__dirname, '..', 'bin', 'ffmpeg') : 'ffmpeg';

    await new Promise<void>((resolve, reject) => {
      execFile(ffmpegPath, [
        '-i', tempInputPath,
        '-vf', 'scale=-2:1080',
        '-c:v', 'libx264',
        '-crf', '28',
        '-preset', 'fast',
        '-f', 'mp4',
        outputPath
      ], (error, stdout, stderr) => {
        if (error) {
          console.error('ffmpeg error:', error.message);
          reject(error);
        } else {
          resolve();
        }
      });
    });

    const compressedBuffer = fs.readFileSync(outputPath);

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('posts')
      .upload(fileName, compressedBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (uploadError) {
      return { data: null, error: new Error(uploadError.message) };
    }

    fs.unlinkSync(tempInputPath);
    fs.unlinkSync(outputPath);

    return { data: uploadData, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Compression process failed') 
    };
  }
}

async function getAllPosts(): Promise<DatabaseResponse<Post[]>> {
  try {
    const data = await prisma.post.findMany();
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
  }
}


async function getPost(postId: string): Promise<DatabaseResponse<Post>> {
  try {
    const data = await prisma.post.findUnique({
      where: { postid: postId }
    });
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
  }
}

async function getPostsByUsername(username: string): Promise<DatabaseResponse<Post[]>> {
  try {
    const data = await prisma.post.findMany({
      where: { username }
    });
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
  }
}

async function getPostsByGroupId(groupid: string): Promise<DatabaseResponse<Post[]>> {
  try {
    const data = await prisma.post.findMany({
      where: { groupid }
    });
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
  }
}

async function getInvalidPosts(username: string): Promise<DatabaseResponse<(Post & { groups: any })[]>> {
  try {
    const data = await prisma.post.findMany({
      where: {
        username,
        valid: false
      },
      include: {
        groups: true
      }
    });
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
  }
}

async function updatePost(postid: string, updateParams: UpdatePostParams): Promise<DatabaseResponse<Post>> {
  const { username, groupId, photolink, videolink, caption, time, prevFileName, timecycle } = updateParams;

  try {
    const updatedPost = await prisma.post.update({
      where: { postid },
      data: {
        username,
        groupid: groupId,
        photolink,
        videolink,
        caption,
        timepost: new Date(time),
        timecycle: new Date(timecycle),
        veto: [],
        likes: []
      }
    });

    // Keep the storage operations as they are since they're specific to your setup
    const { error: deleteError } = await supabase.storage
      .from('posts')
      .remove([`${prevFileName}v`]);

    if (deleteError && deleteError.message !== 'The resource was not found') {
      return { data: null, error: new Error(deleteError.message) };
    }

    const { error: deleteError2 } = await supabase.storage
      .from('posts')
      .remove([`${prevFileName}p`]);

    if (deleteError2 && deleteError2.message !== 'The resource was not found') {
      return { data: null, error: new Error(deleteError2.message) };
    }

    return { data: updatedPost, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function deletePost(postid: string): Promise<DatabaseResponse<{ message: string }>> {
  console.log("in delete post", postid);
  try {
    // Delete comments associated with the post
    await prisma.comment.deleteMany({
      where: { postid }
    });

    // Delete the post
    await prisma.post.delete({
      where: { postid }
    });

    return { data: { message: 'success' }, error: null };
  } catch (error: any) {
    console.log("error in delete post", error);
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
}


function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

async function addVeto(
  postid: string, 
  username: string, 
  groupid: string
): Promise<DatabaseResponse<PostWithComments>> {
  try {
    const userGroup = await prisma.usergroup.findFirst({
      where: {
        groupid,
        username
      },
      include: {
        users: {
          select: {
            tokens: true
          }
        },
        groups: {
          select: {
            groupname: true
          }
        }
      }
    });

    if (!userGroup) {
      return { data: null, error: new Error('user not in group') };
    }

    const post = await prisma.post.findUnique({
      where: { postid }
    });

    if (!post) {
      return { data: null, error: new Error('Post not found') };
    }

    const newVetoList = [...(post.veto || [])];
    if (!newVetoList.includes(username)) {
      newVetoList.push(username);
    }

    const updatedPost = await prisma.post.update({
      where: { postid },
      data: { veto: newVetoList },
      include: {
        comment: {
          include: {
            users: {
              select: {
                pfp: true
              }
            }
          }
        }
      }
    });

    const vetoCount = newVetoList.length;
    const ordinalVetoCount = getOrdinalSuffix(vetoCount);

    const tokens = userGroup.users.tokens.filter((token:string) => Expo.isExpoPushToken(token));
    const notifications: ExpoPushMessage[] = tokens.map((token:string) => ({
      to: token,
      sound: 'default',
      title: 'Bindly',
      body: `You received your ${ordinalVetoCount} veto for group ${userGroup.groups.groupname}`,
    }));

    await sendBatchNotifications(notifications);

    return { data: updatedPost, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
  }
}

async function removeVeto(
  postid: string, 
  username: string, 
  groupid: string
): Promise<DatabaseResponse<PostWithComments>> {
  try {
    const userGroup = await prisma.usergroup.findFirst({
      where: {
        groupid,
        username
      }
    });

    if (!userGroup) {
      return { data: null, error: new Error('user not in group') };
    }

    const post = await prisma.post.findUnique({
      where: { postid }
    });

    if (!post) {
      return { data: null, error: new Error('Post not found') };
    }

    const newVetoList = [...(post.veto || [])];
    const index = newVetoList.indexOf(username);
    if (index > -1) {
      newVetoList.splice(index, 1);
    }

    const updatedPost = await prisma.post.update({
      where: { postid },
      data: { veto: newVetoList },
      include: {
        comment: {
          include: {
            users: {
              select: {
                pfp: true
              }
            }
          }
        }
      }
    });

    return { data: updatedPost, error: null };
  } catch (error:any) {
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
}


async function addLike(
  postid: string, 
  username: string, 
  groupid: string
): Promise<DatabaseResponse<PostWithComments>> {
  try {
    const userGroup = await prisma.usergroup.findFirst({
      where: {
        groupid,
        username
      },
      include: {
        users: {
          select: {
            tokens: true
          }
        },
        groups: {
          select: {
            groupname: true
          }
        }
      }
    });

    if (!userGroup) {
      return { data: null, error: new Error('user not in group') };
    }

    const post = await prisma.post.findUnique({
      where: { postid }
    });

    if (!post) {
      return { data: null, error: new Error('Post not found') };
    }

    const newLikeList = [...(post.likes || [])];
    if (!newLikeList.includes(username)) {
      newLikeList.push(username);
    }

    const updatedPost = await prisma.post.update({
      where: { postid },
      data: { likes: newLikeList },
      include: {
        comment: {
          include: {
            users: {
              select: {
                pfp: true
              }
            }
          }
        }
      }
    });

    return { data: updatedPost, error: null };
  } catch (error: any) {
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
}

async function removeLike(
  postid: string, 
  username: string, 
  groupid: string
): Promise<DatabaseResponse<PostWithComments>> {
  try {
    const userGroup = await prisma.usergroup.findFirst({
      where: {
        groupid,
        username
      }
    });

    if (!userGroup) {
      return { data: null, error: new Error('user not in group') };
    }

    const post = await prisma.post.findUnique({
      where: { postid }
    });

    if (!post) {
      return { data: null, error: new Error('Post not found') };
    }

    const newLikeList = [...(post.likes || [])];
    const index = newLikeList.indexOf(username);
    if (index > -1) {
      newLikeList.splice(index, 1);
    }

    const updatedPost = await prisma.post.update({
      where: { postid },
      data: { likes: newLikeList },
      include: {
        comment: {
          include: {
            users: {
              select: {
                pfp: true
              }
            }
          }
        }
      }
    });

    return { data: updatedPost, error: null };
  } catch (error:any) {
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
}

async function postStatus(
  username: string, 
  groupid: string
): Promise<{ data?: 'post' | 'edit', startdate?: Date, error?: Error }> {
  try {
    const group = await prisma.groups.findUnique({
      where: { groupid },
      select: { startdate: true }
    });

    if (!group) {
      return { error: new Error('Group not found') };
    }

    const startdate = group.startdate;
    const currentTime = new Date();

    const cycleStartTime = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      startdate.getHours(),
      startdate.getMinutes(),
      startdate.getSeconds()
    );

    if (currentTime < cycleStartTime) {
      cycleStartTime.setDate(cycleStartTime.getDate() - 1);
    }

    const lastPost = await prisma.post.findFirst({
      where: { username, groupid },
      orderBy: { timepost: 'desc' },
      select: { timepost: true }
    });

    if (!lastPost) {
      return { data: 'post', startdate: cycleStartTime };
    }

    const timepost = lastPost.timepost;
    const cycleEndTime = new Date(cycleStartTime.getTime() + 24 * 60 * 60 * 1000);
    const isInSame24HourCycle = timepost >= cycleStartTime && timepost < cycleEndTime;
    const fourHoursAfterLastPost = new Date(timepost.getTime() + 2 * 60 * 60 * 1000);

    let status: 'post' | 'edit' | 'disable';
    if (isInSame24HourCycle) {
      status = 'edit';
    } else if (currentTime < fourHoursAfterLastPost) {
      status = "disable";
    } else {
      status = 'post';
    }

    return { data: status as 'post' | 'edit', startdate: cycleStartTime };
  } catch (error) {
    return { 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}



export { createPost, getAllPosts, getPost, getPostsByGroupId, getPostsByUsername, updatePost, deletePost, getPresignedUrl, compressVideo, postStatus, addVeto, removeVeto,addLike,removeLike, getInvalidPosts };
