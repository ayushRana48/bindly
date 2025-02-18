import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = '^O9w:&C_ci1Wo5~8y@V1Hz$=p)v-{s#y;9-?c<f==q:!y"aeuU0*R.`QQCgxf&j'; // Replace with env variable
const REFRESH_TOKEN_SECRET = '!n|(qr|-{!xcv,6l<0WWcm11^>:hs0aSQcJm`5;ahw!j8A%nk,$xofI4-b_tN<r'; // Replace with env variable
const ACCESS_TOKEN_EXPIRATION = "15m";
const REFRESH_TOKEN_EXPIRATION = "7d";

/**
 * Generate access and refresh tokens for a user
 */
export const generateTokens = (userId: string, userEmail: string, username: string) => {
    const accessToken = jwt.sign(
        { id: userId, email: userEmail, username }, // Include username in the payload
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );

    const refreshToken = jwt.sign(
        { id: userId, email: userEmail, username }, // Include username in the refresh token as well
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRATION }
    );

    return { accessToken, refreshToken };
};

/**
 * Verify and decode a refresh token
 */
export const verifyRefreshToken = (refreshToken: string) => {
    try {
        return jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { id: string; email: string; username: string };
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
};
