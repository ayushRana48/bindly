const { supabase } = require('../initSupabase');
const { uploadFile } = require('./uploadFile')
const { v4: uuidv4 } = require('uuid');
// const ffmpeg = require('fluent-ffmpeg');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');




// Function to create a new group
async function createPost(username, groupid, photolink, videolink, caption, timepost, startdate) {

  const postid = uuidv4()


  const { data, error } = await supabase
    .from('post')
    .insert([
      { postid, username, groupid, photolink, videolink, caption, startdate, timepost }
    ]).select().single();

  return { data, error };
}


async function getPresignedUrl(fileName, date, isImage) {

  try {
    // Generate the file path

    let filePath = `${fileName}-${date}`;

    if (isImage) {
      filePath = `${fileName}-${date}p`;
    }
    else {
      filePath = `${fileName}-${date}v`;
    }

    // Create a signed URL for uploading
    const { data, error } = await supabase
      .storage
      .from('posts')
      .createSignedUploadUrl(filePath, 60); // URL expires in 60 seconds

    if (error) {
      throw error;
    }

    // Construct the permanent URL
    const permanentUrl = `https://lxnzgnvhkrgxpfsokwos.supabase.co/storage/v1/object/public/posts/${filePath}`;
    return ({ presignedUrl: data.signedUrl, permanentUrl })
  } catch (error) {
    return { error }
  }
};



async function compressVideo(fileName) {
  try {
    console.log('Starting video compression process...');

    // Step 1: Get a signed URL for the video
    const { data: downloadData, error: downloadError } = await supabase
      .storage
      .from('posts')
      .createSignedUrl(fileName, 60); // URL expires in 60 seconds

    if (downloadError) {
      console.error('Error creating signed URL:', downloadError);
      throw downloadError;
    }

    console.log('Signed URL:', downloadData.signedUrl);

    // Step 2: Fetch the video using the signed URL
    const response = await fetch(downloadData.signedUrl);
    if (!response.ok) {
      console.error('Failed to fetch the video. Status:', response.status);
      throw new Error('Failed to fetch the video.');
    }

    // Buffer the video data into memory
    const arrayBuffer = await response.arrayBuffer();
    const videoBuffer = Buffer.from(arrayBuffer);

    // Save the video buffer to the /tmp directory
    const tempInputPath = path.join(os.tmpdir(), `${fileName}.mp4`);
    fs.writeFileSync(tempInputPath, videoBuffer);
    console.log('Saved video to', tempInputPath);

    // Create a file path for the compressed output video
    const outputPath = path.join(os.tmpdir(), 'compressed_' + fileName + '.mp4');

    // Log the paths being used
    console.log('ffmpeg binary path:', process.env.AWS_EXECUTION_ENV ? path.join(__dirname, '..', 'bin', 'ffmpeg') : 'ffmpeg');
    console.log('Input video path:', tempInputPath);
    console.log('Output video path:', outputPath);

    const ffmpegPath = process.env.AWS_EXECUTION_ENV ? path.join(__dirname, '..', 'bin', 'ffmpeg') : 'ffmpeg';

    console.log(ffmpegPath)

    execFile(ffmpegPath, ['-version'], (error, stdout, stderr) => {
      if (error) {
        console.error('Error getting ffmpeg version:', error.message);
        return;
      }
      console.log('ffmpeg version:', stdout);
    });


    // Step 3: Compress the video using ffmpeg
    console.log('Starting video compression with ffmpeg...');
    await new Promise((resolve, reject) => {

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
          console.error('ffmpeg stderr:', stderr);
          console.log('ffmpeg stdout:', stdout);
          reject(error);
        } else {
          console.log('FFmpeg processing complete.');
          console.log('ffmpeg stdout:', stdout);
          console.log('ffmpeg stderr:', stderr);
          resolve();
        }
      });
    });

    console.log('Compressed video saved to', outputPath);

    // Step 4: Read the compressed video data
    const compressedBuffer = fs.readFileSync(outputPath);

    // Step 5: Upload the compressed video back to Supabase
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('posts')
      .upload(fileName, compressedBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading compressed video:', uploadError);
      throw uploadError;
    }

    console.log('Upload finished.');
    console.log(uploadData);

    // Delete the temporary files
    fs.unlinkSync(tempInputPath);
    fs.unlinkSync(outputPath);

    return uploadData;
  } catch (error) {
    console.error('Compression process error:', error);
    throw new Error('Compression process failed');
  }
}




// Function to get all groups
async function getAllPosts() {
  const { data, error } = await supabase
    .from('post')
    .select('*');

  return { data, error };
}

// Function to get a group by groupId
async function getPost(postId) {
  const { data, error } = await supabase
    .from('post')
    .select('*')
    .eq('postid', postId);

  return { data, error };
}

// Function to get groups by hostId
async function getPostsByUsername(username) {
  const { data, error } = await supabase
    .from('post')
    .select('*')
    .eq('username', username);

  return { data, error };
}

async function getPostsByGroupId(groupid) {
  const { data, error } = await supabase
    .from('post')
    .select('*')
    .eq('groupid', groupid);

  return { data, error };
}

async function updatePost(postid, updateParams) {
  console.log(updateParams);
  console.log('paramsABOVE');

  const { username, groupId, photolink, videolink, caption, time, prevFileName } = updateParams;

  try {
    // Update post
    const { data, error } = await supabase
      .from('post')
      .update({ postid, username, groupid: groupId, photolink, videolink, caption, timepost: time })
      .eq('postid', postid)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return { error };
    }

    console.log('dataBelow');
    console.log(data);

    // Delete old video file
    const { error: deleteError } = await supabase.storage
      .from('posts')
      .remove([`${prevFileName}v`]);

    if (deleteError && deleteError.message !== 'The resource was not found') {
      console.error('Error deleting old video file:', deleteError);
      return { error: deleteError };
    }

    // Delete old photo file
    const { error: deleteError2 } = await supabase.storage
      .from('posts')
      .remove([`${prevFileName}p`]);

    if (deleteError2 && deleteError2.message !== 'The resource was not found') {
      console.error('Error deleting old photo file:', deleteError2);
      return { error: deleteError2 };
    }

    return { data, error: null };
  } catch (e) {
    console.error('Unexpected error:', e);
    return { error: e };
  }
}

// Function to delete a group
async function deletePost(postid) {
  const { data, error } = await supabase
    .from('post')
    .delete()
    .eq('postid', postid);

  return { data, error };
}

async function postStatus(username, groupid) {
  try {
    // Fetch startdate from the groups table
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('startdate')
      .eq('groupid', groupid)
      .single();

    if (groupError) {
      console.error('Error fetching group data:', groupError);
      return { error: groupError };
    }

    const startdate = new Date(groupData.startdate);

    console.log('startdate',startdate)

    // Fetch the latest timepost from the post table
    const { data: postData, error: postError } = await supabase
      .from('post')
      .select('timepost')
      .eq('username', username)
      .order('timepost', { ascending: false })
      .limit(1)
      .single();

    if (postError) {
      console.error('Error fetching post data:', postError);
      return { error: postError };
    }

    const timepost = new Date(postData.timepost);
    console.log('timepost',timepost)

    // Calculate the current cycle start time based on startdate
    const currentTime = new Date();
    console.log('currentTime',currentTime)

    const cycleStartTime = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      startdate.getHours(),
      startdate.getMinutes(),
      startdate.getSeconds()
    );


    
    // If the current time is before today's cycle start time, use the previous day's cycle start time
    if (currentTime < cycleStartTime) {
      cycleStartTime.setDate(cycleStartTime.getDate() - 1);
    }

    const cycleEndTime = new Date(cycleStartTime.getTime() + 24 * 60 * 60 * 1000);

    const isInSame24HourCycle = timepost >= cycleStartTime && timepost < cycleEndTime;

    console.log(cycleStartTime)
    console.log(timepost)
    console.log(cycleEndTime)

    console.log(isInSame24HourCycle)

    return { data:isInSame24HourCycle };
  } catch (e) {
    console.error('Unexpected error:', e);
    return { error: e };
  }
}


module.exports = { createPost, getAllPosts, getPost, getPostsByGroupId, getPostsByUsername, updatePost, deletePost, getPresignedUrl, compressVideo,postStatus };
