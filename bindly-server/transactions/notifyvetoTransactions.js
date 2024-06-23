const { supabase } = require('../initSupabase');



async function getNotifyveto(username) {
    const { data, error } = await supabase
        .from('notifyveto')
        .select(`
            *,
            post(*),
            groups:groupid(*)
        `)
        .eq('username', username);

        const { data:deleteData, error:deleteError } = await supabase
        .from('notifyveto')
        .delete()
        .eq('username', username);

        if(deleteError){
            return {error:deleteError}
        }

        console.log(data)

    return { data, error };
}


module.exports = { getNotifyveto };
