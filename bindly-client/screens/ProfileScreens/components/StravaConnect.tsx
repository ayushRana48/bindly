import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { makeRedirectUri, useAuthRequest, exchangeCodeAsync } from 'expo-auth-session';
import { useUserContext } from '../../../UserContext';
//@ts-ignore
import strava from '../../../assets/strava.png';
import { checkToken } from '../../../utils/checkToken';

interface StravaDiscovery {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revocationEndpoint: string;
}


const LOGGING_URL = 'https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/log';

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

const discovery: StravaDiscovery = {
  authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
  tokenEndpoint: 'https://www.strava.com/oauth/token',
  revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
};

const StravaConnect: React.FC = () => {
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

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: client_id,
      scopes: ['activity:read_all'],
      redirectUri: redirectUri,
      //@ts-ignore
      prompt: 'login',
    },
    discovery
  );

  const revokeStrava = async (): Promise<void> => {
    if (!user?.stravarefresh) return;

    setRevokeLoading(true);

    try {
      const token = await checkToken();
      const revokeResponse = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/strava/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
        body: JSON.stringify({
          username: user.username,
          refresh: user.stravarefresh,
        }),
      });

      if (revokeResponse.ok) {
        setUser(u => u ? ({ ...u, stravarefresh: undefined }) : null);
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
    const fetchToken = async (code: string): Promise<void> => {
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

        if (tokenResponse.refreshToken && user) {
          const token = await checkToken();
          const saveResponse = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/strava/addRefresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
            body: JSON.stringify({
              username: user.username,
              refresh: tokenResponse.refreshToken,
            }),
          });

          if (saveResponse.ok) {
            setUser(u => u ? ({ ...u, stravarefresh: tokenResponse.refreshToken }) : null);
          }
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    if (response?.type === 'success' && response.params.code) {
      fetchToken(response.params.code);
    }
  }, [response, user]);

  const pressConnect = (): void => {
    if (!user?.stravarefresh) {
      promptAsync();
    }
  };

  // Rest of the component remains the same, just adding type annotations to the styles
  return (
    <Pressable onPress={pressConnect} style={styles.container}>
      {!user?.stravarefresh && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image style={styles.stravaImage} source={strava} />
            <Text style={{ marginLeft: 10 }}>Strava</Text>
          </View>
          <Text style={{ fontSize: 20, marginRight: 20 }}>{'->'}</Text>
        </View>
      )}

      {user?.stravarefresh && (
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ justifyContent: 'center' }}>
            <Image style={styles.stravaImage} source={strava} />
            <Text style={{ marginHorizontal: 'auto' }}>Strava</Text>
          </View>
          <Text style={{ fontSize: 20, marginLeft: 20 }}>Connected</Text>
          <Pressable onPress={() => setOpenModal(true)} style={styles.revokeButton}>
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
              <Pressable style={styles.confirmButton} onPress={revokeStrava}>
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

// Styles remain the same
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