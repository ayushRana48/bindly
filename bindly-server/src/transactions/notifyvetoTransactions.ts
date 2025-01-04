import { supabase } from '../initSupabase';
import { NotifyVeto, Post, Group, DatabaseResponse } from '../types';

interface NotifyVetoWithDetails extends NotifyVeto {
  post: Post;
  groups: Group;
}

async function getNotifyveto(username: string): Promise<DatabaseResponse<NotifyVetoWithDetails[]>> {
  const { data, error } = await supabase
    .from('notifyveto')
    .select(`
      *,
      post(*),
      groups:groupid(*)
    `)
    .eq('username', username);

  const { error: deleteError } = await supabase
    .from('notifyveto')
    .delete()
    .eq('username', username);

  if (deleteError) {
    return { data: null, error: new Error(deleteError.message) };
  }

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

export { getNotifyveto };