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
            options: {
                emailRedirectTo: undefined, // No redirect; using OTP
            },
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
    console.log('email in signInController', email);

    try {
        const response = await supabase.auth.signInWithPassword({ email, password });
        if (response.error) {
            console.log('response.error in signInController', response.error);
            if (response.error.code == 'email_not_confirmed') {
                return res.status(200).json({
                    error: "Email not verified. Please verify your email to proceed.",
                });
            }
            console.log('response.error in signInController', response.error);
            throw response.error;
        }

        const { user } = response.data;

        console.log('user in signInController', user);

        if (!user.email_confirmed_at) {
            return res.status(400).json({
                error: "Email not verified. Please verify your email to proceed.",
            });

        }


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
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No refresh token provided" });
    }

    const refreshToken = authHeader.split(" ")[1]; // Extract token from header

    console.log("Refresh token received:", refreshToken);

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
            id: string;
            email: string;
            username: string;
        };

        // Generate new access token
        const accessToken = jwt.sign(
            { id: decoded.id, email: decoded.email, username: decoded.username },
            ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRATION }
        );

        // Generate a new refresh token (optional, depends on your rotation policy)
        const newRefreshToken = jwt.sign(
            { id: decoded.id, email: decoded.email, username: decoded.username },
            REFRESH_TOKEN_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRATION }
        );

        return res.status(200).json({ accessToken, newRefreshToken });
    } catch (error) {
        return res.status(403).json({ error: "Forbidden: Invalid or expired refresh token" });
    }
}

async function resendCodeController(req: Request, res: Response) {
    const { email } = req.body;

    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ message: "Verification email resent successfully." });
    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}


async function forgetPasswordCodeController(req: Request, res: Response) {
    const { email } = req.body;

    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email)

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ message: "Reset password email sent successfully.", data });
    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}


async function verifyCodeController(req: Request, res: Response) {
    const { email, token, type } = req.body;
    // type is either signup or recovery

    console.log('email in verifyCodeController', email);
    console.log('token in verifyCodeController', token);
    try {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: type,
        });

        console.log('data in verifyCodeController', data);
        console.log('error in verifyCodeController', error);

        if (data) {
            const { data: userData, error } = await supabase
                .from('users') // Your users table
                .select('username')
                .eq('email', email)
                .single();

            if (error || !userData) {
                throw new Error('Username not found.');
            }

            const username = userData.username;


            const { accessToken, refreshToken } = generateTokens(data.user, username);

            console.log('accessToken in verifyCodeController', accessToken);
            console.log('refreshToken in verifyCodeController', refreshToken);
            console.log('user in verifyCodeController', data.user); 
            return res.status(200).json({
                message: "Email verified successfully.",
                accessToken,
                refreshToken,
                user: data.user,
            });

        }
        else{
            if (error) {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({
                error: 'Unknown error',
            });
        }

    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

async function verifyOtpForReset(req: Request, res: Response) {
    const { email, token } = req.body;

    try {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'recovery',
        });

        if (error || !data?.session) {
            return res.status(400).json({ error: error?.message || "Invalid OTP." });
        }

        return res.status(200).json({
            message: "OTP verified. You can now reset your password.",
            session: data.session, // Send session back to frontend
        });

    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}


async function resetPasswordController(req: Request, res: Response) {
    const { accessToken, newPassword } = req.body;

    console.log('accessToken in resetPasswordController', accessToken);
    console.log('newPassword in resetPasswordController', newPassword);

    try {
        // Set the authenticated session for the user
        supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: "", // Not required for one-time use
        });

        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        console.log('data in resetPasswordController', data);
        console.log('error in resetPasswordController', error);

        
        if (data) {
            const { data: userData, error } = await supabase
                .from('users') // Your users table
                .select('username')
                .eq('email', data?.user?.email)
                .single();
                console.log('userData in resetPasswordController', userData);

            if (error || !userData) {
                throw new Error('Username not found.');
            }

            const username = userData.username;


            const { accessToken, refreshToken } = generateTokens(data.user, username);

            console.log('accessToken in resetPasswordController', accessToken);
            console.log('refreshToken in resetPasswordController', refreshToken);
            console.log('user in resetPasswordController', data.user); 
            return res.status(200).json({
                message: "Email verified successfully.",
                accessToken,
                refreshToken,
                user: data.user,
            });

        }
        else{
            if (error) {
                return res.status(400).json({ error: error.message });
            }

            return res.status(500).json({
                error: 'Unknown error',
            });
        }


    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}




export {
    signUpController,
    signInController,
    signOutController,
    getUserController,
    refreshTokenController,
    resendCodeController,
    verifyCodeController,
    forgetPasswordCodeController,
    verifyOtpForReset,
    resetPasswordController
};
