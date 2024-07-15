const { supabase } = require('./cronSupabase');
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

const notifyPost = async () => {
    const currTime = new Date();
    const allNotifications = [];

    // Fetch all groups that have started and are running in 24-hour cycles
    const { data: allGroups, error: groupError } = await supabase
        .from('groups')
        .select('groupid,groupname, startdate, enddate')
        .lt('startdate', currTime.toISOString())
        .gt('enddate', currTime.toISOString());

    if (groupError) {
        console.error("Error fetching groups:", groupError);
        return;
    }

    for (const group of allGroups) {

        // console.log(group)
        const groupStartDate = new Date(group.startdate);
        const groupEndDate = new Date(group.enddate);

        // Ensure the group is still active
        if (currTime < groupStartDate || currTime > groupEndDate) {
            continue;
        }

        // Calculate cycle start time based on the group's start date
        const cycleStartTime = new Date(
            currTime.getFullYear(),
            currTime.getMonth(),
            currTime.getDate(),
            groupStartDate.getHours(),
            groupStartDate.getMinutes(),
            groupStartDate.getSeconds()
        );

        if (currTime < cycleStartTime) {
            cycleStartTime.setDate(cycleStartTime.getDate() - 1);
        }

        const twelveHoursLeftTime = new Date(cycleStartTime.getTime() + 12 * 60 * 60 * 1000);
        const fourHoursLeftTime = new Date(cycleStartTime.getTime() + 20 * 60 * 60 * 1000);

        // Fetch users in the group along with their tokens from the users table
        const { data: userGroups, error: userGroupError } = await supabase
            .from('usergroup')
            .select(`
                username,
                post_notification_time,
                users!inner(tokens)
            `)
            .eq('groupid', group.groupid);

        if (userGroupError) {
            console.error("Error fetching user groups:", userGroupError);
            continue;
        }

        for (const userGroup of userGroups) {
            const { username, post_notification_time, users: { tokens } } = userGroup;
            const userNotificationTime = post_notification_time ? new Date(post_notification_time) : null;

            const { data: postData, error: postError } = await supabase
                .from('post')
                .select('timepost')
                .eq('username', username)
                .eq('groupid', group.groupid)
                .order('timepost', { ascending: false })
                .limit(1)
                .single();

            const timepost = postData ? new Date(postData.timepost) : null;

            const shouldNotify12Hours = (!timepost || (timepost && (new Date(cycleStartTime).getTime()-timepost) >= 24 * 60 * 60 * 1000)) && (currTime >= twelveHoursLeftTime);
            const shouldNotify4Hours = (!timepost || (timepost && (new Date(cycleStartTime).getTime()-timepost) >= 24 * 60 * 60 * 1000)) && (currTime >= fourHoursLeftTime);

            if (shouldNotify12Hours && (!userNotificationTime || userNotificationTime < twelveHoursLeftTime)) {
                allNotifications.push(...createNotifications(tokens, group.groupname, `You have 12 hours left to post in ${group.groupname}`));
                await updateUserNotificationTime(username, group.groupid, currTime);
            } else if (shouldNotify4Hours && (!userNotificationTime || userNotificationTime < fourHoursLeftTime)) {
                allNotifications.push(...createNotifications(tokens, group.groupname, `You have 4 hours left to post in ${group.groupname}`));
                await updateUserNotificationTime(username, group.groupid, currTime);
            }
        }
    }

    // Send all collected notifications in batches
    await sendBatchNotifications(allNotifications);
};

function createNotifications(tokens, groupname, message) {
    const userTokens = tokens.filter(token => Expo.isExpoPushToken(token));
    return userTokens.map(token => ({
        to: token,
        sound: 'default',
        title: `Bindly`,
        body: `${message}`,
    }));
}

async function sendBatchNotifications(notifications) {
    // console.log('postNotifications',notifications)
    const chunks = expo.chunkPushNotifications(notifications);
    const tickets = [];
    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    }
}

async function updateUserNotificationTime(username, groupid, time) {
    const { error } = await supabase
        .from('usergroup')
        .update({ post_notification_time: time.toISOString() })
        .eq('username', username)
        .eq('groupid', groupid);

    if (error) {
        console.error("Error updating notification time:", error);
    }
}

module.exports = { notifyPost };
