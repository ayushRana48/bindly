

const { createPost,postStatus,addVeto,removeVeto, compressVideo, getAllPosts, getPost, getPostsByGroupId, getPresignedUrl, getPostsByUsername, updatePost, deletePost } = require('../transactions/postTransactions');
const path = require('path');

const { supabase } = require('../initSupabase');



// Example function to compress a video

const getPresignedUrlController = async (req, res) => {
  const { fileName, date, isImage } = req.body;
  try {
    const { presignedUrl, permanentUrl, error } = await getPresignedUrl(fileName, date, isImage);

    if (error) throw error;
    res.status(200).json({ presignedUrl, permanentUrl });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const postStatusController = async (req, res) => {
  const {username,groupId } = req.body;
  console.log(username,groupId)
  try {
    const { data,startdate, error } = await postStatus(username, groupId);
    if (error) throw error;
    res.status(200).json({data,startdate});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

async function createPostController(req, res) {
  const { username, groupId, photolink, videolink, caption, time, starddate,timecycle } = req.body;

  try {
    const { data, error } = await createPost(username, groupId, photolink, videolink, caption, time, starddate,timecycle);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function compressVideoController(req, res) {


  const { videolink } = req.body;


  // Assuming videolink is a relative path to the video file

  try {
    const { data, error } = await compressVideo(videolink);
    if (error) throw error;
    res.status(200).json('successfully compressed');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}



// Call the function to check the connection


// Controller for getting a user's details
async function getPostController(req, res) {
  const { postId } = req.params;

  try {
    const { data, error } = await getPost(postId);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function getPostsByGroupIdController(req, res) {
  const { groupId } = req.params;

  try {
    const { data, error } = await getPostsByGroupId(groupId);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function getPostsByUsernameController(req, res) {
  const { username } = req.params;

  try {
    const { data, error } = await getPostsByUsername(username);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}


async function getAllPostsController(req, res) {

  try {
    const { data, error } = await getAllPosts();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}
// Controller for updating a user's details
async function updatePostController(req, res) {
  console.log('call')

  const { postId } = req.params;
  const updateParams = req.body;

  console.log('call',postId)


  try {
    const { data, error } = await updatePost(postId, updateParams);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


async function addVetoController(req, res) {

  const{ postid,username,groupid} = req.body;

  try {
    const { data, error } = await addVeto(postid, username,groupid);
    console.log('errorfromcont',error)

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


async function removeVetoController(req, res) {

  const{ postid,username,groupid} = req.body;

  try {
    const { data, error } = await removeVeto(postid, username,groupid);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


// Controller for deleting a user
async function deletePostController(req, res) {
  const { postId } = req.params;

  try {
    const { data, error } = await deletePost(postId);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


module.exports = { createPostController, deletePostController, getAllPostsController, updatePostController, getPostController, getPostsByGroupIdController, getPostsByUsernameController, getPresignedUrlController, compressVideoController,postStatusController,addVetoController,removeVetoController };

