import { supabase } from '../initSupabase';
import { Comment, DatabaseResponse } from '../types';

async function addComment(
  postid: string, 
  groupid: string, 
  username: string, 
  message: string
): Promise<DatabaseResponse<Comment>> {
  const timestamp = new Date().toISOString();

  const { data: userGroupData, error: userGroupError } = await supabase
    .from('usergroup')
    .select('username')
    .eq('groupid', groupid);

  if (userGroupError) {
    return { data: null, error: new Error('Error fetching user group') };
  }

  const isUserInGroup = userGroupData.some((user) => user.username === username);

  if (!isUserInGroup) {
    return { data: null, error: new Error('User not in group') };
  }

  const { data, error } = await supabase
    .from('comment')
    .insert([{
      postid,
      username,
      message,
      created: timestamp,
    }])
    .select()
    .single();

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

async function getCommentByPost(postid: string): Promise<DatabaseResponse<Partial<Comment>[]>> {
  const { data, error } = await supabase
    .from('comment')
    .select('commentid, username, message, created')
    .eq('postid', postid)
    .order('created', { ascending: false });

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

export { addComment, getCommentByPost };