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


async function getLeaderBoard(groupid) {
  try {
    // Fetch group details
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('startdate, tasksperweek')
      .eq('groupid', groupid)
      .single();

    if (groupError) {
      console.error('Error fetching group data:', groupError);
      return { error: groupError };
    }

    const { startdate, tasksperweek } = groupData;
    const startDate = new Date(startdate);

    // Fetch posts for the group
    const { data: postsData, error: postsError } = await supabase
      .from('post')
      .select('username, timepost')
      .eq('groupid', groupid);

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
    const leaderboard = Object.keys(userPosts).map(username => {
      const weeks = Object.keys(userPosts[username]).map(weekNum => {
        const weekPosts = userPosts[username][weekNum];
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

    console.log(leaderboard)

    return {leaderboard};
  } catch (e) {
    console.error('Unexpected error:', e);
    return { error: e };
  }
}



// Function to get a group by groupId
// Function to get a group by groupId
async function getGroup(groupid) {
  // Fetch group data
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('groupid', groupid)
    .single();

  // Fetch usergroup data
  const { data: usergroup, error: usergroupError } = await supabase
    .from('usergroup')
    .select(`
    *,
    users!inner(*)  -- Perform an inner join with the groups table
  `)
    .eq('groupid', groupid);

  // Fetch invite data
  const { data: invite, error: inviteError } = await supabase
    .from('invite')
    .select('*')
    .eq('groupid', groupid);

  // Fetch post data
  const { data: post, error: postError } = await supabase
    .from('post')
    .select('*')
    .eq('groupid', groupid);

  // Sort post data by timepost, with later dates first
  const sortedPost = post ? post.sort((a, b) => new Date(b.timepost) - new Date(a.timepost)) : [];

  // Fetch history data
  const { data: history, error: historyError } = await supabase
    .from('history')
    .select('*')
    .eq('groupid', groupid);



  // Combine all errors into one if any
  const error = groupError || usergroupError || inviteError || postError || historyError;

  // Return an object with all the fetched data, including sorted posts
  return { data: { group, usergroup, invite, post: sortedPost, history }, error };
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





module.exports = { createGroup, getAllGroups, getGroup, getGroupsByHostId, updateGroup, deleteGroup,getLeaderBoard };
