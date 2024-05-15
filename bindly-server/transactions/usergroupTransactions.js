const { supabase } = require('../initSupabase');

// Function to create a new group
async function createUserGroup(username, groupid, strikes, moneypaid, moneyowed) {
  const { data, error } = await supabase
    .from('usergroup')
    .insert([
      { username, groupid, strikes, moneypaid, moneyowed }
    ]);

  return { data, error };
}

// Function to get all groups
async function getAllUserGroups() {
  const { data, error } = await supabase
    .from('usergroup')
    .select('*');

  return { data, error };
}

// Function to get a group by groupId
async function getUserGroup(userGroupId) {
  const { data, error } = await supabase
    .from('usergroup')
    .select('*')
    .eq('usergroupid', userGroupId);

  return { data, error };
}

// Function to get groups by hostId
async function getUserGroupsByUsername(username) {
  const { data, error } = await supabase
    .from('usergroup')
    .select('*')
    .eq('username', username);

  return { data, error };
}

async function getUserGroupsByGroupId(groupid) {
    const { data, error } = await supabase
      .from('usergroup')
      .select('*')
      .eq('groupid', groupid);
  
    return { data, error };
}

// Function to update a group
async function updateUserGroup(usergroupid, updateParams) {
  const { data, error } = await supabase
    .from('usergroup')
    .update(updateParams)
    .eq('usergroupid', usergroupid);

  return { data, error };
}

// Function to delete a group
async function deleteUserGroup(usergroupid) {
  const { data, error } = await supabase
    .from('usergroup')
    .delete()
    .eq('usergroupid', usergroupid);

  return { data, error };
}

module.exports = { createUserGroup, getAllUserGroups, getUserGroup, getUserGroupsByGroupId, getUserGroupsByUsername,updateUserGroup, deleteUserGroup };
