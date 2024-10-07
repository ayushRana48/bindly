const { supabase } = require('../initSupabase');

// Function to add a comment
async function addComment(postid, groupid, username, message) {
    const timestamp = new Date().toISOString();

    console.log(timestamp)

    const { data: userGroupData, error: userGroupError } = await supabase
    .from('usergroup')
    .select('username') // Select only the username to optimize
    .eq('groupid', groupid);


        console.log(userGroupError)

    if (userGroupError) {
        console.error('Error fetching user group:', userGroupError);
        return { data: null, error: 'Error fetching user group' };
    }

    console.log('userdata',userGroupData)

    // Step 2: Verify if the username is part of the group
    const isUserInGroup = userGroupData.some((user) => user.username === username);

    if (!isUserInGroup) {
        return { data: null, error: `User not in group` };
    }

    const { data, error } = await supabase
        .from('comment')
        .insert([
            {
                postid: postid,
                username: username,
                message: message,
                created: timestamp,
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Error adding comment:', error);
        return { data: null, error: error.message };
    }

    return { data, error: null };
}


async function getCommentByPost(postid) {
    const { data, error } = await supabase
        .from('comment')
        .select('commentid, username, message, created')
        .eq('postid', postid)
        .order('created', { ascending: false });

    if (error) {
        console.error('Error fetching comments:', error);
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

module.exports = { addComment, getCommentByPost };
