const fs = require('fs');
const path = require('path');
const { supabase } = require('../initSupabase');
const { uploadFile } = require('./uploadFile');
const { post } = require('../routes/bindly');
const { v4: uuidv4 } = require('uuid');
const { compressVideo } = require('./postTransactions');
const { createBrotliCompress } = require('zlib');


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
  const { data:currentGroups, error } = await supabase
    .from('groups')
    .select('*')
    .eq('archive','false');

    if(error){
      return{error}
    }

    const { data:archive, error:archiveError } = await supabase
    .from('groups')
    .select('*')
    .eq('archive','true');

    if(archiveError){
      return{error:archiveError}

    }

  return { data:{current:currentGroups,'archive':archive}, error };
}


function distributeMoney(leaderboard, buyin) {

  // const leaderboard=[
  //   {'user':'user1',place:1},
  //   {'user':'user2',place:1},
  //   {'user':'user3',place:1},
  //   {'user':'user4',place:4}
  // ]



  let rankDict = new Array(leaderboard.length);  // Creates an array of length 5

  for (let i = 0; i < rankDict.length; i++) {
    rankDict[i] = [];
  }

  const ranks = new Set();


  for (let i = 0; i < leaderboard.length; i++) {
    const currUser = leaderboard[i]
    const currPlace = currUser.place
    let currArr = rankDict[currPlace - 1]
    currArr.push(currUser)
    ranks.add(currPlace)
  }

  let ranksArr = Array.from(ranks);

  const arr = []

  for (let i = 0; i < ranksArr.length; i++) {
    const currRank = ranksArr[i]
    const currList = rankDict[currRank - 1]
    const currentObj = { rank: currRank, members: currList, quantity: currList.length }
    arr.push(currentObj)
  }




  const middleIndex = Math.floor(arr.length / 2);
  const isOdd = arr.length % 2 !== 0;

  // Divide into top half and bottom half
  let topHalf, bottomHalf;
  if (isOdd) {
    topHalf = arr.slice(0, middleIndex);
    bottomHalf = arr.slice(middleIndex + 1);
  } else {
    topHalf = arr.slice(0, middleIndex);
    bottomHalf = arr.slice(middleIndex);
  }


  let bottomTotalMoney = 0;

  console.log(bottomHalf)
  for (let i = 0; i < bottomHalf.length; i++) {
    const currGroup = bottomHalf[i]
    bottomTotalMoney += currGroup.members.length * buyin
  }


  console.log('money')
  console.log(bottomTotalMoney)


  const totalGain = bottomTotalMoney;
  const totalLoss = bottomTotalMoney;

  // Calculate percentage increment for top and bottom halves
  const incrementPercentage = 1.2; // 20% increment
  let sumTop = 0, sumBottom = 0;


  for (let i = topHalf.length - 1; i >= 0; i--) {
    console.log(i, 'i')
    console.log(topHalf[i].members.length + '*' + incrementPercentage, " **", (topHalf.length - 1 - i))
    sumTop += topHalf[i].members.length * Math.pow(incrementPercentage, topHalf.length - 1 - i);
    // console.log(topHalf[i].members.length+'*'+Math.pow(incrementPercentage,topHalf.length-1 - i))
  }


  for (let i = 0; i < bottomHalf.length; i++) {
    sumBottom += bottomHalf[i].members.length * Math.pow(incrementPercentage, i);
  }


  // Distribute money in the top half (reverse order for geometric progression)
  const baseGain = totalGain / sumTop
  const baseLoss = totalLoss / sumBottom

  console.log(baseLoss)

  for (let i = topHalf.length - 1; i >= 0; i--) {
    const rankGain = baseGain * (Math.pow(incrementPercentage, ((topHalf.length - 1) - i)));
    topHalf[i].members.forEach(user => user.netMoney = buyin + rankGain);

  }

  console.log(bottomHalf)

  // Distribute money in the bottom half
  for (let i = 0; i < bottomHalf.length; i++) {
    const rankLoss = baseLoss * (Math.pow(incrementPercentage, i));
    bottomHalf[i].members.forEach(user => user.netMoney = buyin - rankLoss);
  }


  console.log(bottomHalf)

  // if (isOdd) {
  //   leaderboard[middleIndex].netMoney = 0;
  // }

  // Combine the halves back together
  let newLeader = []
  for (let i = 0; i < topHalf.length; i++) {
    const currMembers = topHalf[i].members
    for (let j = 0; j < currMembers.length; j++) {
      newLeader.push(currMembers[j])
    }
  }

  if (isOdd) {

    const middleGroup = arr[middleIndex]
    for (let i = 0; i < middleGroup.members.length; i++) {
      newLeader.push({ ...middleGroup.members[i], netMoney: buyin })
    }
  }


  for (let i = 0; i < bottomHalf.length; i++) {
    const currMembers = bottomHalf[i].members
    console.log(currMembers)
    for (let j = 0; j < currMembers.length; j++) {
      newLeader.push(currMembers[j])
    }
  }

  return newLeader;
}


// Example of how the distributeMoney function is called within the getLeaderBoard function
async function getLeaderBoard(groupid) {
  try {
    // Fetch group details
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('startdate, tasksperweek, buyin')
      .eq('groupid', groupid)
      .single();

    if (groupError) {
      console.error('Error fetching group data:', groupError);
      return { error: groupError };
    }

    const { startdate, tasksperweek, buyin } = groupData;
    const startDate = new Date(startdate);

    // Fetch users for the group
    const { data: usersData, error: usersError } = await supabase
      .from('usergroup')
      .select('username')
      .eq('groupid', groupid);

    if (usersError) {
      console.error('Error fetching users data:', usersError);
      return { error: usersError };
    }

    // Fetch posts for the group
    const { data: postsData, error: postsError } = await supabase
    .from('post')
    .select('username, timepost')
    .eq('groupid', groupid)
    .or('valid.is.null,valid.eq.true');
  

    if (postsError) {
      console.error('Error fetching posts data:', postsError);
      return { error: postsError };
    }

    // Process posts to count tasks per user per week
    const userPosts = {};
    postsData.forEach(post => {
      const { username, timepost } = post;
      const postDate = new Date(timepost);
      const weekNum = Math.floor((postDate - startDate) / (7 * 24 * 60 * 60 * 1000));

      if (!userPosts[username]) {
        userPosts[username] = {};
      }

      if (!userPosts[username][weekNum]) {
        userPosts[username][weekNum] = [];
      }

      userPosts[username][weekNum].push(postDate);
    });

    // Calculate counted and uncounted posts per week
    const leaderboard = usersData.map(user => {
      const username = user.username;
      const userWeeks = userPosts[username] || {};

      const weeks = Object.keys(userWeeks).map(weekNum => {
        const weekPosts = userWeeks[weekNum];
        const countedPosts = weekPosts.slice(0, tasksperweek);
        const unCountedPosts = weekPosts.slice(tasksperweek);

        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + weekNum * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        return {
          weekNum: parseInt(weekNum) + 1,
          weekRange: `${weekStart.toISOString()} - ${weekEnd.toISOString()}`,
          countedPosts: countedPosts.length,
          unCountedPosts: unCountedPosts.length,
        };
      });

      const totalCountedPosts = weeks.reduce((acc, week) => acc + week.countedPosts, 0);
      const totalUnCountedPosts = weeks.reduce((acc, week) => acc + week.unCountedPosts, 0);

      return {
        username,
        weeks,
        totalCountedPosts,
        totalUnCountedPosts,
      };
    });

    // Sort leaderboard and assign places
    leaderboard.sort((a, b) => b.totalCountedPosts - a.totalCountedPosts);

    let currentPlace = 1;
    for (let i = 0; i < leaderboard.length; i++) {
      if (i > 0 && leaderboard[i].totalCountedPosts < leaderboard[i - 1].totalCountedPosts) {
        currentPlace = i + 1;
      }
      leaderboard[i].place = currentPlace;
    }

    // Distribute money based on leaderboard
    const updatedLeaderboard = distributeMoney(leaderboard, buyin);


    return { leaderboard: updatedLeaderboard };
  } catch (e) {
    console.error('Unexpected error:', e);
    return { error: e };
  }
}




// Function to get a group by groupId
async function getGroup(groupid) {
  try {
    // Fetch group data and usergroup data concurrently
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
        users!inner(*)  -- Perform an inner join with the groups table
      `)
        .eq('groupid', groupid),
      supabase
        .from('invite')
        .select('*')
        .eq('groupid', groupid),
    ]);

    // Check for errors in the responses
    const groupError = groupResponse.error;
    const usergroupError = usergroupResponse.error;
    const inviteError = inviteResponse.error;

    // Return if any errors occurred
    if (groupError || usergroupError || inviteError) {
      return { data: null, error: groupError || usergroupError || inviteError };
    }

    // Fetch and process veto data
    const { data: processData, error: processError } = await processVeto(groupid);
    if (processError) {
      return { data: null, error: processError };
    }

    // Fetch post data
    const { data: postData, error: postError } = await supabase
      .from('post')
      .select('*')
      .eq('groupid', groupid)
      .or('valid.is.null,valid.eq.true');


    if (postError) {
      return { data: null, error: postError };
    }

    // Sort post data by timepost, with later dates first
    const sortedPost = postData ? postData.sort((a, b) => new Date(b.timepost) - new Date(a.timepost)) : [];

    // Combine data into a single response
    const data = {
      group: groupResponse.data,
      usergroup: usergroupResponse.data,
      invite: inviteResponse.data,
      post: sortedPost,
    };

    return { data, error: null };
  } catch (error) {
    console.error('Error in getGroup:', error);
    return { data: null, error: error.message };
  }
}

async function processVeto(groupid) {
  try {
    // Fetch member count
    const { data: memberData, error: memberError } = await supabase
      .from('usergroup')
      .select('username')
      .eq('groupid', groupid);

    if (memberError) throw memberError;

    const memberCount = memberData.length;
    console.log(memberCount);

    if (memberCount <= 2) {
      return { data: 'less than 2 members' };
    }

    // Fetch post data
    const { data: postData, error: postError } = await supabase
      .from('post')
      .select('*')
      .eq('groupid', groupid);

    if (postError) throw postError;

    const currentTime = new Date();
    const cutoffTime = new Date(currentTime.getTime() - 48 * 60 * 60 * 1000); // 48 hours ago
    const latePosts = [];

    for (const post of postData) {
      const postTime = new Date(post.timecycle);
      if (postTime < cutoffTime) {
        latePosts.push(post);
      }
    }

    // Process posts that are late and may need to be invalidated
    if (latePosts.length > 0) {
      console.log(latePosts, 'late')
      const postIdsToInvalidate = latePosts
        .filter(post => post.veto.length >= Math.ceil(memberCount * (1 / 2)))
        .map(post => post.postid);

      console.log(postIdsToInvalidate)

      const postIdsToValidate = latePosts
        .filter(post => post.veto.length < Math.ceil(memberCount * (1 / 2)))
        .map(post => post.postid);

      if (postIdsToValidate.length > 0) {
        const { error: updateError } = await supabase
          .from('post')
          .update({ valid: true })
          .in('postid', postIdsToValidate);
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

    return { data: 'Process completed successfully' };
  } catch (error) {
    console.error('Error processing veto:', error);
    return { error: error.message || 'An error occurred while processing veto' };
  }
}



async function processVetoDemo(groupid) {
  try {
    // Fetch member count
    const { data: memberData, error: memberError } = await supabase
      .from('usergroup')
      .select('username')
      .eq('groupid', groupid);

    if (memberError) throw memberError;

    const memberCount = memberData.length;
    console.log(memberCount);

    if (memberCount <= 2) {
      return { data: 'less than 2 members' };
    }

    // Fetch post data
    const { data: postData, error: postError } = await supabase
      .from('post')
      .select('*')
      .eq('groupid', groupid);

    if (postError) throw postError;

    const currentTime = new Date();
    const cutoffTime = new Date(currentTime.getTime() - 48 * 0 * 60 * 1000); // 48 hours ago
    const latePosts = [];

    for (const post of postData) {
      const postTime = new Date(post.timecycle);
      if (postTime < cutoffTime) {
        latePosts.push(post);
      }
    }

    // Process posts that are late and may need to be invalidated
    if (latePosts.length > 0) {
      console.log(latePosts, 'late')
      const postIdsToInvalidate = latePosts
        .filter(post => post.veto.length >= Math.ceil(memberCount * (1 / 2)))
        .map(post => post.postid);

      console.log(postIdsToInvalidate)

      const postIdsToValidate = latePosts
        .filter(post => post.veto.length < Math.ceil(memberCount * (1 / 2)))
        .map(post => post.postid);

      if (postIdsToValidate.length > 0) {
        const { error: updateError } = await supabase
          .from('post')
          .update({ valid: true })
          .in('postid', postIdsToValidate);
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

    return { data: 'Process completed successfully' };
  } catch (error) {
    console.error('Error processing veto:', error);
    return { error: error.message || 'An error occurred while processing veto' };
  }
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


async function endGroup(groupIds) {
  // Fetch leaderboards for all groupIds
  let leaderboards = await Promise.all(groupIds.map(groupId => getLeaderBoard(groupId)));

  leaderboards = leaderboards.map(l=>l.leaderboard)
  // Flatten all users from leaderboards into a single array
  const allUsers = leaderboards.flat();
  const uniqueUsers = Array.from(new Set(allUsers.map(user => user.username)))
    .map(username => ({
      username,
      netMoney: allUsers
        .filter(user => user.username === username)
        .reduce((sum, user) => sum + user.netMoney, 0),
    }));


  // Fetch current balances for all unique users
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('username, balance')
    .in('username', uniqueUsers.map(user => user.username));

  if (userError) {
    return { error: userError.message };
  }

  // Calculate new balances
  const updatedBalances = userData.map(user => {
    const userUpdate = uniqueUsers.find(u => u.username === user.username);
    return {
      username: user.username,
      newBalance: user.balance + userUpdate.netMoney,
    };
  });

  // Batch update balances
  const balanceUpdatePromises = updatedBalances.map(user =>
    supabase
      .from('users')
      .update({ balance: user.newBalance })
      .eq('username', user.username)
  );

  const balanceUpdateResults = await Promise.all(balanceUpdatePromises);

  const balanceUpdateErrors = balanceUpdateResults.filter(result => result.error);
  if (balanceUpdateErrors.length > 0) {
    return { error: 'Failed to update some user balances' };
  }

  // Batch update groups to archive
  const { data: groupUpdate, error: groupUpdateError } = await supabase
    .from('groups')
    .update({ archive: true })
    .in('groupid', groupIds);

  if (groupUpdateError) {
    return { error: groupUpdateError.message };
  }

  return { data:'success'};
}





async function processGroups() {
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('groupid, enddate')
    .eq('archive', false); // Get only active groups

  if (groupsError) {
    console.error('Error fetching groups:', groupsError);
    return { error: groupsError.message };
  }

  const now = new Date();
  const groupsToEnd = groups.filter(group => {
    const endDate = new Date(group.enddate);
    return now - endDate >= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }).map(group => group.groupid);

  if (groupsToEnd.length === 0) {
    return { data: 'No groups to process' };
  }

  try {
    const result = await endGroup(groupsToEnd);
    return result;
  } catch (error) {
    console.error('Error ending groups:', error);
    return { error: error.message };
  }
}







module.exports = { createGroup, getAllGroups, getGroup, getGroupsByHostId, updateGroup, deleteGroup, getLeaderBoard,processGroups,endGroup,processVetoDemo };
