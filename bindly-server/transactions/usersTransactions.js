const { supabase } = require('../initSupabase');
const { uploadFile } = require('./uploadFile')


// Create a new user
async function createUser(username, email, firstName,lastName, pfp) {
  const timestamp = new Date(Date.now()).toISOString();
  const { fileUrl, error: uploadError } = await uploadFile(pfp, 'userProfiles', username, null, timestamp);


  if (uploadError) {
    return { data: null, error: uploadError };
  }


  let time = timestamp

  if (pfp.length == 0) {
    time = null
  }



  const { data, error } = await supabase
    .from('users')
    .insert([{
      username, email, firstName,lastName, pfp: fileUrl || "", lastpfpupdate: time
    }]).select().single();

  return { data, error };
}



// Read user details
async function getUser(username) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  return { data, error };
}

async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  return { data, error };
}


async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')

  return { data, error };
}

// Update user details
async function updateUser(username, updateParams) {
  const newTimeStamp = new Date(Date.now()).toISOString();
  let fileUrl = updateParams.pfp;

  if (updateParams.pfp) {
    const { fileUrl: newFileUrl, error: uploadError } = await uploadFile(updateParams.pfp, 'userProfiles', username, updateParams.lastpfpupdate, newTimeStamp);

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    fileUrl = newFileUrl;
  }

  if (fileUrl == undefined) {
    fileUrl = ""
  }

  const { data, error } = await supabase
    .from('users')
    .update({ ...updateParams, pfp: fileUrl, lastpfpupdate: newTimeStamp })
    .eq('username', username)
    .select()
    .single();

  return { data, error };

}


// Delete a user
async function deleteUser(username) {
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('username', username);

  return { data, error };
}

module.exports = { createUser, getUser, updateUser, deleteUser, getAllUsers, getUserByEmail };
