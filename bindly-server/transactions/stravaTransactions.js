const { supabase } = require('../initSupabase');

const addStravaRefresh = async (refresh, username) => {
  console.log('addStravaaa');

  const { data, error } = await supabase
    .from('users')
    .update({ stravarefresh: refresh })
    .eq('username', username)
    .select()
    .single();

  if (error) {
    return { error };
  }

  return { data };
};

const reauthorizeStrava = async (refresh, username) => {
  console.log('reauttthstravaa',refresh, ' ', username);
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
      const resp = await response.json()
      console.log(resp)
      // Refresh token is invalid, so clear it from the database
      await supabase
        .from('users')
        .update({ stravarefresh: null })
        .eq('username', username);
      return { error: 'refresh invalid' };
    }

    const data = await response.json();
    console.log('Reauthorization successful:', data);
    return { data };
  } catch (error) {
    console.error('Error during reauthorization:', error);
    return { error };
  }
};

const revokeStravaAccess = async (username, refreshToken) => {
  const { data: reauthData, error: reauthError } = await reauthorizeStrava(refreshToken, username);

  if (reauthError) {
    console.error('Error during reauthorization before revoking access:', reauthError);
    return { error: reauthError };
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

    const data = await response.json();
    console.log('Deauthorization response:', data);

    // After revoking access, remove the refresh token from your database
    const { data: removeResponse, error } = await supabase
      .from('users')
      .update({ stravarefresh: null })  // Set refresh token to null
      .eq('username', username)
      .select()
      .single();

    if (error) {
      console.error('Error removing Strava refresh token:', error);
      return { error };
    }

    console.log('Remove refresh token response:', removeResponse);
    return { data: removeResponse };
  } catch (error) {
    console.error('Error revoking Strava access:', error);
    return { error };
  }
};

const getActivities = async (username, refreshToken) => {
  const { data: reauthData, error: reauthError } = await reauthorizeStrava(refreshToken, username);

  if (reauthError) {
    console.error('Error during reauthorization before getting activities:', reauthError);
    return { error: reauthError };
  }

  const accessToken = reauthData?.access_token;
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds since epoch
  const twoDaysAgo = currentTime - 48 * 60 * 60; // 48 hours ago in seconds since epoch

  try {
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${twoDaysAgo}`, // Filter for past 48 hours
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

    const activities = await response.json();
    return { data: activities };
  } catch (error) {
    console.error('Error getting Strava activities:', error);
    return { error };
  }
};


module.exports = { reauthorizeStrava, addStravaRefresh, revokeStravaAccess, getActivities };
