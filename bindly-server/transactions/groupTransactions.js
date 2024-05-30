const fs = require('fs');
const path = require('path');
const { supabase } = require('../initSupabase');
const { uploadFile } = require('./uploadFile')


// Function to create a new group
async function createGroup(groupid, groupname, hostid, description, buyin, week, startdate, timeleft, enddate, filePath, tasksperweek) {
  const timestamp = new Date(Date.now()).toISOString();
  const { fileUrl, error: uploadError } = await uploadFile(filePath, 'groupProfiles', groupid, null, timestamp);


  if (uploadError) {
    return { data: null, error: uploadError };
  }


  let time = timestamp

  if (fileUrl.length == 0) {
    time = null
  }


  const { data, error } = await supabase
    .from('groups')
    .insert([
      {
        groupid,
        groupname,
        description,
        buyin,
        week,
        startdate,
        timeleft,
        hostid,
        enddate,
        pfp: fileUrl || "",
        tasksperweek,
        lastpfpupdate: time
      },
    ])
    .select()
    .single();



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
  // Fetch group data
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('groupid', groupid)
    .single();

  // Fetch usergroup data
  const { data: usergroup, error: usergroupError } = await supabase
    .from('usergroup')
    .select(`
    *,
    users!inner(*)  -- Perform an inner join with the groups table
  `)
    .eq('groupid', groupid);

  // Fetch invite data
  const { data: invite, error: inviteError } = await supabase
    .from('invite')
    .select('*')
    .eq('groupid', groupid);

  // Fetch post data
  const { data: post, error: postError } = await supabase
    .from('post')
    .select('*')
    .eq('groupid', groupid);

  // Fetch history data
  const { data: history, error: historyError } = await supabase
    .from('history')
    .select('*')
    .eq('groupid', groupid);

  // Combine all errors into one if any
  const error = groupError || usergroupError || inviteError || postError || historyError;

  // Return an object with all the fetched data
  return { data: { group, usergroup, invite, post, history }, error };
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
async function updateGroup(groupId, updateParams) {
  let newTimeStamp = null;
  let fileUrl = updateParams.pfp;

  if (updateParams.pfp) {
    newTimeStamp = new Date(Date.now()).toISOString();
    const { fileUrl: newFileUrl, error: uploadError } = await uploadFile(updateParams.pfp, 'groupProfiles', groupId, updateParams.lastpfpupdate, newTimeStamp);

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    fileUrl = newFileUrl;
  }

  const updateData = { ...updateParams, pfp: fileUrl };

  if (newTimeStamp) {
    updateData.lastpfpupdate = newTimeStamp;
  }

  const { data, error } = await supabase
    .from('groups')
    .update(updateData)
    .eq('groupid', groupId)
    .select()
    .single();

  return { data, error };
}


// Function to delete a group
async function deleteGroup(groupId) {
  try {
    const { data: userGroupData, error: userGroupError } = await supabase
      .from('usergroup')
      .delete()
      .eq('groupid', groupId);

    if (userGroupError) {
      return { error: userGroupError.message };
    }


    const { data: inviteDate, error: inviteError } = await supabase
      .from('invite')
      .delete()
      .eq('groupid', groupId);


    if (inviteError) {
      return { error: inviteError.message };
    }


    
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .delete()
      .eq('groupid', groupId);


    if (groupError) {
      return { error: groupError.message };
    }


    return { data: 'Successfully deleted group' };
  } catch (error) {
    return { error: error.message };
  }
}





module.exports = { createGroup, getAllGroups, getGroup, getGroupsByHostId, updateGroup, deleteGroup };
