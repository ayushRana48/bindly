

const { createPost, getAllPosts, getPost, getPostsByGroupId, getPostsByUsername,updatePost, deletePost }= require('../transactions/postTransactions');

// Controller for creating a new user
async function createPostController(req, res) {
  console.log("reachhs")
  const { username,  groupId, strikes, moneypaid, moneyowed} = req.body;

  try {
    const { data, error } = await createPost(username, groupId, strikes, moneypaid, moneyowed);

    if (error) throw error;
    res.status(201).json(data);
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
  const { postId } = req.params;
  const updateParams = req.body;


  try {
    const { data, error } = await updatePost(postId, updateParams);

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


module.exports={createPostController,deletePostController,getAllPostsController,updatePostController,getPostController,getPostsByGroupIdController,getPostsByUsernameController};

