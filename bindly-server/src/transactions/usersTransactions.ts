import { supabase } from '../initSupabase';
import { uploadFile } from './uploadFile';
import { reauthorizeStrava } from './stravaTransactions';
import { User, DatabaseResponse } from '../types';


// Create a new user
export async function createUser(
  username: string, 
  email: string, 
  firstName: string,
  lastName: string, 
  pfp: string
): Promise<DatabaseResponse<User>> {
  const timestamp = new Date(Date.now()).toISOString();
  const { fileUrl, error: uploadError } = await uploadFile(pfp, 'userProfiles', username, null, timestamp);

  if (uploadError) {
    return { data: null, error: uploadError };
  }

  let time = timestamp;

  if (pfp.length === 0) {
    time = timestamp;
  }

  const { data, error } = await supabase
    .from('users')
    .insert([{
      username,
      email,
      firstName,
      lastName,
      pfp: fileUrl || "",
      lastpfpupdate: time
    }])
    .select()
    .single();

    return { 
      data: data as User, 
      error: error ? new Error(error.message) : null 
    };}

// Read user details
export async function getUser(username: string): Promise<DatabaseResponse<User>> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  let res = data;

  if (data?.stravarefresh) {
    const { data: reauthData, error: reauthError } = await reauthorizeStrava(data.stravarefresh, username);

    if (reauthError || !reauthData?.access_token) {
      res.stravarefresh = null;
    }
  }

  return { 
    data: res as User, 
    error: error ? new Error(error.message) : null 
  };
}

export async function getUserByEmail(email: string): Promise<DatabaseResponse<User>> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

    return { 
      data: data as User, 
      error: error ? new Error(error.message) : null 
    };
}

export async function getAllUsers(): Promise<DatabaseResponse<User[]>> {
  const { data, error } = await supabase
    .from('users')
    .select('*');
    return { 
      data: data as User[], 
      error: error ? new Error(error.message) : null 
    };
}

// Update user details
export async function updateUser(
  username: string, 
  updateParams: Partial<User>
): Promise<DatabaseResponse<User>> {
  const newTimeStamp = new Date(Date.now()).toISOString();
  let fileUrl = updateParams.pfp;

  if (updateParams.pfp) {
    const { fileUrl: newFileUrl, error: uploadError } = await uploadFile(
      updateParams.pfp,
      'userProfiles',
      username,
      updateParams.lastpfpupdate?.toString() || null,
      newTimeStamp
    );

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    fileUrl = newFileUrl;
  }

  if (fileUrl === undefined) {
    fileUrl = "";
  }

  const { data, error } = await supabase
    .from('users')
    .update({ ...updateParams, pfp: fileUrl, lastpfpupdate: newTimeStamp })
    .eq('username', username)
    .select()
    .single();

    return { 
      data: data as User, 
      error: error ? new Error(error.message) : null 
    };
}

// Delete a user
export async function deleteUser(username: string): Promise<DatabaseResponse<User>> {
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('username', username);

    return { 
      data: data, 
      error: error ? new Error(error.message) : null 
    };
}
