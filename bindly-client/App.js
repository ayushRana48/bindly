import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import Nav from './Nav';
import { UserProvider } from './UserContext';
import { GroupsProvider } from './screens/GroupsContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <StripeProvider publishableKey="pk_live_51PVKUSBgzlfK4h49kPSJUjXeCtABCsHdbS47j3lLCYIFPS51Zd2OZCpbrjWCOsEMiCXegHjXoqe5mBJzpmLSnAmc00Q5AwMFo2">
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>

          <UserProvider>
              <View style={styles.container}>
                <Nav style={{ flex: 1 }} />
              </View>

          </UserProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>

    </StripeProvider>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center', // This will center the content vertically
  }
});
