import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { useUserContext } from '../../../UserContext';
//@ts-ignore
import strava from '../../../assets/strava.png';

interface ConnectExProps {
    text: string;
}

const LOGGING_URL = 'http://localhost:3000/log';

async function logToServer(message: string): Promise<void> {
    console.log(`message: ${message}`);
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

const discovery = {
    authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
    tokenEndpoint: 'https://www.strava.com/oauth/token',
    revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
};

const ConnectEx: React.FC<ConnectExProps> = ({ text }) => {
    const { user, setUser } = useUserContext();
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [revokeLoading, setRevokeLoading] = useState<boolean>(false);

    const client_id = '111319';
    const client_secret = 'b03bfa9b476ff3e1536d632e33224d6b23f0f506';

    const redirectUri = makeRedirectUri({
        //@ts-ignore
        useProxy: true,
        native: 'com.airborm.bindly://redirect',
    });

    console.log('redirectUri:', redirectUri);
    logToServer(`redirectUri: ${redirectUri}`);

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.stravaImage}>
                        <Text style={{ color: 'white', fontSize: 20, margin: 'auto' }}>?</Text>
                    </View>
                </View>
                <Text style={{ fontSize: 20, marginRight: 20 }}>{'->'}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 5,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        justifyContent: 'space-between',
    },
    stravaImage: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: 'dodgerblue'
    }
});

export default ConnectEx;