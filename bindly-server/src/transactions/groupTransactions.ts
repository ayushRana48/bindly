import { supabase } from '../initSupabase';
import { uploadFile } from './uploadFile';
import { Group, Post, DatabaseResponse } from '../types';
import { distributeMoney } from './groupHelpers/leaderboard/distributeMoney';
import { buildLeaderboardData } from './groupHelpers/leaderboard/leaderboard';
import { processPosts } from './groupHelpers/veto/processPosts';
import { aggregateLeaderboards, updateUserBalances } from './groupHelpers/endGroup/endGroupHelpers';

interface LeaderboardWeek {
  weekNum: number;
  weekRange: string;
  countedPosts: number;
  unCountedPosts: number;
}

interface LeaderboardEntry {
  username: string;
  weeks: LeaderboardWeek[];
  totalCountedPosts: number;
  totalUnCountedPosts: number;
  place?: number;
  netMoney?: number;
}

interface GroupsResponse {
  current: Group[];
  archive: Group[];
}





async function createGroup(
  groupid: string,
  groupname: string,
  hostid: string,
  description: string,
  buyin: number,
  week: string,
  startdate: string,
  timeleft: string,
  enddate: string,
  filePath: string,
  tasksperweek: number
): Promise<DatabaseResponse<Group>> {
  const timestamp = new Date(Date.now()).toISOString();
  const { fileUrl, error: uploadError } = await uploadFile(filePath, 'groupProfiles', groupid, null, timestamp);

  if (uploadError) {
    return { data: null, error: uploadError };
  }

  let time = timestamp;

  const { data, error } = await supabase
    .from('groups')
    .insert([{
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
    }])
    .select()
    .single();

  return {
    data,
    error: error ? new Error(error.message) : null
  };
}

// Function to get all groups
async function getAllGroups(): Promise<DatabaseResponse<GroupsResponse>> {
  const { data: currentGroups, error } = await supabase
    .from('groups')
    .select('*')
    .eq('archive', 'false');

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const { data: archive, error: archiveError } = await supabase
    .from('groups')
    .select('*')
    .eq('archive', 'true');

  if (archiveError) {
    return { data: null, error: new Error(archiveError.message) };
  }

  return {
    data: { current: currentGroups, archive },
    error: null
  };
}



async function getLeaderBoard(groupid: string): Promise<DatabaseResponse<LeaderboardEntry[]>> {
  try {
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('startdate, tasksperweek, buyin')
      .eq('groupid', groupid)
      .single();

    if (groupError) {
      return { data: null, error: new Error(groupError.message) };
    }

    const { startdate, tasksperweek, buyin } = groupData;
    const startDate = new Date(startdate);

    const { data: usersData, error: usersError } = await supabase
      .from('usergroup')
      .select('username')
      .eq('groupid', groupid);

    if (usersError) {
      return { data: null, error: new Error(usersError.message) };
    }

    const { data: postsData, error: postsError } = await supabase
      .from('post')
      .select('username, timepost')
      .eq('groupid', groupid)
      .or('valid.is.null,valid.eq.true');

    if (postsError) {
      return { data: null, error: new Error(postsError.message) };
    }

    const leaderboard = buildLeaderboardData(postsData, usersData, startDate, tasksperweek);

    let currentPlace = 1;
    for (let i = 0; i < leaderboard.length; i++) {
      if (i > 0 && leaderboard[i].totalCountedPosts < leaderboard[i - 1].totalCountedPosts) {
        currentPlace = i + 1;
      }
      leaderboard[i].place = currentPlace;
    }


    const updatedLeaderboard = distributeMoney(leaderboard, buyin);
    return { data: updatedLeaderboard, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}



async function getGroup(groupid: string): Promise<DatabaseResponse<{
  group: Group;
  usergroup: any[];
  invite: any[];
  post: Post[];
}>> {
  try {
    console.log("Fetching group data for groupid: ", groupid);

    const { data: groupData, error } = await supabase
      .from("groups")
      .select(
        `
          *,
          usergroup(
            *,
            users(*)
          ),
          invite(*),
          post(
            *,
            comment(
              commentid,
              username,
              message,
              created,
              users(pfp)
            )
          )
        `
      )
      .eq("groupid", groupid)
      .single();

    if (error) {
      return {
        data: null,
        error: new Error(error.message || "Unknown error"),
      };
    }

    if (!groupData) {
      // No record found for this group
      return {
        data: null,
        error: new Error("Group not found"),
      };
    }

    const { data: processData, error: processError } = await processVeto(groupid);
    if (processError) {
      return { data: null, error: processError };
    }


    groupData.post = (groupData.post || [])
      .filter((p: Post) => p.valid === null || p.valid === true)
      .sort((a: Post, b: Post) => new Date(b.timepost).getTime() - new Date(a.timepost).getTime())
      .map((post: any) => ({
        ...post,
        comment: post.comment
          ? post.comment.sort(
            (a: any, b: any) =>
              new Date(a.created).getTime() - new Date(b.created).getTime()
          )
          : [],
      }));


    const data = {
      group: groupData, // The "groups" row (top-level columns)
      usergroup: groupData.usergroup || [],
      invite: groupData.invite || [],
      post: groupData.post || [],
    };

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

async function processVeto(groupid: string): Promise<DatabaseResponse<string>> {
  try {
    const { data: memberData, error: memberError } = await supabase
      .from('usergroup')
      .select('username')
      .eq('groupid', groupid);

    if (memberError) throw memberError;

    const memberCount = memberData.length;

    if (memberCount <= 2) {
      return { data: 'less than 2 members', error: null };
    }

    const { data: postData, error: postError } = await supabase
      .from('post')
      .select('*')
      .eq('groupid', groupid)
      .is('valid', null);

    if (postError) throw postError;

    await processPosts(postData, memberCount, groupid);

    return { data: 'Process completed successfully', error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

async function getGroupsByHostId(hostid: string): Promise<DatabaseResponse<Group[]>> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('hostid', hostid);

  return {
    data,
    error: error ? new Error(error.message) : null
  };
}

async function updateGroup(
  groupId: string,
  updateParams: Partial<Group>
): Promise<DatabaseResponse<Group>> {
  let newTimeStamp: string | null = null;
  let fileUrl = updateParams.pfp;

  if (updateParams.pfp) {
    newTimeStamp = new Date(Date.now()).toISOString();
    const { fileUrl: newFileUrl, error: uploadError } = await uploadFile(
      updateParams.pfp,
      'groupProfiles',
      groupId,
      updateParams.lastpfpupdate?.toString() || null,
      newTimeStamp
    );

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    fileUrl = newFileUrl;
  }

  const updateData = { ...updateParams, pfp: fileUrl };

  if (newTimeStamp) {
    updateData.lastpfpupdate = new Date(newTimeStamp);
  }

  const { data, error } = await supabase
    .from('groups')
    .update(updateData)
    .eq('groupid', groupId)
    .select()
    .single();

  return {
    data,
    error: error ? new Error(error.message) : null
  };
}


async function deleteGroup(groupId: string): Promise<DatabaseResponse<string>> {
  try {
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('buyin')
      .eq('groupid', groupId)
      .single();

    if (groupError) {
      return { data: null, error: new Error(groupError.message) };
    }

    const { data: userGroups, error: userGroupError } = await supabase
      .from('usergroup')
      .select('username')
      .eq('groupid', groupId);

    if (userGroupError) {
      return { data: null, error: new Error(userGroupError.message) };
    }

    for (const userGroup of userGroups) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('username', userGroup.username)
        .single();

      if (userError) {
        return { data: null, error: new Error(userError.message) };
      }

      const newBalance = userData.balance + groupData.buyin;

      const { error: balanceUpdateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('username', userGroup.username);

      if (balanceUpdateError) {
        return { data: null, error: new Error(balanceUpdateError.message) };
      }
    }

    const { error: userGroupDeleteError } = await supabase
      .from('usergroup')
      .delete()
      .eq('groupid', groupId);

    if (userGroupDeleteError) {
      return { data: null, error: new Error(userGroupDeleteError.message) };
    }

    const { error: inviteError } = await supabase
      .from('invite')
      .delete()
      .eq('groupid', groupId);

    if (inviteError) {
      return { data: null, error: new Error(inviteError.message) };
    }

    const { data: groupDelete, error: groupDeleteError } = await supabase
      .from('groups')
      .delete()
      .eq('groupid', groupId);

    if (groupDeleteError) {
      return { data: null, error: new Error(groupDeleteError.message) };
    }

    return { data: 'Successfully deleted group', error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}


async function endGroup(groupIds: string[]): Promise<DatabaseResponse<string>> {
  try {
    // 1) Process vetoes for each group
    await Promise.all(groupIds.map(groupId => processVeto(groupId)));

    // 2) Fetch leaderboards in parallel
    const leaderboards = await Promise.all(groupIds.map(getLeaderBoard));

    // 3) Aggregate all users & netMoney from valid leaderboards
    const uniqueUsers = aggregateLeaderboards(leaderboards);

    // 4) Fetch the current user balances from DB

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username, balance')
      .in('username', uniqueUsers.map(user => user.username));

    if (userError) {
      return { data: null, error: new Error(userError.message) };
    }

    // 5) Update each user’s balance by adding their total netMoney
    const { error: balanceUpdateError } = await updateUserBalances(userData!, uniqueUsers);
    if (balanceUpdateError) {
      return { data: null, error: balanceUpdateError };
    }

    // 6) Mark the groups as archived
    const { error: groupUpdateError } = await supabase
      .from("groups")
      .update({ archive: true })
      .in("groupid", groupIds);

    if (groupUpdateError) {
      return { data: null, error: new Error(groupUpdateError.message) };
    }

    return { data: "success", error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}


async function processGroups(groups: any[]): Promise<DatabaseResponse<string>> {
  const now = new Date();
  const groupsToEnd = groups
    .filter(group => {
      const endDate = new Date(group.enddate!);
      return now.getTime() - endDate.getTime() >= 24 * 60 * 60 * 1000;
    })
    .map(group => group.groupid);

  if (groupsToEnd.length === 0) {
    return { data: 'No groups to process', error: null };
  }

  try {
    const result = await endGroup(groupsToEnd);
    return result;
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export { createGroup, getAllGroups, getGroup, getGroupsByHostId, updateGroup, deleteGroup, getLeaderBoard, processGroups, processVeto, endGroup };
