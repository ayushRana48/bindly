const { supabase } = require('../initSupabase');


async function signUpController(req, res) {
    const { username, email, firstName, lastName, password } = req.body;

    const { data: dataUser, error } = await supabase.auth.signUp({
        email,
        password,
    });

  

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

        const response = await supabase.auth.signInWithPassword({ email, password });
        if (response.error) {
            throw response.error;
        }

     


        const user = response.data.user;

        if (!user) {
            throw new Error('User not found or not signed in.');
        }

        return res.status(200).json({ message: "success" });
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({ error: error.message });
    }
}



async function signOutController(req, res) {
    try {
        // Assuming 'supabase' is already initialized and available here
        const user = await supabase.auth.getUser();

        if (user) {
            const resp = await supabase.auth.signOut();
            return res.status(200).json({ message: "Successfully signed out", data: resp });
        } else {
            // No user is currently signed in
            return res.status(404).json({ message: "No user currently signed in" });
        }
    } catch (error) {
        console.error('Error signing out:', error);
        return res.status(500).json({ message: "Error during sign out process", error: error.message });
    }
}



async function getUserController(req, res) {

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser()


        return res.status(200).json({ message: "success", user: user });
    }
    catch (error) {
        console.log(error.message)
        return res.status(400).json({ error: error.message });

    }



}



module.exports = { signInController, signUpController, signOutController, getUserController }