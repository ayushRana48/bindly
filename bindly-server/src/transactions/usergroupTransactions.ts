import { supabase } from '../initSupabase';
import { processGroups } from './groupTransactions';
import { DatabaseResponse, Group, UserGroup, User } from '../types';

async function createUserGroup(
  usergroupid: string, 
  username: string, 
  groupid: string
): Promise<DatabaseResponse<{ data: any; newBalance: number }>> {
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .select('buyin')
    .eq('groupid', groupid)
    .single();

  if (groupError) {
    return { data: null, error: new Error(groupError.message) };
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('balance')
    .eq('username', username)
    .single();

  if (userError) {
    return { data: null, error: new Error(userError.message) };
  }

  const newBalance = userData.balance - groupData.buyin;

  if (newBalance < 0) {
    return { data: null, error: new Error('Insufficient Funds') };
  }

  const { data: balanceUpdate, error: balanceUpdateError } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('username', username);

  if (balanceUpdateError) {
    return { data: null, error: new Error(balanceUpdateError.message) };
  }

  const { data, error } = await supabase
    .from('usergroup')
    .insert([{ usergroupid, username, groupid }])
    .select()
    .single();

  return { 
    data: { data, newBalance }, 
    error: error ? new Error(error.message) : null 
  };
}

async function getAllUserGroups(): Promise<DatabaseResponse<Array<UserGroup & { groups: Group }>>> {
  const { data, error } = await supabase
    .from('usergroup')
    .select(`
      *,
      groups:groups!inner(*)
    `);

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}


interface GroupMembersResponse {
  members: Array<UserGroup & { users: User }>;
}

async function getUserGroupsByGroupId(groupid: string): Promise<DatabaseResponse<GroupMembersResponse>> {
  const { data: userGroupData, error: userGroupError } = await supabase
    .from('usergroup')
    .select(`
      *,
      users:users!inner(*)
    `)
    .eq('groupid', groupid);

  if (userGroupError) {
    return { data: null, error: new Error(userGroupError.message) };
  }

  const groupId = userGroupData[0]?.groupid;
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('groupid', groupId)
    .single();

  if (groupError) {
    return { data: null, error: new Error(groupError.message) };
  }

  return { 
    data: {
      members: userGroupData,
    }, 
    error: null 
  };
}


interface UserGroupResponse {
  current: Array<UserGroup & { groups: Group }>;
  archive: Array<UserGroup & { groups: Group }>;
}

async function getUserGroupsByUsername(username: string): Promise<DatabaseResponse<UserGroupResponse>> {
  const { data: allGroups, error } = await supabase
    .from('usergroup')
    .select(`
      groupid,
      groups:groups!inner(*)
    `)
    .eq('username', username)
    .eq('groups.archive', false);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const currentDate = new Date();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { error: userError } = await supabase
    .from('users')
    .update({
      lastlogin: currentDate.toISOString(),
      timezone: timezone
    })
    .eq('username', username);

  if (userError) {
    return { data: null, error: new Error(userError.message) };
  }

  const groups = allGroups.map(g => g.groups);
  await processGroups(groups);

  const { data: currentGroups, error: currentError } = await supabase
    .from('usergroup')
    .select(`
      *,
      groups:groups!inner(*)
    `)
    .eq('username', username)
    .eq('groups.archive', false);

  if (currentError) {
    return { data: null, error: new Error(currentError.message) };
  }

  const { data: archiveGroups, error: archiveError } = await supabase
    .from('usergroup')
    .select(`
      *,
      groups:groups!inner(*)
    `)
    .eq('username', username)
    .eq('groups.archive', true);

  if (archiveError) {
    return { data: null, error: new Error(archiveError.message) };
  }

  return { 
    data: { 
      current: currentGroups || [], 
      archive: archiveGroups || [] 
    }, 
    error: null 
  };
}


async function getUserGroup(userGroupId: string): Promise<DatabaseResponse<UserGroup & { groups: Group }>> {
  const { data, error } = await supabase
    .from('usergroup')
    .select(`
      *,
      groups:groups!inner(*)
    `)
    .eq('usergroupid', userGroupId)
    .single();

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

type UserGroupUpdateParams = Partial<Omit<UserGroup, 'usergroupid' | 'username' | 'groupid'>>;

async function updateUserGroup(
  usergroupid: string, 
  updateParams: UserGroupUpdateParams
): Promise<DatabaseResponse<UserGroup>> {
  const { data, error } = await supabase
    .from('usergroup')
    .update(updateParams)
    .eq('usergroupid', usergroupid)
    .select()
    .single();

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}
// Function to delete a group

async function deleteUserGroup(
  username: string, 
  groupId: string
): Promise<DatabaseResponse<string>> {
  try {
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('buyin')
      .eq('groupid', groupId)
      .single();

    if (groupError) {
      return { data: null, error: new Error(groupError.message) };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('username', username)
      .single();

    if (userError) {
      return { data: null, error: new Error(userError.message) };
    }

    const newBalance = userData.balance + groupData.buyin;

    const { error: balanceUpdateError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('username', username);

    if (balanceUpdateError) {
      return { data: null, error: new Error(balanceUpdateError.message) };
    }

    const { error } = await supabase
      .from('usergroup')
      .delete()
      .eq('username', username)
      .eq('groupid', groupId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: 'Successfully deleted', error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function getUserGroupByUsernameGroup(
  username: string, 
  groupId: string
): Promise<DatabaseResponse<UserGroup>> {
  const { data, error } = await supabase
    .from('usergroup')
    .select()
    .eq('username', username)
    .eq('groupid', groupId)
    .single();

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}



export { createUserGroup, getAllUserGroups, getUserGroup, getUserGroupsByGroupId, getUserGroupsByUsername, updateUserGroup, deleteUserGroup, getUserGroupByUsernameGroup };
