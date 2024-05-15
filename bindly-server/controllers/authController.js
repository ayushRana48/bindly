const { supabase } = require('../initSupabase');


async function signUpController(req, res) {
    const { username, email, firstName, lastName, password } = req.body;
    console.log('helooooooooookjxfn')

    const { data: dataUser, error } = await supabase.auth.signUp({
        email,
        password,
    });

    console.log('helooooooooookjxfn')

    console.log(email)
    console.log(password)
  
    if (error) {
        return res.status(400).json({ error: error.message });
    }
  
    const userId = dataUser.user?.id;
  
    const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
            email,
            firstName,
            lastName,
            username,
        });
  
    if (profileError) {
        return res.status(400).json({ error: profileError.message });
    }

    return res.status(200).json({ message: "success" });
}



async function signInController(req, res) {
    const { email, password } = req.body;

   

    try {
        console.log('wait')

        const response = await supabase.auth.signInWithPassword({ email, password });
        if (response.error) {
            throw response.error;
        }

        // console.log('response',response)


        const user = response.data.user;
        // console.log('user',user)

        if (!user) {
            throw new Error('User not found or not signed in.');
        }

        return res.status(200).json({ message: "success" });
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({ error: error.message });
    }
}

  

  module.exports={signInController,signUpController}