const { supabase } = require('../initSupabase');

// Function to add a comment
async function addComment(postid, username, message) {
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from('comment')
    .insert([
      {
        postid: postid,
        username: username,
        message: message,
        created: timestamp,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}


async function getCommentByPost(postid) {
    const { data, error } = await supabase
      .from('comment')
      .select('commentid, username, message, created')
      .eq('postid', postid)
      .order('created', { ascending: false });
  
    if (error) {
      console.error('Error fetching comments:', error);
      return { data: null, error: error.message };
    }
  
    return { data, error: null };
  }

  module.exports = { addComment,getCommentByPost };
