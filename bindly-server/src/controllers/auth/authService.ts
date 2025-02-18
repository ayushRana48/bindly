import { supabase } from "../../initSupabase";
import { generateTokens } from "./tokenUtil";
import { createUser } from '../../transactions/usersTransactions';

/**
 * Sign up a new user
 */
export const signUpUser = async (userData: { 
    username: string; 
    email: string; 
    firstName: string; 
    lastName: string; 
    password: string; 
    pfp: string 
}) => {
    const { email, password, username, firstName, lastName, pfp } = userData;

    // Sign up user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { emailRedirectTo: undefined }, // Ensures no email redirect (for OTP-based signup)
    });

    if (error) throw new Error(error.message);

    const { user } = data;
    if (!user) throw new Error("User creation failed");

    // Store user profile in the database
    const { error: profileError } = await createUser(username, email, firstName, lastName, pfp);
    if (profileError) throw new Error(profileError.message);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, email, username);


    return { user, accessToken, refreshToken };
};
/**
 * Sign in user
 */
export const signInUser = async (email: string, password: string) => {
    console.log('email in signInUser', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    console.log('error in signInUser', error);
    console.log('data in signInUser', data);
    
    if (error) {
      // if Supabase returns an 'email_not_confirmed' error code
      if (error.code === "email_not_confirmed") {
        // throw something you can catch in your controller
        throw new Error("email_not_confirmed");
      }
      throw new Error(error.message);
    }
  
    // If no explicit error, but user is not verified
    if (!data?.user) {
      throw new Error("User not found.");
    }
    if (!data.user.email_confirmed_at) {
      throw new Error("email_not_confirmed");
    }
  
    // Get username from DB
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("username")
      .eq("email", email)
      .single();
  
    if (userError || !userData) {
      throw new Error("Username not found.");
    }
  
    const { accessToken, refreshToken } = generateTokens(
      data.user.id,
      email,
      userData.username
    );
  
    return {
      accessToken,
      refreshToken,
      user: data.user,
    };
  };

/**
 * Send email verification
 */
export const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) throw new Error(error.message);
    return { message: "Verification email resent successfully." };
};


/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
    return { message: "Reset password email sent successfully." };
};

/**
 * Verify OTP for email confirmation or password recovery
 */
export const verifyOtp = async (email: string, token: string, type: "signup" | "recovery") => {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type });
    if (error || !data?.user) throw new Error("Invalid or expired OTP");

    // Get username from DB
    const { data: userData, error: userError } = await supabase.from("users").select("username").eq("email", email).single();
    if (userError || !userData) throw new Error("Username not found.");

    const { accessToken, refreshToken } = generateTokens(data.user.id, email, userData.username);

    return { accessToken, refreshToken, user: data.user };
};


/**
 * Verify OTP specifically for password reset
 */
export const verifyOtpForReset = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "recovery",
    });

    if (error || !data?.session) {
        throw new Error(error?.message || "Invalid OTP.");
    }

    return {
        message: "OTP verified. You can now reset your password.",
        session: data.session, // Send session back to frontend
    };
};

/**
 * Reset password
 */
export const resetPassword = async (accessToken: string, newPassword: string) => {
    
        // Set the authenticated session for the user
        supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: "", // Not required for one-time use
        });

        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        
        if (error) throw new Error(error.message);

    
};
