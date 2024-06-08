const { supabase } = require('../initSupabase');
const { uploadFile } = require('./uploadFile')
 

// Function to create a new group
async function createPost(username, groupid, photolink, videolink, caption,startdate) {
  const timepost = new Date(Date.now()).toISOString();
  let picUrl=""
  let vidUrl=""

  if(photolink){
    const fileName = username+groupid+'p'
    const {fileUrl, error } = await uploadFile(photolink, 'posts', fileName, null, timepost);
    if(!error){
      picUrl=fileUrl
    }
    else{
      return {error}

    }
  }

  if(videolink){
    const fileName = username+groupid+'v'
    const {fileUrl, error } = await uploadFile(videolink, 'posts', fileName, null, timepost);
    if(!error){
      vidUrl=fileUrl
    }
    else{
      return {error}
    }
  }

  const { data, error } = await supabase
    .from('post')
    .insert([
      { username, groupid, photolink:picUrl, videolink:vidUrl, caption,startdate,timepost }
    ]).select().single();

  return { data, error };
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
  
  const { data, error } = await supabase
    .from('post')
    .update(updateParams)
    .eq('postid', postid);

  return { data, error };
}

// Function to delete a group
async function deletePost(postid) {
  const { data, error } = await supabase
    .from('post')
    .delete()
    .eq('postid', postid);

  return { data, error };
}

module.exports = { createPost, getAllPosts, getPost, getPostsByGroupId, getPostsByUsername,updatePost, deletePost };
