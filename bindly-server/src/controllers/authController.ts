import { Request, Response } from 'express';
import { supabase } from '../initSupabase';
import { createUser } from '../transactions/usersTransactions';

async function signUpController(req: Request, res: Response) {
    const { username, email, firstName, lastName, password, pfp } = req.body;

    const { data: dataUser, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    const { data: profileData, error: profileError } = await createUser(
        username, 
        email, 
        firstName,
        lastName, 
        pfp
    );

    if (profileError) {
        return res.status(400).json({ error: profileError.message });
    }

    return res.status(200).json({ message: "success" });
}

async function signInController(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
        const response = await supabase.auth.signInWithPassword({ email, password });
        console.log('response', response);
        if (response.error) {
            throw response.error;
        }

        const user = response.data.user;

        if (!user) {
            throw new Error('User not found or not signed in.');
        }

        return res.status(200).json({ message: "success" });
    } catch (error) {
        return res.status(400).json({ 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
}

async function signOutController(req: Request, res: Response) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('user', user);

        if (user) {
            const resp = await supabase.auth.signOut();
            return res.status(200).json({ message: "Successfully signed out", data: resp });
        } else {
            return res.status(404).json({ message: "No user currently signed in" });
        }
    } catch (error) {
        return res.status(500).json({ 
            message: "Error during sign out process", 
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function getUserController(req: Request, res: Response) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return res.status(200).json({ message: "success", user });
    } catch (error) {
        return res.status(400).json({ 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
}

export { 
    signInController, 
    signUpController, 
    signOutController, 
    getUserController 
};