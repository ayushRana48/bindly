const { supabase } = require('../initSupabase');
const { Expo } = require('expo-server-sdk');
const expo = new Expo();
const { v4: uuidv4 } = require('uuid');

async function createInvite(senderid, receiverid, groupid) {
  console.log('createInvite')
  const inviteid = uuidv4();

  const { data, error } = await supabase
    .from('invite')
    .insert([{ inviteid, senderid, receiverid, groupid }])
    .select()
    .single();

  if (error) {
    return { data, error };
  }

  // Fetch receiver's user details
  const { data: receiverData, error: receiverError } = await supabase
    .from('users')
    .select('username, tokens')
    .eq('username', receiverid)
    .single();

  if (receiverError) {
    console.log('receiver', receiverError);
    return { data, error: receiverError };
  }


  // Notify the receiver about the invite
  console.log(receiverData)

  const tokens = receiverData.tokens.filter(token => Expo.isExpoPushToken(token));

  if (tokens.length === 0) {
    console.log(`No valid tokens found for receiver ${receiverid}.`);
    return { data, error: null };
  }

  console.log(tokens,'tokens')

  const notifications = tokens.map(token => ({
    to: token,
    sound: 'default',
    title: `Bindly`,
    body: `You received an invite from ${senderid}`,
  }));

  await sendBatchNotifications(notifications);

  return { data, error: null };
}

async function sendBatchNotifications(notifications) {
  console.log('notifications',notifications)
  const chunks = expo.chunkPushNotifications(notifications);
  for (const chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);  // Log the response from Expo
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }
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
  const { data, error } = await supabase
    .from('invite')
    .delete()
    .eq('inviteid', inviteid)
    .select().single();


  return { data, error };
}

module.exports = { createInvite, getAllInvites, getInvite, getInvitesByGroupId, getInvitesBySender, getInvitesByReciever, updateInvite, deleteInvite };
