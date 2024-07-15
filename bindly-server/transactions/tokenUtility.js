const fetch = require('node-fetch');

// const CLIENT_ID = 'AekF5AYefHO-N9KvZtOHDV6sWsd7KKvvt211XBrLaZrXRQlCjmHk8a88vA9b9pd0dg7xYGS1aCHMLiY-'
const CLIENT_ID = 'AbXWnwy9qO2FC5CDAL2SeOWOSSinFCuckHQU5mj-ivJSPMmwohSoc0n6Qaj1AffuEy9uSxhNckFXtLHi'

// const SECRET = 'ENyFJX8OwEbTWyXqF3dGQKrF_MFFPcbxuX5NyFpb5TnvUSqriFmhKB1jT-DEpw5r9l6b7hmbxbol91-k';
const SECRET = 'EDY4Wcky6wmFISCqv4LkV_bxKH0z1vaXaYUw9Y8wnP8Aj2JZGtnMB_BBMXGX4nqn-_YMA4hWUoQS0PUA';

// const BASE_URL = 'https://api-m.sandbox.paypal.com';
const BASE_URL = 'https://api-m.paypal.com';

let accessToken = null;
let tokenExpiry = null;

async function getAccessToken() {
    console.log('call')

    if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
        return accessToken;
    }

    const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64');

    console.log('here')
    try {
        const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        const data = await response.json();
        console.log(data,'data')

        accessToken = data.access_token;
        tokenExpiry = new Date(new Date().getTime() + data.expires_in * 1000);
        console.log(accessToken)
        return accessToken;
    } catch (error) {
        console.error('Failed to get access token', error);
        throw error;
    }
}

module.exports = { getAccessToken };
