const fs = require('fs');
const path = require('path');
const { supabase } = require('../initSupabase');
const {uploadFile} = require('./uploadFile')


// Function to create a new group
async function createGroup(groupid, groupname, hostid, description, buyin, week, startdate, timeleft, enddate, filePath, tasksperweek) {
  const timestamp=new Date(Date.now()).toISOString();
  const { fileUrl, error: uploadError } = await uploadFile(filePath, 'groupProfiles', groupid,null,timestamp);


  if (uploadError) {
    return { data: null, error: uploadError };
  }


  let time= timestamp

  if(fileUrl.length==0){
    time=null
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
        lastpfpupdate:time
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
  const newTimeStamp = new Date(Date.now()).toISOString();
  let fileUrl = updateParams.pfp;

  if (updateParams.pfp) {
      const { fileUrl: newFileUrl, error: uploadError } = await uploadFile(updateParams.pfp, 'groupProfiles', groupid, updateParams.lastpfpupdate, newTimeStamp);

      if (uploadError) {
          return { data: null, error: uploadError };
      }

      fileUrl = newFileUrl;
  }

  if (fileUrl === undefined) {
      fileUrl = "";
  }

  const { data, error } = await supabase
      .from('groups')
      .update({ ...updateParams, pfp: fileUrl, lastpfpupdate: newTimeStamp })
      .eq('groupid', groupid)
      .select()
      .single();

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
