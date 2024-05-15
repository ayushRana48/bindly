const { supabase } = require('../initSupabase');

// Create a new user
async function createUser(username, email, name, pfp) {

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, email, name, pfp }]);

    return { data: { username, email, name, pfp }, error };
  } catch (error) {
    console.error("Error occurred during insertion:", error);
    return { data: data, error: error.message };
  }
}



// Read user details
async function getUser(username) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username);

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
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updateParams)
      .eq('username', username)

    if (error) {
      console.log(error)
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}


// Delete a user
async function deleteUser(username) {
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('username', username);

  return { data, error };
}

module.exports = { createUser, getUser, updateUser, deleteUser, getAllUsers };
