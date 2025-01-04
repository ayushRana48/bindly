import { supabase } from '../initSupabase';
import { User, DatabaseResponse } from '../types';

async function registerToken(username: string, token: string): Promise<DatabaseResponse<User>> {
  const { data, error } = await supabase
    .from('users')
    .select('tokens')
    .eq('username', username)
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const newTokens = data.tokens;
  if (!newTokens.includes(token)) {
    newTokens.push(token);
  }

  const { data: updateData, error: updateError } = await supabase
    .from('users')
    .update({ tokens: newTokens })
    .eq('username', username)
    .select()
    .single();

  return { 
    data: updateData, 
    error: updateError ? new Error(updateError.message) : null 
  };
}

async function removeToken(username: string, token: string): Promise<DatabaseResponse<User>> {
  const { data, error } = await supabase
    .from('users')
    .select('tokens')
    .eq('username', username)
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const newTokens = data?.tokens.filter((t: string) => t !== token);

  const { data: updateData, error: updateError } = await supabase
    .from('users')
    .update({ tokens: newTokens })
    .eq('username', username)
    .select()
    .single();

  return { 
    data: updateData, 
    error: updateError ? new Error(updateError.message) : null 
  };
}

export { registerToken, removeToken };