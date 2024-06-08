

const { createPost, getAllPosts, getPost, getPostsByGroupId, getPostsByUsername,updatePost, deletePost }= require('../transactions/postTransactions');

// Controller for creating a new user


const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://your-supabase-url.supabase.co', 'your-public-anon-key');

const getPresignedUrl = async (req, res) => {
    const { fileName, date,isImage } = req.body;

    try {
        // Generate the file path

        let filePath = `${fileName}-${date}`;

        if(isImage){
          filePath = `${fileName}-${date}p`;
        }
        else{
          filePath = `${fileName}-${date}v`;
        }

        // Create a signed URL for uploading
        const { signedURL, error } = await supabase
            .storage
            .from('posts')
            .createSignedUrl(filePath, 60); // URL expires in 60 seconds

        if (error) {
            throw error;
        }

        // Construct the permanent URL
        const permanentUrl = `https://lxnzgnvhkrgxpfsokwos.supabase.co/storage/v1/object/public/posts/${filePath}`;

        res.status(200).json({ presignedUrl: signedURL, permanentUrl });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



async function createPostController(req, res) {
  const { username,  groupId, photolink, videolink, caption,starddate} = req.body;

  try {
    const { data, error } = await createPost(username,  groupId, photolink, videolink, caption,starddate);

    if (error) throw error;
    res.status(200).json(data);
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


module.exports={createPostController,deletePostController,getAllPostsController,updatePostController,getPostController,getPostsByGroupIdController,getPostsByUsernameController,getPresignedUrl};

