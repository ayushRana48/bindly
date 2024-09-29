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

const StravaConnect = () => {
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

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: client_id,
      scopes: ['activity:read_all'],
      redirectUri: redirectUri,
      prompt: 'login',
    },
    discovery
  );

  const revokeStrava = async () => {
    if (!user.stravarefresh) return;

    setRevokeLoading(true);

    try {
      const revokeResponse = await fetch(`${BASEROOT_URL}/bindly/strava/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          refresh: user.stravarefresh,
        }),
      });

      if (revokeResponse.ok) {
        setUser(u => ({ ...u, stravarefresh: null }));
        setOpenModal(false);
      } else {
        console.error('Error revoking Strava access');
      }
    } catch (error) {
      console.error('Error revoking Strava:', error);
    } finally {
      setRevokeLoading(false);
    }
  };

  useEffect(() => {
    console.log(user)
    console.log(user.stravarefresh)

  }, [user])

  // Handle response and token exchange
  useEffect(() => {
    const fetchToken = async (code) => {
      try {
        const tokenResponse = await exchangeCodeAsync(
          {
            clientId: client_id,
            redirectUri: redirectUri,
            code: code,
            extraParams: {
              client_secret: client_secret,
            },
          },
          { tokenEndpoint: 'https://www.strava.com/oauth/token' }
        );

        console.log('Token Response:', tokenResponse);

        if (tokenResponse.refreshToken) {
          const saveResponse = await fetch(`${BASEROOT_URL}/bindly/strava/addRefresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: user.username,
              refresh: tokenResponse.refreshToken,
            }),
          });

          if (saveResponse.ok) {
            setUser(u => ({ ...u, stravarefresh: tokenResponse.refreshToken }));
          }
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    logToServer(`Response: ${JSON.stringify(response)}`);

    if (response?.type === 'success') {
      const { code } = response.params;
      console.log('Authorization Code:', code);
      logToServer(`Authorization Code: ${code}`);
      fetchToken(code);
    }
  }, [response]);

  const pressConnect = () => {
    console.log('callll')
    if (!user.stravarefresh) {
      promptAsync();
    }
  };

  const openRevokeModal = () => {
    setOpenModal(true);
  };

  const confirmRevoke = () => {
    revokeStrava();
  };

  return (
    <Pressable onPress={pressConnect} style={styles.container}>

      {!user.stravarefresh && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image style={styles.stravaImage} source={strava} />
            <Text style={{ marginLeft: 10 }}>Strava</Text>
          </View>
          <Text style={{ fontSize: 20, marginRight:20 }}>{'->'}</Text>
        </View>
      )}


      {user.stravarefresh && (
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', }}>
          <View style={{ justifyContent: 'center', }}>
            <Image style={styles.stravaImage} source={strava} />
            <Text style={{ marginHorizontal: 'auto' }}>Strava</Text>
          </View>
          <Text style={{ fontSize: 20, marginLeft: 20 }}>Connected</Text>
          <Pressable
            onPress={openRevokeModal}
            style={styles.revokeButton}
          >
            <Text style={styles.revokeButtonText}>X</Text>
          </Pressable>
        </View>
      )}


      <Modal
        transparent={true}
        visible={openModal}
        animationType="slide"
        onRequestClose={() => setOpenModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Remove Strava Account?</Text>
            <View style={styles.modalButtons}>
              <Pressable style={styles.confirmButton} onPress={confirmRevoke}>
                {revokeLoading ? <ActivityIndicator color={'white'} /> : <Text style={styles.buttonText}>Confirm</Text>}
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={() => setOpenModal(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Pressable>
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

export default StravaConnect;
