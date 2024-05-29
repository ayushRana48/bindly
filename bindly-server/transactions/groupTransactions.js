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
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('groupid', groupid).single();

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
      console.log(userGroupError)

    if (userGroupError) {
      return { error: userGroupError.message };
    }


    const { data: inviteDate, error: inviteError } = await supabase
      .from('invite')
      .delete()
      .eq('groupid', groupId);
      console.log(inviteError)


    if (inviteError) {
      return { error: inviteError.message };
    }


    
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .delete()
      .eq('groupid', groupId);

      console.log(groupError)

    if (groupError) {
      return { error: groupError.message };
    }


    return { data: 'Successfully deleted group' };
  } catch (error) {
    console.log(error)
    return { error: error.message };
  }
}





module.exports = { createGroup, getAllGroups, getGroup, getGroupsByHostId, updateGroup, deleteGroup };
