import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { checkToken } from './utils/checkToken';

interface LogData {
  logData: string;
}

interface TokenRegistration {
  username: string;
  token: string;
}

async function logToServer(message: string): Promise<void> {
    try {
        await fetch('https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ logData: message } as LogData),
        });
    } catch (error) {
        console.error('Error logging to server:', error);
    }
}

export async function registerForPushNotificationsAsync(username: string): Promise<string | undefined> {
    try {
        await logToServer(`We are calling Register, username here, ${username}`);

        const storedToken = await AsyncStorage.getItem('expoPushToken');
        if (storedToken) {
            await logToServer(`Push notification token already exists:, ${storedToken}`);
        }

        console.log('storedToke', storedToken);

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        console.log(existingStatus, 'existingg stattus');
        await logToServer(`${existingStatus},existingg stattus`);

        console.log('LLOOLKJF:LKSAJF:LISJ HEEREEE');
        await logToServer('About to get status');

        const { status } = await Notifications.requestPermissionsAsync();
        console.log(status, 'the stattus');
        finalStatus = status;

        await logToServer(`Here is the status,${status}`);

        if (finalStatus !== 'granted') {
            return;
        }

        await logToServer('status granted');

        const token = (await Notifications.getExpoPushTokenAsync({
            projectId: '2fbbe1b1-62f4-47a4-91de-b96b0020b8fe',
        })).data;

        await logToServer(`got the token ${token}`);
        console.log('token', token);

        await AsyncStorage.setItem('expoPushToken', token);
        await logToServer('set to asycn');

        console.log('Registering push notification token with backend...');
        await logToServer('Registering push notification token with backend...');

        const apiToken = await checkToken();

        const response = await fetch('https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/notification/registerToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${apiToken}`},
            body: JSON.stringify({
                username,
                token
            } as TokenRegistration),
        });

        if (!response.ok) {
            await logToServer('response not ok');
            throw new Error(`Failed to register token with backend: ${response.statusText}`);
        }

        const resp = await response.json();
        console.log('resp', resp);
        await logToServer(`response ok,${resp}`);
        await logToServer('we did itt');

        console.log('Push notification token registered successfully:', token);
        return token;
    } catch (error) {
        await logToServer(`got error somewhere,${error}`);
        Alert.alert('error', error instanceof Error ? error.message : String(error));
        console.error('Error registering for push notifications:', error);
        return undefined;
    }
}

export async function removePushTokenAsync(username: string): Promise<void> {
    await logToServer(`calling remove username, ${username}`);

    try {
        console.log('Removing push notification token...');
        await logToServer('Removing push notification token...');

        const token = await AsyncStorage.getItem('expoPushToken');
        await logToServer(`here is the token,${token}`);

        if (token) {
            await logToServer(`we have a token so lets remove,${token}`);
            const apiToken = await checkToken();

            const response = await fetch('https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/notification/removeToken', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${apiToken}`},
                body: JSON.stringify({
                    username,
                    token
                } as TokenRegistration),
            });

            if (!response.ok) {
                await logToServer('response not ok');
                throw new Error(`Failed to remove token from backend: ${response.statusText}`);
            }
            await logToServer('response ok');

            console.log('Push notification token removed successfully:', token);
            await logToServer('remove from async');
        }
        await logToServer('remove from async2');
        await AsyncStorage.removeItem('expoPushToken');
    } catch (error) {
        await logToServer(`error somewhere along the way in removing, ${error}`);
        console.error('Error removing push token:', error);
    }
}