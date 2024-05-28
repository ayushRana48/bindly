const fs = require('fs');
const path = require('path');
const { supabase } = require('../initSupabase');

async function uploadFile(filePath, bucketName, fileName,timestamp, newTimeStamp) {
  let fileUrl = "";



  try {

    
    if (filePath) {
      const fileUri = filePath.replace('file://', '');
      const fileData = fs.readFileSync(fileUri);
      const fileExt = path.extname(fileUri).substring(1);

      // Delete the old file if oldFileUrl is provided
      if(timestamp){
        const oldFileName = `${fileName}-${timestamp.substring(0,timestamp.length-6)}Z.${fileExt}`;


        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove([oldFileName]);

          if (deleteError && deleteError.message !== 'The resource was not found') {
            console.error('Error deleting old file:', deleteError);
            return { fileUrl: null, error: deleteError };
          }
      }
  
      

      const { data: imageData, error: imageError } = await supabase.storage
        .from(bucketName)
        .upload(`${fileName}-${newTimeStamp}.${fileExt}`, fileData, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (imageError) {
        console.error('Error uploading file:', imageError);
        return { fileUrl: null, error: imageError };
      } else {
        fileUrl = `https://lxnzgnvhkrgxpfsokwos.supabase.co/storage/v1/object/public/${bucketName}/${fileName}-${newTimeStamp}.${fileExt}`;
      }
    }

    else{
      if(timestamp){
        const oldFileName = `${fileName}-${timestamp}.${fileExt}`;

        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove([oldFileName]);

          if (deleteError && deleteError.message !== 'The resource was not found') {
            console.error('Error deleting old file:', deleteError);
            return { fileUrl: null, error: deleteError };
          }
      }
    }
  } catch (error) {
    console.error(error);
    return { fileUrl: null, error };
  }

  return { fileUrl, error: null };
}



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
  const newTimeStamp= new Date(Date.now()).toISOString();
  let fileUrl = updateParams.pfp;

  if (updateParams.pfp) {
    const { fileUrl: newFileUrl, error: uploadError } = await uploadFile(updateParams.pfp, 'groupProfiles',groupid,updateParams.lastpfpupdate,newTimeStamp);

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    fileUrl = newFileUrl;
  }

  if(fileUrl==undefined){
    fileUrl=""
  }

  const { data, error } = await supabase
    .from('groups')
    .update({ ...updateParams, pfp: fileUrl,lastpfpupdate:newTimeStamp })
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
