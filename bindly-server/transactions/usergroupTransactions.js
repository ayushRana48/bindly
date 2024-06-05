const { supabase } = require('../initSupabase');

// Function to create a new group
async function createUserGroup(usergroupid, username, groupid) {
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .select('buyin')
    .eq('groupid', groupid)
    .single();

  if (groupError) {
    return { error: groupError.message };
  }


  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('balance')
    .eq('username', username)
    .single();


  if (userError) {
    return { error: userError.message };
  }


  const newBalance = userData.balance - groupData.buyin;

  if(newBalance<0){
    return {error: 'Insufficient Funds'}
  }

  const { data: balanceUpdate, error: balanceUpdateError } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('username', username);

  if (balanceUpdateError) {
    return { error: balanceUpdateError.message };
  }

  const { data, error } = await supabase
    .from('usergroup')
    .insert([{ usergroupid, username, groupid }])
    .select()
    .single();

  return { data, error };
}


// Function to get all groups
// Function to get all groups
async function getAllUserGroups() {
  const { data, error } = await supabase
    .from('usergroup')
    .select(`
      *,
      groups:groups!inner(*)  -- Perform an inner join with the groups table
    `);

  return { data, error };
}


// Function to get a group by groupId
async function getUserGroupsByGroupId(groupid) {
  const { data: userGroupData, error: userGroupError } = await supabase
    .from('usergroup')
    .select(`
      *,
      users:users!inner(*)  -- Perform an inner join with the groups table
    `)
    .eq('groupid', groupid)



  if (userGroupError) {
    return { data: null, error: userGroupError };
  }

  // Assuming all groupIds are the same, get the first groupId
  const groupId = userGroupData[0]?.groupid;

  // Fetch the group information once
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('groupid', groupId)
    .single();

  if (groupError) {
    return { data: null, error: groupError };
  }

  // Extract the members (user information)
  // const members = userGroupData.map(userGroup => {userGroup.users});

  // Structure the final result
  const result = {
    members:userGroupData,
    group: groupData,
  };


  return { data: result, error: groupError };
}



// Function to get groups by hostId
// Function to get groups by username
async function getUserGroupsByUsername(username) {
  const { data, error } = await supabase
    .from('usergroup')
    .select(`
      *,
      groups:groups!inner(*)  -- Perform an inner join with the groups table
    `)
    .eq('username', username);

  return { data, error };
}


// Function to get a group by userGroupId
async function getUserGroup(userGroupId) {
  const { data, error } = await supabase
    .from('usergroup')
    .select(`
      *,
      groups:groups!inner(*)  -- Perform an inner join with the groups table
    `)
    .eq('usergroupid', userGroupId);

  return { data, error };
}


// Function to update a group
async function updateUserGroup(usergroupid, updateParams) {
  const { data, error } = await supabase
    .from('usergroup')
    .update(updateParams)
    .eq('usergroupid', usergroupid);

  return { data, error };
}

// Function to delete a group

async function deleteUserGroup(username, groupId) {
  try {
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('buyin')
      .eq('groupid', groupId)
      .single();

    if (groupError) {
      return { error: groupError.message };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('username', username)
      .single();

    if (userError) {
      return { error: userError.message };
    }

    const newBalance = userData.balance + groupData.buyin;

    const { data: balanceUpdate, error: balanceUpdateError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('username', username);

    if (balanceUpdateError) {
      return { error: balanceUpdateError.message };
    }

    const { data, error } = await supabase
      .from('usergroup')
      .delete()
      .eq('username', username)
      .eq('groupid', groupId);

    if (error) {
      return { error: error.message };
    }

    return { data: 'Successfully deleted' };
  } catch (error) {
    return { error: error.message };
  }
}

async function getUserGroupByUsernameGroup(username,groupId){
  const { data, error } = await supabase
  .from('usergroup')
  .select()
  .eq('username', username)
  .eq('groupid', groupId)
  .single();

  console.log(data,error)

  if (error) {
    console.log('here')
    return { error };
  }
  else{
    return{data}
  }
}


module.exports = { createUserGroup, getAllUserGroups, getUserGroup, getUserGroupsByGroupId, getUserGroupsByUsername,updateUserGroup, deleteUserGroup,getUserGroupByUsernameGroup };
