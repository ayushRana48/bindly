const { supabase } = require('../initSupabase');
const { v4: uuidv4 } = require('uuid');

// Function to create a new group
async function createInvite(senderid, receiverid, groupid) {
  const inviteid = uuidv4()

  console.log('here')
  const { data, error } = await supabase
    .from('invite')
    .insert([
      { inviteid, senderid, receiverid, groupid }
    ]).select().single();

  console.log(data, error, 'at transaction')

  return { data, error };
}

// Function to get all groups
async function getAllInvites() {
  const { data, error } = await supabase
    .from('invite')
    .select('*');

  return { data, error };
}

// Function to get a group by groupId
async function getInvite(inviteId) {
  const { data, error } = await supabase
    .from('invite')
    .select('*')
    .eq('inviteid', inviteId);

  return { data, error };
}

// Function to get groups by hostId
async function getInvitesBySender(username) {
  const { data, error } = await supabase
    .from('invite')
    .select('*')
    .eq('senderid', username);

  return { data, error };
}

async function getInvitesByReciever(username) {
  const { data, error } = await supabase
    .from('invite')
    .select(`
      *,
      groups:groups!inner(*)  -- Perform an inner join with the groups table
    `)
    .eq('receiverid', username);

  return { data, error };
}

async function getInvitesByGroupId(groupid) {
  const { data, error } = await supabase
    .from('invite')
    .select('*')
    .eq('groupid', groupid);

  return { data, error };
}

// Function to update a group
async function updateInvite(inviteid, updateParams) {
  const { data, error } = await supabase
    .from('invite')
    .update(updateParams)
    .eq('inviteid', inviteid);

  return { data, error };
}

// Function to delete a group
async function deleteInvite(inviteid) {
  console.log(inviteid)
  const { data, error } = await supabase
    .from('invite')
    .delete()
    .eq('inviteid', inviteid)
    .select().single();

  console.log('deleteTran',data)
  console.log('deleteTran',error)

  return { data, error };
}

module.exports = { createInvite, getAllInvites, getInvite, getInvitesByGroupId, getInvitesBySender, getInvitesByReciever, updateInvite, deleteInvite };
