import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { makeRedirectUri, useAuthRequest, exchangeCodeAsync } from 'expo-auth-session';
import { useUserContext } from '../../../UserContext';
import strava from '../../../assets/strava.png';
import { BASEROOT_URL } from "@env";

const LOGGING_URL = 'https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/log';

async function logToServer(message) {
  console.log(`message:  ${message}`);
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

// Strava OAuth endpoints
const discovery = {
  authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
  tokenEndpoint: 'https://www.strava.com/oauth/token',
  revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
};

const ConnectEx = ({ text }) => {
  const { user, setUser } = useUserContext();
  const [openModal, setOpenModal] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);

  // Replace with your Strava client ID and secret
  const client_id = '111319';
  const client_secret = 'b03bfa9b476ff3e1536d632e33224d6b23f0f506';

  const redirectUri = makeRedirectUri({
    useProxy: true,
    native: 'com.airborm.bindly://redirect',
  });

  console.log('redirectUri:', redirectUri);
  logToServer(`redirectUri: ${redirectUri}`);




  return (
    <View style={styles.container}>


      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.stravaImage} >
            <Text style={{color:'white',fontSize:20, margin:'auto'}}>?</Text>
          </View>
        </View>
        <Text style={{ fontSize: 20, marginRight:20 }}>{'->'}</Text>
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
  stravaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stravaImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor:'dodgerblue'
  },
  revokeButton: {
    backgroundColor: 'red',
    marginLeft: 'auto',
    marginRight: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  revokeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: 'dodgerblue',
    padding: 15,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff7e75',
    padding: 15,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ConnectEx;
