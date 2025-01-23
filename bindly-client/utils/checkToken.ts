import * as SecureStore from "expo-secure-store";

// Helper to decode JWT and check expiration
const isTokenExpired = (token: string): boolean => {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.exp * 1000 < Date.now(); // `exp` is in seconds, convert to ms
};

export const checkToken = async (): Promise<string> => {
  try {
    // Retrieve the access token
    let accessToken = await SecureStore.getItemAsync("accessToken");
    console.log('getting accessToken in checkToken', accessToken);
    if (!accessToken) {
      throw new Error("Access token not found. Please log in again.");
    }

    // Check if the access token is expired
    if (isTokenExpired(accessToken)) {
      console.log("Access token expired. Refreshing...");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      console.log('getting refreshToken in checkToken', refreshToken);

      if (!refreshToken) {
        throw new Error("Refresh token not found. Please log in again.");
      }

      // Call the refresh endpoint to et a new access token
      const response = await fetch("http://localhost:3000/bindly/auth/refreshToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const { accessToken: newAccessToken } = await response.json();

        // Save the new access token
        await SecureStore.setItemAsync("accessToken", newAccessToken);

        accessToken = newAccessToken;
      } else {
        throw new Error("Failed to refresh access token. Please log in again.");
      }
    }

    if (!accessToken) {
      throw new Error("Access token not found. Please log in again.");
    }

    console.log('accessToken in checkToken', accessToken);

    return accessToken;
  } catch (error:any) {
    console.error(error.message);
    throw new Error(error.message || "Error retrieving token.");
  }
};
