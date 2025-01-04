import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../initSupabase';
import { uploadFile } from './uploadFile';
import { Group, User, Post, DatabaseResponse } from '../types';



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

interface UserPosts {
  [username: string]: {
    [weekNum: string]: Date[];
  };
}

interface RankMember {
  rank: number;
  members: LeaderboardEntry[];
  quantity: number;
}

interface VetoCount {
  [key: string]: {
    count: number;
    username: string;
    reason: string;
  };
}

interface ProcessedVeto {
  postid: string;
  count: number;
  username: string;
  reason: string;
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
  if (fileUrl?.length == 0) {
    time = "";
  }

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



function distributeMoney(leaderboard: LeaderboardEntry[], buyin: number): LeaderboardEntry[] {
  let rankDict = new Array(leaderboard.length);

  for (let i = 0; i < rankDict.length; i++) {
    rankDict[i] = [];
  }

  const ranks = new Set<number>();

  for (let i = 0; i < leaderboard.length; i++) {
    const currUser = leaderboard[i];
    const currPlace = currUser.place!;
    let currArr = rankDict[currPlace - 1];
    currArr.push(currUser);
    ranks.add(currPlace);
  }

  let ranksArr = Array.from(ranks);
  const arr: RankMember[] = [];

  for (let i = 0; i < ranksArr.length; i++) {
    const currRank = ranksArr[i];
    const currList = rankDict[currRank - 1];
    const currentObj: RankMember = { 
      rank: currRank, 
      members: currList, 
      quantity: currList.length 
    };
    arr.push(currentObj);
  }

  if (arr.length == 1) {
    arr[0].members.forEach(user => user.netMoney = buyin);
    return arr.flatMap(rank => rank.members);
  }

  const totalGain = buyin * leaderboard.length;
  const incrementPercentage = 0.5;
  let sumTop = 0;

  for (let i = arr.length - 1; i >= 0; i--) {
    sumTop += arr[i].members.length * incrementPercentage * (arr.length - 1 - i);
  }

  const baseGain = totalGain / sumTop;

  for (let i = arr.length - 1; i >= 0; i--) {
    const rankGain = baseGain * incrementPercentage * (arr.length - 1 - i);
    arr[i].members.forEach(user => user.netMoney = rankGain);
  }

  return arr.flatMap(rank => rank.members);
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

    const userPosts: UserPosts = {};
    postsData.forEach(post => {
      const { username, timepost } = post;
      const postDate = new Date(timepost);
      const weekNum = Math.floor((postDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

      if (!userPosts[username]) {
        userPosts[username] = {};
      }
      if (!userPosts[username][weekNum]) {
        userPosts[username][weekNum] = [];
      }
      userPosts[username][weekNum].push(postDate);
    });

    const leaderboard: LeaderboardEntry[] = usersData.map(user => {
      const username = user.username;
      const userWeeks = userPosts[username] || {};

      const weeks = Object.keys(userWeeks).map(weekNum => {
        const weekPosts = userWeeks[weekNum];
        const countedPosts = weekPosts.slice(0, tasksperweek);
        const unCountedPosts = weekPosts.slice(tasksperweek);

        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + parseInt(weekNum) * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        return {
          weekNum: parseFloat(weekNum) + 1,
          weekRange: `${weekStart.toISOString()} - ${weekEnd.toISOString()}`,
          countedPosts: countedPosts.length,
          unCountedPosts: unCountedPosts.length,
        };
      });

      return {
        username,
        weeks,
        totalCountedPosts: weeks.reduce((acc, week) => acc + week.countedPosts, 0),
        totalUnCountedPosts: weeks.reduce((acc, week) => acc + week.unCountedPosts, 0),
      };
    });

    leaderboard.sort((a, b) => b.totalCountedPosts - a.totalCountedPosts);

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
    const [groupResponse, usergroupResponse, inviteResponse] = await Promise.all([
      supabase
        .from('groups')
        .select('*')
        .eq('groupid', groupid)
        .single(),
      supabase
        .from('usergroup')
        .select(`
          *,
          users!inner(*)
        `)
        .eq('groupid', groupid),
      supabase
        .from('invite')
        .select('*')
        .eq('groupid', groupid),
    ]);

    const groupError = groupResponse.error;
    const usergroupError = usergroupResponse.error;
    const inviteError = inviteResponse.error;

    if (groupError || usergroupError || inviteError) {
      return { data: null, error: new Error(groupError?.message || usergroupError?.message || inviteError?.message || 'Unknown error') };
    }

    const { data: processData, error: processError } = await processVeto(groupid);
    if (processError) {
      return { data: null, error: processError };
    }

    const { data: postWithComments, error: postError } = await supabase
      .from('post')
      .select(`
        *,
        comment(commentid, username, message, created, users(pfp))
      `)
      .eq('groupid', groupid)
      .or('valid.is.null,valid.eq.true')
      .order('timepost', { ascending: false });

    if (postError) {
      return { data: null, error: new Error(postError.message) };    }

    const sortedPostWithComments = postWithComments.map(post => ({
      ...post,
      comment: post.comment ? post.comment.sort((a: any, b:any) => new Date(b.created).getTime() - new Date(a.created).getTime()) : []
    }));

    const data = {
      group: groupResponse.data,
      usergroup: usergroupResponse.data,
      invite: inviteResponse.data,
      post: sortedPostWithComments,
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

    const currentTime = new Date();
    const cutoffTime = new Date(currentTime.getTime() - 48 * 60 * 60 * 1000);
    const latePosts = postData.filter(post => new Date(post.timecycle) < cutoffTime);

    if (latePosts.length > 0) {
      const postIdsToInvalidate = latePosts
        .filter(post => post.veto.length >= Math.ceil(memberCount * (1 / 2)))
        .map(post => post.postid);

      const postIdsToValidate = latePosts
        .filter(post => post.veto.length < Math.ceil(memberCount * (1 / 2)))
        .map(post => post.postid);

      if (postIdsToValidate.length > 0) {
        const { error: updateError } = await supabase
          .from('post')
          .update({ valid: true })
          .in('postid', postIdsToValidate);

        if (updateError) throw updateError;
      }

      if (postIdsToInvalidate.length > 0) {
        const { error: invalidateError } = await supabase
          .from('post')
          .update({ valid: false })
          .in('postid', postIdsToInvalidate);

        if (invalidateError) throw invalidateError;

        const notifications = latePosts
          .filter(post => postIdsToInvalidate.includes(post.postid))
          .map(post => ({
            notifyvetoid: uuidv4(),
            postid: post.postid,
            username: post.username,
            groupid: groupid
          }));

        if (notifications.length > 0) {
          const { error: notifyError } = await supabase
            .from('notifyveto')
            .insert(notifications);

          if (notifyError) throw notifyError;
        }
      }
    }

    return { data: 'Process completed successfully', error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}



async function processVetoDemo(groupid: string): Promise<DatabaseResponse<ProcessedVeto[]>> {
  try {
    const { data: memberData, error: memberError } = await supabase
      .from('usergroup')
      .select('username')
      .eq('groupid', groupid);

    if (memberError) throw memberError;

    const memberCount = memberData.length;

    if (memberCount <= 2) {
      return { data: [], error: null };
    }

    const { data: postData, error: postError } = await supabase
      .from('post')
      .select('*')
      .eq('groupid', groupid)
      .is('valid', null);

    if (postError) throw postError;

    const currentTime = new Date();
    const cutoffTime = new Date(currentTime.getTime() - 48 * 60 * 60 * 1000);
    const latePosts = postData.filter(post => new Date(post.timecycle) < cutoffTime);

    const vetoCount: VetoCount = {};
    latePosts.forEach(post => {
      if (post.veto && post.veto.length >= Math.ceil(memberCount * (1 / 2))) {
        vetoCount[post.postid] = {
          count: post.veto.length,
          username: post.username,
          reason: post.reason || ''
        };
      }
    });

    const processedVetos: ProcessedVeto[] = Object.entries(vetoCount).map(([postid, data]) => ({
      postid,
      count: data.count,
      username: data.username,
      reason: data.reason
    }));

    return { data: processedVetos, error: null };
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
    await Promise.all(groupIds.map(groupId => processVeto(groupId)));

    const leaderboardPromises = groupIds.map(groupId => getLeaderBoard(groupId));
    const leaderboards = await Promise.all(leaderboardPromises);
    const validLeaderboards = leaderboards
      .filter(l => l.data !== null)
      .map(l => l.data) as LeaderboardEntry[][];

    const allUsers = validLeaderboards.flat();
    const uniqueUsers = Array.from(new Set(allUsers.map(user => user.username)))
      .map(username => ({
        username,
        netMoney: allUsers
          .filter(user => user.username === username)
          .reduce((sum, user) => sum + (user.netMoney || 0), 0),
      }));

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username, balance')
      .in('username', uniqueUsers.map(user => user.username));

    if (userError) {
      return { data: null, error: new Error(userError.message) };
    }

    const balanceUpdatePromises = userData.map(user => {
      const userUpdate = uniqueUsers.find(u => u.username === user.username);
      return supabase
        .from('users')
        .update({ balance: user.balance + (userUpdate?.netMoney || 0) })
        .eq('username', user.username);
    });

    const balanceUpdateResults = await Promise.all(balanceUpdatePromises);
    const balanceUpdateErrors = balanceUpdateResults.filter(result => result.error);

    if (balanceUpdateErrors.length > 0) {
      return { data: null, error: new Error('Failed to update some user balances') };
    }

    const { error: groupUpdateError } = await supabase
      .from('groups')
      .update({ archive: true })
      .in('groupid', groupIds);

    if (groupUpdateError) {
      return { data: null, error: new Error(groupUpdateError.message) };
    }

    return { data: 'success', error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
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






export { createGroup, getAllGroups, getGroup, getGroupsByHostId, updateGroup, deleteGroup, getLeaderBoard,processGroups,endGroup,processVetoDemo };
