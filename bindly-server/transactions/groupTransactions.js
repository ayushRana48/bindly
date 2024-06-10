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

  // Sort post data by timepost, with later dates first
  const sortedPost = post ? post.sort((a, b) => new Date(b.timepost) - new Date(a.timepost)) : [];

  // Fetch history data
  const { data: history, error: historyError } = await supabase
    .from('history')
    .select('*')
    .eq('groupid', groupid);

  // Combine all errors into one if any
  const error = groupError || usergroupError || inviteError || postError || historyError;

  // Return an object with all the fetched data, including sorted posts
  return { data: { group, usergroup, invite, post: sortedPost, history }, error };
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
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('buyin')
      .eq('groupid', groupId)
      .single();

    if (groupError) {
      return { error: groupError.message };
    }

    const { data: userGroups, error: userGroupError } = await supabase
      .from('usergroup')
      .select('username')
      .eq('groupid', groupId);

    if (userGroupError) {
      return { error: userGroupError.message };
    }

    for (const userGroup of userGroups) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('username', userGroup.username)
        .single();

      if (userError) {
        return { error: userError.message };
      }

      const newBalance = userData.balance + groupData.buyin;

      const { data: balanceUpdate, error: balanceUpdateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('username', userGroup.username);

      if (balanceUpdateError) {
        return { error: balanceUpdateError.message };
      }
    }

    const { data: userGroupDelete, error: userGroupDeleteError } = await supabase
      .from('usergroup')
      .delete()
      .eq('groupid', groupId);

    if (userGroupDeleteError) {
      return { error: userGroupDeleteError.message };
    }

    const { data: inviteData, error: inviteError } = await supabase
      .from('invite')
      .delete()
      .eq('groupid', groupId);

    if (inviteError) {
      return { error: inviteError.message };
    }

    const { data: groupDelete, error: groupDeleteError } = await supabase
      .from('groups')
      .delete()
      .eq('groupid', groupId);

    if (groupDeleteError) {
      if (groupDelete.message == 'Not Found') {
        return { error: 'Not Found' };
      }
      return { error: groupDeleteError.message };
    }

    return { data: 'Successfully deleted group' };
  } catch (error) {
    return { error: error.message };
  }
}





module.exports = { createGroup, getAllGroups, getGroup, getGroupsByHostId, updateGroup, deleteGroup };
