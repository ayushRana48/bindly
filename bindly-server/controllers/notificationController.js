

const { createPost,postStatus, getInvalidPosts,addVeto,removeVeto, compressVideo, getAllPosts, getPost, getPostsByGroupId, getPresignedUrl, getPostsByUsername, updatePost, deletePost } = require('../transactions/postTransactions');
const {registerToken,removeToken} = require('../transactions/notificationTransactions');



// Example function to compress a video

const registerTokenController = async (req, res) => {
  console.log('controller Reg')
  const { username,token } = req.body;
  try {
    const { data, error } = await registerToken(username, token);

    if (error) throw error;
    res.status(200).json({data});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const removeTokenController = async (req, res) => {

    const { username,token } = req.body;
    console.log('controller Rem',username,token)

    try {
      const { data, error } = await removeToken(username, token);
  
      if (error) throw error;
      res.status(200).json({data});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  

module.exports = { registerTokenController, removeTokenController };

