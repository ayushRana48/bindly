const { supabase } = require('../initSupabase');
const { v4: uuidv4 } = require('uuid');

async function createVeto(postid, groupid, username, timecycle) {
    const time = new Date().toISOString();

    const { data: memberData, error: memberError } = await supabase
        .from('usergroup')
        .select('username')
        .eq('groupid', groupid);

    if (memberError) return { error: memberError };

    if (memberData.length <= 2) {
        await supabase
            .from('veto')
            .delete()
            .eq('groupid', groupid);

        return { data: 'cannot veto, less than 2 members' };
    }

    const vetoid = uuidv4();

    const { data, error } = await supabase
        .from('veto')
        .insert([{
            vetoid,
            postid,
            groupid,
            reason,
            count: 1,
            time,
            username,
            timecycle
        }])
        .select()
        .single();

    return { data, error };
}


async function updateVeto(vetoid, count) {
    const { data, error } = await supabase
        .from('veto')
        .update({ count })
        .eq('vetoid', vetoid)
        .select()
        .single();

    return { data, error };
}


async function getVetoByGroup(groupid) {
    const { data, error } = await supabase
        .from('veto')
        .select('*')
        .eq('groupid', groupid);

    return { data, error };
}



async function deleteVeto(vetoid) {
    const { data, error } = await supabase
        .from('veto')
        .delete()
        .eq('vetoid', vetoid);

    return { data, error };
}

async function processVeto(groupid) {
    try {
        // Fetch member count and vetos in one query
        const { data: memberData, error: memberError } = await supabase
            .from('usergroup')
            .select('username')
            .eq('groupid', groupid);

        if (memberError) throw memberError;

        const memberCount = memberData.length;

        if (memberCount <= 2) {
            const { error } = await supabase
                .from('veto')
                .delete()
                .eq('groupid', groupid);

            if (error) throw error;

            return { data: 'Deleted all vetos, less than 2 members' };
        }

        const { data: vetoData, error: vetoError } = await supabase
            .from('veto')
            .select('*')
            .eq('groupid', groupid);

        if (vetoError) throw vetoError;

        const currentTime = new Date();
        const cutoffTime = new Date(currentTime.getTime() - 48 * 60 * 60 * 1000); // 48 hours ago
        const validVetos = [];
        const invalidVetos = [];

        for (const veto of vetoData) {
            const vetoTime = new Date(veto.timecycle);
            if (vetoTime < cutoffTime) {
                invalidVetos.push(veto);
            } else {
                validVetos.push(veto);
            }
        }

        if (invalidVetos.length > 0) {
            const postIdsToUpdate = invalidVetos
                .filter(veto => veto.count >= Math.ceil(memberCount * 0.5))
                .map(veto => veto.postid);

            if (postIdsToUpdate.length > 0) {
                const { error: postError } = await supabase
                    .from('post')
                    .update({ valid: false })
                    .in('postid', postIdsToUpdate);

                if (postError) throw postError;

                const notifications = invalidVetos
                    .filter(veto => postIdsToUpdate.includes(veto.postid))
                    .map(veto => ({
                        notifyvetoid: uuidv4(),
                        postid: veto.postid,
                        username: veto.username,
                        reason: veto.reason
                    }));

                if (notifications.length > 0) {
                    const { error: notifyError } = await supabase
                        .from('notifyveto')
                        .insert(notifications);

                    if (notifyError) throw notifyError;
                }
            }

            const invalidVetoIds = invalidVetos.map(veto => veto.vetoid);
            const { error: deleteError } = await supabase
                .from('veto')
                .delete()
                .in('vetoid', invalidVetoIds);

            if (deleteError) throw deleteError;
        }

        return { data: 'Process completed successfully' };
    } catch (error) {
        console.error('Error processing veto:', error);
        return { error: error.message || 'An error occurred while processing veto' };
    }
}

module.exports = { processVeto };



module.exports={createVeto,updateVeto,deleteVeto,getVetoByGroup,processVeto}