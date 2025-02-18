import { decode as base64Decode } from "base-64";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from '@react-native-cookies/cookies';


let refreshingPromise: Promise<string> | null = null;

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(base64Decode(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

const clearAuthData = async () => {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
  await AsyncStorage.removeItem("userEmail");
  refreshingPromise = null;
};

const refreshAccessToken = async (): Promise<string> => {
  try {
    // Get refresh token from SecureStore
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    if (!refreshToken) throw new Error("No refresh token found");

    // Make request with refresh token in Authorization header
    const response = await fetch("http://localhost:3000/bindly/auth/refreshToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`, // Send refresh token in headers
      },
    });

    if (!response.ok) {
      await clearAuthData();
      throw new Error("SESSION_EXPIRED");
    }

    const { accessToken, newRefreshToken } = await response.json();

    // Store new tokens
    await SecureStore.setItemAsync("accessToken", accessToken);
    if (newRefreshToken) {
      await SecureStore.setItemAsync("refreshToken", newRefreshToken);
    }

    return accessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
};

export const checkToken = async (): Promise<string> => {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");

    if (!accessToken || isTokenExpired(accessToken)) {
      if (!refreshingPromise) {
        refreshingPromise = refreshAccessToken();
      }
      try {
        accessToken = await refreshingPromise;
      } catch (error) {
        if (error instanceof Error && error.message === "SESSION_EXPIRED") {
          throw new Error("SESSION_EXPIRED");
        }
        throw error;
      } finally {
        refreshingPromise = null;
      }
    }

    return accessToken;
  } catch (error) {
    if (error instanceof Error && error.message === "SESSION_EXPIRED") {
      throw error; // Rethrow SESSION_EXPIRED error
    }
    console.error("Token check error:", error);
    throw new Error("TOKEN_ERROR");
  }
};