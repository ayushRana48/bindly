import { supabase } from '../initSupabase';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { Post, DatabaseResponse } from '../types';

const expo = new Expo();

interface CreatePostParams {
  username: string;
  groupid: string;
  photolink: string;
  videolink: string;
  caption: string;
  timepost: string;
  startdate: string;
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
    created: string;
    users: {
      pfp: string;
    };
  }[];
}



async function createPost(params: CreatePostParams): Promise<DatabaseResponse<Post>> {
  const postid = uuidv4();
  const { username, groupid, photolink, videolink, caption, startdate, timepost, timecycle } = params;

  const { data, error } = await supabase
    .from('post')
    .insert([
      { postid, username, groupid, photolink, videolink, caption, startdate, timepost, timecycle }
    ])
    .select()
    .single();

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
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
  const { data, error } = await supabase
    .from('post')
    .select('*');

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}


async function getPost(postId: string): Promise<DatabaseResponse<Post>> {
  const { data, error } = await supabase
    .from('post')
    .select('*')
    .eq('postid', postId)
    .single();

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

async function getPostsByUsername(username: string): Promise<DatabaseResponse<Post[]>> {
  const { data, error } = await supabase
    .from('post')
    .select('*')
    .eq('username', username);

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

async function getPostsByGroupId(groupid: string): Promise<DatabaseResponse<Post[]>> {
  const { data, error } = await supabase
    .from('post')
    .select(`*`)
    .eq('groupid', groupid);

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

async function getInvalidPosts(username: string): Promise<DatabaseResponse<(Post & { groups: any })[]>> {
  const { data, error } = await supabase
    .from('post')
    .select(`*,
      groups:groupid(*)`)
    .eq('username', username)
    .eq('valid', false);

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

async function updatePost(postid: string, updateParams: UpdatePostParams): Promise<DatabaseResponse<Post>> {
  const { username, groupId, photolink, videolink, caption, time, prevFileName, timecycle } = updateParams;

  try {
    const { data, error } = await supabase
      .from('post')
      .update({ 
        postid, 
        username, 
        groupid: groupId, 
        photolink, 
        videolink, 
        caption, 
        timepost: time, 
        timecycle,
        veto: [],
        likes: [] 
      })
      .eq('postid', postid)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

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

    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function deletePost(postid: string): Promise<DatabaseResponse<{ message: string }>> {
  const { data, error } = await supabase
    .from('post')
    .delete()
    .eq('postid', postid);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: { message: 'success' }, error: null };
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
  const { data: userData, error: userError } = await supabase
    .from('usergroup')
    .select(`
      *,
      user:username!inner(
        tokens
      ),
      group:groupid!inner(
        groupname
      )
    `)
    .eq('groupid', groupid)
    .eq('username', username)
    .single();

  if (userError) {
    if (userError.message === 'JSON object requested, multiple (or no) rows returned') {
      return { data: null, error: new Error('user not in group') };
    }
    return { data: null, error: new Error(userError.message) };
  }

  const { data: postData, error: postError } = await supabase
    .from('post')
    .select('veto')
    .eq('postid', postid)
    .single();

  if (postError) {
    return { data: null, error: new Error(postError.message) };
  }

  const newVetoList = postData.veto || [];
  if (!newVetoList.includes(username)) {
    newVetoList.push(username);
  }

  const { data: updateData, error: updateError } = await supabase
    .from('post')
    .update({ veto: newVetoList })
    .eq('postid', postid)
    .select(`
      *,
      comment(commentid, username, message, created, users(pfp))
    `)
    .single();

  if (updateError) {
    return { data: null, error: new Error(updateError.message) };
  }

  const vetoCount = newVetoList.length;
  const ordinalVetoCount = getOrdinalSuffix(vetoCount);

  interface UserGroupData {
    user: {
      tokens: string[];
    };
    group: {
      groupname: string;
    };
  }

  const typedUserData = userData as unknown as UserGroupData;
  const tokens = typedUserData.user.tokens.filter((token: string) => Expo.isExpoPushToken(token));
  const notifications: ExpoPushMessage[] = tokens.map((token: string) => ({
    to: token,
    sound: 'default',
    title: `Bindly`,
    body: `You received your ${ordinalVetoCount} veto for group ${typedUserData.group.groupname}`,
  }));

  await sendBatchNotifications(notifications);

  return { data: updateData, error: null };
}

async function removeVeto(
  postid: string, 
  username: string, 
  groupid: string
): Promise<DatabaseResponse<PostWithComments>> {
  const { data: userData, error: userError } = await supabase
    .from('usergroup')
    .select('*')
    .eq('groupid', groupid)
    .eq('username', username)
    .single();

  if (userError) {
    if (userError.message === 'JSON object requested, multiple (or no) rows returned') {
      return { data: null, error: new Error('user not in group') };
    }
    return { data: null, error: new Error(userError.message) };
  }

  const { data: postData, error: postError } = await supabase
    .from('post')
    .select('veto')
    .eq('postid', postid)
    .single();

  if (postError) {
    return { data: null, error: new Error(postError.message) };
  }

  const newVetoList = postData.veto || [];
  const index = newVetoList.indexOf(username);
  if (index > -1) {
    newVetoList.splice(index, 1);
  }

  const { data: updateData, error: updateError } = await supabase
    .from('post')
    .update({ veto: newVetoList })
    .eq('postid', postid)
    .select(`
      *,
      comment(commentid, username, message, created, users(pfp))
    `)
    .single();

  return { 
    data: updateData, 
    error: updateError ? new Error(updateError.message) : null 
  };
}


async function addLike(
  postid: string, 
  username: string, 
  groupid: string
): Promise<DatabaseResponse<PostWithComments>> {
  const { data: userData, error: userError } = await supabase
    .from('usergroup')
    .select(`
      *,
      user:username!inner(
        tokens
      ),
      group:groupid!inner(
        groupname
      )
    `)
    .eq('groupid', groupid)
    .eq('username', username)
    .single();

  if (userError) {
    if (userError.message === 'JSON object requested, multiple (or no) rows returned') {
      return { data: null, error: new Error('user not in group') };
    }
    return { data: null, error: new Error(userError.message) };
  }

  const { data: postData, error: postError } = await supabase
    .from('post')
    .select('likes')
    .eq('postid', postid)
    .single();

  if (postError) {
    return { data: null, error: new Error(postError.message) };
  }

  const newLikeList = postData.likes || [];
  if (!newLikeList.includes(username)) {
    newLikeList.push(username);
  }

  const { data: updateData, error: updateError } = await supabase
    .from('post')
    .update({ likes: newLikeList })
    .eq('postid', postid)
    .select(`
      *,
      comment(commentid, username, message, created, users(pfp))
    `)
    .single();

  return { 
    data: updateData, 
    error: updateError ? new Error(updateError.message) : null 
  };
}

async function removeLike(
  postid: string, 
  username: string, 
  groupid: string
): Promise<DatabaseResponse<PostWithComments>> {
  const { data: userData, error: userError } = await supabase
    .from('usergroup')
    .select('*')
    .eq('groupid', groupid)
    .eq('username', username)
    .single();

  if (userError) {
    if (userError.message === 'JSON object requested, multiple (or no) rows returned') {
      return { data: null, error: new Error('user not in group') };
    }
    return { data: null, error: new Error(userError.message) };
  }

  const { data: postData, error: postError } = await supabase
    .from('post')
    .select('likes')
    .eq('postid', postid)
    .single();

  if (postError) {
    return { data: null, error: new Error(postError.message) };
  }

  const newLikeList = postData.likes || [];
  const index = newLikeList.indexOf(username);
  if (index > -1) {
    newLikeList.splice(index, 1);
  }

  const { data: updateData, error: updateError } = await supabase
    .from('post')
    .update({ likes: newLikeList })
    .eq('postid', postid)
    .select(`
      *,
      comment(commentid, username, message, created, users(pfp))
    `)
    .single();

  return { 
    data: updateData, 
    error: updateError ? new Error(updateError.message) : null 
  };
}

async function postStatus(
  username: string, 
  groupid: string
): Promise<{ data?: 'post' | 'edit', startdate?: Date, error?: Error }> {
  try {
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('startdate')
      .eq('groupid', groupid)
      .single();

    if (groupError) {
      return { error: new Error(groupError.message) };
    }

    const startdate = new Date(groupData.startdate);
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

    const { data: postData, error: postError } = await supabase
      .from('post')
      .select('timepost')
      .eq('username', username)
      .eq('groupid', groupid)
      .order('timepost', { ascending: false })
      .limit(1)
      .single();

    if (postError) {
      if (postError.message === 'JSON object requested, multiple (or no) rows returned') {
        return { data: 'post', startdate: cycleStartTime };
      }
      return { error: new Error(postError.message) };
    }

    const timepost = new Date(postData.timepost);
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

async function sendBatchNotifications(notifications: ExpoPushMessage[]): Promise<void> {
  const chunks = expo.chunkPushNotifications(notifications);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }
}



export { createPost, getAllPosts, getPost, getPostsByGroupId, getPostsByUsername, updatePost, deletePost, getPresignedUrl, compressVideo, postStatus, addVeto, removeVeto,addLike,removeLike, getInvalidPosts };
