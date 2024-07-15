const { supabase } = require('./cronSupabase');
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

const notifyGroupStart = async () => {
    const currTime = new Date();
    const allNotifications = [];

    const { data: allGroups, error } = await supabase
        .from('groups')
        .select(`
            *,
            users:usergroup!inner(
                *,
                user:username!inner(
                    tokens
                )
            )
        `);

    if (error) {
        console.error("Error fetching groups and associated user groups:", error);
        return;
    }

    for (const group of allGroups) {
        const groupStartDate = new Date(group.startdate);
        const oneHourBeforeStart = new Date(groupStartDate.getTime() - 60 * 60 * 1000);
        const twelveHoursBeforeStart = new Date(groupStartDate.getTime() - 12 * 60 * 60 * 1000);


        // Notify 12 hours before and 1 hour before
        if (currTime < groupStartDate) {

            if (!group.notification_time) {
                // Less than 12 hours before start
                if (currTime >= twelveHoursBeforeStart) {
                    // Collect notifications
                    allNotifications.push(...createNotifications(group, `${group.groupname} starts in less than 12 hrs`));
                    await updateNotificationTime(group.groupid, currTime);
                }
            } else if (currTime >= oneHourBeforeStart && new Date(group.notification_time) < oneHourBeforeStart) {
                // Collect notifications
                allNotifications.push(...createNotifications(group, `${group.groupname} starts in less than 1 hr`));
                await updateNotificationTime(group.groupid, currTime);
            }
        } else {

            console.log('here')
            // Group has started and not been notified
            if (!group.notification_time || new Date(group.notification_time) < groupStartDate) {
                // Collect notifications
                allNotifications.push(...createNotifications(group, `${group.groupname} has started`));
                await updateNotificationTime(group.groupid, currTime);
            }
        }
    }

    // Send all collected notifications in batches
    await sendBatchNotifications(allNotifications);
};

const notifyGroupEnd = async () => {
    const currTime = new Date();
    const allNotifications = [];

    const { data: allGroups, error } = await supabase
        .from('groups')
        .select(`
            *,
            users:usergroup!inner(
                *,
                user:username!inner(
                    tokens
                )
            )
        `);

    if (error) {
        console.error("Error fetching groups and associated user groups:", error);
        return;
    }

    for (const group of allGroups) {
        const groupEndDate = new Date(group.enddate);

        // Notify 6 days after the group end date
        if (currTime > groupEndDate) {
            if (groupEndDate > new Date(group.notification_time)) {
                // Collect notifications
                allNotifications.push(...createNotifications(group, `${group.groupname} has ended`));
                await updateNotificationTime(group.groupid, currTime);
            }
        }
    }

    // Send all collected notifications in batches
    await sendBatchNotifications(allNotifications);
};

function createNotifications(group, message) {
    const userTokens = group.users.flatMap(user => user.user.tokens).filter(token => Expo.isExpoPushToken(token));
    return userTokens.map(token => ({
        to: token,
        sound: 'default',
        title: `Bindly`,
        body: `${message}`,
    }));
}

async function sendBatchNotifications(notifications) {
    console.log('groupNotificationsSTARRTTS',notifications)
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

async function updateNotificationTime(groupid, time) {
    const { error } = await supabase
        .from('groups')
        .update({ notification_time: time.toISOString() })
        .eq('groupid', groupid);

    if (error) {
        console.error("Error updating notification time:", error);
    }
}

module.exports = { notifyGroupStart, notifyGroupEnd };
