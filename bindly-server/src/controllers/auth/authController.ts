import { Request, Response } from "express";
import { signUpUser, signInUser, resendVerificationEmail, sendPasswordResetEmail, verifyOtp, resetPassword, verifyOtpForReset } from "./authService";
import { verifyRefreshToken, generateTokens } from "./tokenUtil";
import { supabase } from "../../initSupabase";

/**
 * Sign-up Controller
 */
export const signUpController = async (req: Request, res: Response) => {
    try {
        const { user, accessToken, refreshToken } = await signUpUser(req.body);
        return res.status(201).json({ 
            message: "User successfully signed up", 
            accessToken, 
            refreshToken, 
            user 
        });
    } catch (error:any) {
        return res.status(error.statusCode || 500).json({ 
            error: error instanceof Error ? error.message : "Unknown error" 
        });
    }
};

/**
 * Sign-in Controller
 */
export const signInController = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      console.log('email in signIlfslkfnController', email);
      const { accessToken, refreshToken, user } = await signInUser(email, password);
      console.log('accessToken in signIlfslkfnController', accessToken);
      console.log('refreshToken in signIlfslkfnController', refreshToken);
      console.log('user in signIlfslkfnController', user);
      return res
        .status(200)
        .json({ message: "Login successful", accessToken, refreshToken, user });
    console.log('message in signIlfslkfnController');
    } catch (error) {
        console.log('error in signInController', error);
      // Specifically handle unverified email scenario
      if (
        error instanceof Error &&
        error.message === "email_not_confirmed" // or a constant you set yourself
      ) {
        return res.status(200).json({
          error: "Email not verified. Please verify your email to proceed.",
        });
      }
  
      return res
        .status(400)
        .json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  };

// Sign-out controller
export const signOutController = async (req: Request, res: Response) => {
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


export const getUserController= async (req: Request, res: Response) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return res.status(200).json({ message: "success", user });
    } catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}


/**
 * Refresh Token Controller
 */
export const refreshTokenController = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: No refresh token provided" });
        }

        const refreshToken = authHeader.split(" ")[1];
        const decoded = verifyRefreshToken(refreshToken);

        const tokens = generateTokens(decoded.id,decoded.email,decoded.username);

        return res.status(200).json(tokens);
    } catch (error) {
        return res.status(403).json({ error: error instanceof Error ? error.message : "Invalid refresh token" });
    }
};

/**
 * Resend Verification Email
 */
export const resendSignUpCodeController = async (req: Request, res: Response) => {
    try {
        const response = await resendVerificationEmail(req.body.email);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
};

/**
 * Forgot Password Controller
 * 
 * 
 */
export const forgotPasswordController = async (req: Request, res: Response) => {
    try {
        const response = await sendPasswordResetEmail(req.body.email);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
};



/**
 * Verify OTP Controller
 */
export const verifyOtpController = async (req: Request, res: Response) => {
    try {
        const { email, token, type } = req.body;
        const response = await verifyOtp(email, token, type);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
};

/**
 * Verify OTP for Reset Controller
 */
export const verifyOtpForResetController = async (req: Request, res: Response) => {
    try {
        const { email, token } = req.body;
        const response = await verifyOtpForReset(email, token);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
};

/**
 * Reset Password Controller
 */
export async function resetPasswordController(req: Request, res: Response) {
    const { accessToken, newPassword } = req.body;

    try {
        console.log('accessToken in resetPasswordController', accessToken);
        console.log('newPassword in resetPasswordController', newPassword);

        const response = await resetPassword(accessToken, newPassword);
        return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
}


