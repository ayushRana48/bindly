const { supabase } = require('../initSupabase');

// Function to create a new group
async function createUserGroup(usergroupid,username, groupid, strikes, moneypaid, moneyowed) {
  const { data, error } = await supabase
    .from('usergroup')
    .insert([
      { usergroupid,username, groupid, strikes, moneypaid, moneyowed }
    ]);
  return { data, error };
}

// Function to get all groups
// Function to get all groups
async function getAllUserGroups() {
  const { data, error } = await supabase
    .from('usergroup')
    .select(`
      *,
      groups:groups!inner(*)  -- Perform an inner join with the groups table
    `);

  return { data, error };
}


// Function to get a group by groupId
async function getUserGroupsByGroupId(groupid) {
  const { data, error } = await supabase
    .from('usergroup')
    .select(`
      *,
      groups:groups!inner(*)  -- Perform an inner join with the groups table
    `)
    .eq('groupid', groupid);

  return { data, error };
}



// Function to get groups by hostId
// Function to get groups by username
async function getUserGroupsByUsername(username) {
  const { data, error } = await supabase
    .from('usergroup')
    .select(`
      *,
      groups:groups!inner(*)  -- Perform an inner join with the groups table
    `)
    .eq('username', username);

  return { data, error };
}


// Function to get a group by userGroupId
async function getUserGroup(userGroupId) {
  const { data, error } = await supabase
    .from('usergroup')
    .select(`
      *,
      groups:groups!inner(*)  -- Perform an inner join with the groups table
    `)
    .eq('usergroupid', userGroupId);

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
