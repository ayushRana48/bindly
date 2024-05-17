const { supabase } = require('../initSupabase');
const fs = require('fs');
const path = require('path');

// Function to create a new group
async function createGroup(groupid,groupname, hostid, description, buyin, week, startdate, timeleft, enddate, filePath) {
  let pfp=""
  try{

  console.log(filePath, 'uri')

  if (filePath.uri) {
    const fileUri = filePath.uri.replace('file://', '');

    console.log('herke')

    const fileData = fs.readFileSync(fileUri);
    console.log('here')


    const fileExt = path.extname(fileUri).substring(1); // 
    console.log('here')
    const { data: imageData, error: imageError } = await supabase.storage
      .from('groupProfiles')
      .upload(`${groupid}`, fileData, {
        contentType: `image/${fileExt}`,
        upsert: true,
      });

    console.log(imageData)
    console.log(imageError)

    if (imageError) {
      console.error('Error uploading file:', imageError);
      return { data: null, error: imageError };

    } else {

      // Construct the file URL
      pfp = `https://${'lxnzgnvhkrgxpfsokwos.supabase.co'}/storage/v1/object/public/groupProfiles/${groupid}`;
      console.log('File URL:', pfp);
    }
  }}
  catch(error){
    console.log(error)
  }

  console.log('hewewjk')
  console.log(pfp,'k')
  console.log('hewewjk')


  const { data, error } = await supabase
    .from('groups')
    .insert([
      { groupid, groupname, description, buyin, week, startdate, timeleft, hostid, enddate, pfp }
    ])
    .select()
    .single();
  console.log(data)
  console.log(error)

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
