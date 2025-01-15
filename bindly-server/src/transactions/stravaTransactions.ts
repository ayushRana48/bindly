import { PrismaClient } from '@prisma/client';
import { User, DatabaseResponse } from '../types';

const prisma = new PrismaClient();

interface StravaAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
}

interface StravaActivity {
  id: number;
  type: string;
  start_date: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  average_speed: number;
  max_speed: number;
  total_elevation_gain: number;
  name: string;
}

export const addStravaRefresh = async (
  refresh: string, 
  username: string
): Promise<DatabaseResponse<User>> => {
  try {
    const data = await prisma.users.update({
      where: { username },
      data: { stravarefresh: refresh }
    }) as User;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const reauthorizeStrava = async (
  refresh: string, 
  username: string
): Promise<DatabaseResponse<StravaAuthResponse>> => {
  const auth_link = "https://www.strava.com/oauth/token";

  try {
    const response = await fetch(auth_link, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: '111319',
        client_secret: 'b03bfa9b476ff3e1536d632e33224d6b23f0f506',
        refresh_token: refresh,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      await prisma.users.update({
        where: { username },
        data: { stravarefresh: null }
      });
      return { data: null, error: new Error('refresh invalid') };
    }

    const data: StravaAuthResponse = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const revokeStravaAccess = async (
  username: string, 
  refreshToken: string
): Promise<DatabaseResponse<User>> => {
  const { data: reauthData, error: reauthError } = await reauthorizeStrava(refreshToken, username);

  if (reauthError) {
    return { data: null, error: reauthError };
  }

  const accessToken = reauthData?.access_token;

  try {
    const response = await fetch('https://www.strava.com/oauth/deauthorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to revoke Strava access.');
    }

    const data = await prisma.users.update({
      where: { username },
      data: { stravarefresh: null }
    }) as User;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const getActivities = async (
  username: string, 
  refreshToken: string
): Promise<DatabaseResponse<StravaActivity[]>> => {
  const { data: reauthData, error: reauthError } = await reauthorizeStrava(refreshToken, username);

  if (reauthError) {
    return { data: null, error: reauthError };
  }

  const accessToken = reauthData?.access_token;
  const currentTime = Math.floor(Date.now() / 1000);
  const twoDaysAgo = currentTime - 48 * 60 * 60;

  try {
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${twoDaysAgo}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get Strava activities.');
    }

    const activities: StravaActivity[] = await response.json();
    return { data: activities, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};