const { supabase } = require('../initSupabase');



async function registerToken(username,token) {
    console.log('transact')

    const { data, error } = await supabase
        .from('users')
        .select(`tokens`)
        .eq('username', username)
        .single()

    console.log({data,error})

    
    if(error){
        return{error}
    }

    const newTokens =data.tokens
    if(!newTokens.includes(token)){
        newTokens.push(token)
    }

    console.log(newTokens)

    const { data:updateData, error:updateError } = await supabase
    .from('users')
    .update({ tokens: newTokens })
    .eq('username', username)
    .select()
    .single()

    console.log({data:updateData, error:updateError })


    if(updateError){
        return {error:updateError}
    }

    console.log(updateData)


    return { data:updateData, error };
}


async function removeToken(username, token) {
    console.log('transact');
    console.log(username);
    console.log(token);

    const { data, error } = await supabase
        .from('users')
        .select('tokens')
        .eq('username', username)
        .single();

    console.log({ data, error });

    if (error) {
        return { error };
    }

    console.log(data);

    console.log('here', data?.tokens);

    const newTokens = data?.tokens.filter(t => t !== token); // Store the filtered tokens in a new array

    console.log(newTokens, 'nt');

    const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ tokens: newTokens })
        .eq('username', username)
        .select()
        .single();

    console.log({ data: updateData, error: updateError });

    if (updateError) {
        return { error: updateError };
    }

    console.log(updateData);

    return { data: updateData, error };
}



module.exports = { registerToken,removeToken };
