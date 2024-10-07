const { addComment, getCommentByPost } = require('../transactions/commentTransactions');

// Controller for adding a new comment
async function addCommentController(req, res) {
  const { postid, username, message } = req.body;

  try {
    const { data, error } = await addComment(postid, username, message);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Controller for getting comments for a specific post
async function getCommentByPostController(req, res) {
  const { postid } = req.params;

  try {
    const { data, error } = await getCommentByPost(postid);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  addCommentController,
  getCommentByPostController
};
