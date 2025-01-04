import fetch from 'node-fetch';

// const CLIENT_ID = 'AekF5AYefHO-N9KvZtOHDV6sWsd7KKvvt211XBrLaZrXRQlCjmHk8a88vA9b9pd0dg7xYGS1aCHMLiY-'
const CLIENT_ID = 'AbXWnwy9qO2FC5CDAL2SeOWOSSinFCuckHQU5mj-ivJSPMmwohSoc0n6Qaj1AffuEy9uSxhNckFXtLHi'

// const SECRET = 'ENyFJX8OwEbTWyXqF3dGQKrF_MFFPcbxuX5NyFpb5TnvUSqriFmhKB1jT-DEpw5r9l6b7hmbxbol91-k';
const SECRET = 'EDY4Wcky6wmFISCqv4LkV_bxKH0z1vaXaYUw9Y8wnP8Aj2JZGtnMB_BBMXGX4nqn-_YMA4hWUoQS0PUA';

// const BASE_URL = 'https://api-m.sandbox.paypal.com';
const BASE_URL = 'https://api-m.paypal.com';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

let accessToken: string | null = null;
let tokenExpiry: Date | null = null;

async function getAccessToken(): Promise<string> {
  if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
    return accessToken;
  }

  const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64');

  try {
    const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json() as TokenResponse;

    accessToken = data.access_token;
    tokenExpiry = new Date(new Date().getTime() + data.expires_in * 1000);

    return accessToken;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to get access token');
  }
}

export { getAccessToken };