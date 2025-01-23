import { Request, Response } from 'express';
import { supabase } from '../initSupabase';
import { createUser } from '../transactions/usersTransactions';
import jwt from 'jsonwebtoken';

// Environment variables (replace with process.env in production)
const ACCESS_TOKEN_SECRET = '^O9w:&C_ci1Wo5~8y@V1Hz$=p)v-{s#y;9-?c<f==q:!y"aeuU0*R.`QQCgxf&j'; // Replace with env variable
const REFRESH_TOKEN_SECRET = '!n|(qr|-{!xcv,6l<0WWcm11^>:hs0aSQcJm`5;ahw!j8A%nk,$xofI4-b_tN<r'; // Replace with env variable
const ACCESS_TOKEN_EXPIRATION = '15m'; // Short duration for testing
const REFRESH_TOKEN_EXPIRATION = '7d'; // Long-lived refresh token

// Utility function to generate tokens
const generateTokens = (user: any, username: string) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, username }, // Include username in the payload
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );

    const refreshToken = jwt.sign(
        { id: user.id, username }, // Include username in the refresh token as well
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRATION }
    );

    return { accessToken, refreshToken };
};

// Sign-up controller
async function signUpController(req: Request, res: Response) {
    const { username, email, firstName, lastName, password, pfp } = req.body;

    try {
        const { data: dataUser, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const { user } = dataUser;

        if (!user) {
            return res.status(400).json({ error: 'User creation failed.' });
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

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user, username);

        return res.status(200).json({
            message: "User successfully signed up",
            accessToken,
            refreshToken,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

// Sign-in controller
async function signInController(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
        const response = await supabase.auth.signInWithPassword({ email, password });
        if (response.error) {
            throw response.error;
        }

        const { user } = response.data;

        if (!user) {
            throw new Error('User not found.');
        }

        // Fetch the username from your database
        const { data: userData, error } = await supabase
            .from('users') // Your users table
            .select('username')
            .eq('email', email)
            .single();

        if (error || !userData) {
            throw new Error('Username not found.');
        }

        const username = userData.username;

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user, username);

        console.log

        return res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user,
        });
    } catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

// Sign-out controller
async function signOutController(req: Request, res: Response) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const resp = await supabase.auth.signOut();
            return res.status(200).json({ message: "Successfully signed out", data: resp });
        } else {
            return res.status(404).json({ message: "No user currently signed in" });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Error during sign out process",
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

// Get current user controller
async function getUserController(req: Request, res: Response) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return res.status(200).json({ message: "success", user });
    } catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

// Refresh token controller
async function refreshTokenController(req: Request, res: Response) {
    const { refreshToken } = req.body;

    console.log('refreshToken is being called in refreshTokenController', refreshToken);
    if (!refreshToken) {
        return res.status(401).json({ error: 'Unauthorized: No refresh token provided' });
    }

    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { id: string; email: string; username: string };

        // Generate a new access token with the `username` from the refresh token
        const accessToken = jwt.sign(
            { id: decoded.id, email: decoded.email, username: decoded.username }, // Include username
            ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRATION }
        );

        console.log('accessToken in refreshTokenController', accessToken);

        return res.status(200).json({ accessToken });
    } catch (error) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired refresh token' });
    }
}


export {
    signUpController,
    signInController,
    signOutController,
    getUserController,
    refreshTokenController,
};
