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

// Create a new user
async function createUser(username, email, name, pfp) {

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, email, name, pfp }]);

    return { data: { username, email, name, pfp }, error };
  } catch (error) {
    console.error("Error occurred during insertion:", error);
    return { data: data, error: error.message };
  }
}



// Read user details
async function getUser(username) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  return { data, error };
}

async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  return { data, error };
}


async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')

  return { data, error };
}

// Update user details
async function updateUser(username, updateParams) {
  const newTimeStamp= new Date(Date.now()).toISOString();
  let fileUrl = updateParams.pfp;

  if (updateParams.pfp) {
    const { fileUrl: newFileUrl, error: uploadError } = await uploadFile(updateParams.pfp, 'userProfiles',username,updateParams.lastpfpupdate,newTimeStamp);

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    fileUrl = newFileUrl;
  }

  if(fileUrl==undefined){
    fileUrl=""
  }

  const { data, error } = await supabase
    .from('users')
    .update({ ...updateParams, pfp: fileUrl,lastpfpupdate:newTimeStamp })
    .eq('username', username)
    .select()
    .single();

  return { data, error };

}


// Delete a user
async function deleteUser(username) {
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('username', username);

  return { data, error };
}

module.exports = { createUser, getUser, updateUser, deleteUser, getAllUsers,getUserByEmail };
