const { supabase } = require('../initSupabase');

// Function to create a new group
async function createGroup(groupname, hostid, description, moneypot, week, startdate, timeleft) {
  const { data, error } = await supabase
    .from('groups')
    .insert([
      { groupname, description, moneypot, week, startdate, timeleft, hostid }
    ]);

  return { data, error };
}

// Function to get all groups
async function getAllGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select('*');

  return { data, error };
}

// Function to get a group by groupId
async function getGroup(groupid) {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('groupid', groupid);

  return { data, error };
}

// Function to get groups by hostId
async function getGroupsByHostId(hostid) {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('hostid', hostid);

  return { data, error };
}

// Function to update a group
async function updateGroup(groupid, updateParams) {
  const { data, error } = await supabase
    .from('groups')
    .update(updateParams)
    .eq('groupid', groupid);

  return { data, error };
}

// Function to delete a group
async function deleteGroup(groupid) {
  const { data, error } = await supabase
    .from('groups')
    .delete()
    .eq('groupid', groupid);

  return { data, error };
}

module.exports = { createGroup, getAllGroups, getGroup, getGroupsByHostId, updateGroup, deleteGroup };
