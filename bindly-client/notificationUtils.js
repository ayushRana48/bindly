import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const LOGGING_URL = 'https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/log';

async function logToServer(message) {
    try {
        await fetch(LOGGING_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ logData: message }),
        });
    } catch (error) {
        console.error('Error logging to server:', error);
    }
}


export async function registerForPushNotificationsAsync(username) {
    try {
        await logToServer(`We are calling Register, username here, ${username}`)

        // Check if a token is already stored in AsyncStorage
        const storedToken = await AsyncStorage.getItem('expoPushToken');
        if (storedToken) {
            // Token already exists, no need to request permissions again
            console.log('Push notification token already exists:', storedToken);
            await logToServer(`Push notification token already exists:, ${storedToken}`)
        }

        console.log('storedToke',storedToken)

        // Get existing notification permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        console.log(existingStatus,'existingg stattus')
        await logToServer(`${existingStatus},existingg stattus`)

        // Request permissions if they have not been granted already
        // if (existingStatus !== 'granted') {
        console.log('LLOOLKJF:LKSAJF:LISJ HEEREEE')
        await logToServer('About to get status')

            const { status } = await Notifications.requestPermissionsAsync();
            console.log(status,'the stattus')
            finalStatus = status;
        // }

        await logToServer(`Here is the status,${status}`)

        // If permissions are still not granted, show an alert and return
        if (finalStatus !== 'granted') {
            return;
        }

        await logToServer('status granted')

        // Get the push token
        const token = (await Notifications.getExpoPushTokenAsync({
            projectId: '2fbbe1b1-62f4-47a4-91de-b96b0020b8fe', // Replace with your actual project ID
        })).data;

        await logToServer(`got the token ${token}`)


        console.log('token',token)

        // Store the token in AsyncStorage
        await AsyncStorage.setItem('expoPushToken', token);
        await logToServer('set to asycn')


        // Send the token to the backend
        console.log('Registering push notification token with backend...');
        await logToServer('Registering push notification token with backend...')



        const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/notification/registerToken`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                token: token
            }),
        });

        if (!response.ok) {
            await logToServer('response not ok')

            throw new Error(`Failed to register token with backend: ${response.statusText}`);
        }

        const resp = await response.json()
        console.log('resp',resp)
        await logToServer(`response oj,${resp}`)

        await logToServer('we did itt')


        console.log('Push notification token registered successfully:', token);
        return token;
    } catch (error) {
        await logToServer(`got error somewhere,${error}`)
        Alert.alert('error',error)


        console.error('Error registering for push notifications:', error);
    }
}

export async function removePushTokenAsync(username) {
    await logToServer(`calling rmeove usernmae, ${username}`)


    try {
        console.log('Removing push notification token...');
        await logToServer('Removing push notification token...')


        const token = await AsyncStorage.getItem('expoPushToken');

        await logToServer(`here is the token,${token}`)

        if (token) {

            await  logToServer(`we have a token so lets remove,${token}`)

            const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/notification/removeToken`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    token: token
                }),
            });

            if (!response.ok) {
                await logToServer('response not  ok')

                throw new Error(`Failed to remove token from backend: ${response.statusText}`);
            }
            await logToServer('response ok')



            console.log('Push notification token removed successfully:', token);
            await logToServer('resmove from async')

            await AsyncStorage.removeItem('expoPushToken');
        }
        await logToServer('resmove from async2')

        await AsyncStorage.removeItem('expoPushToken');
    } catch (error) {


        await logToServer(`error somewhere along the way in removing, ${error}`)

        console.error('Error removing push token:', error);
    }
}
