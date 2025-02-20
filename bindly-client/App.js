import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import Nav from './Nav';
import { UserProvider } from './UserContext';
import { GroupsProvider } from './screens/GroupsContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Linking, Alert } from "react-native";
import { useEffect } from 'react';


const handleDeepLink = (event) => {
  const { url } = event;
  console.log("Deep Link Opened: ", url);

  if (url.includes("bindly://payment")) {
    Alert.alert("Payment Successful!", "Venmo payment detected. Updating balance...");
    // TODO: Mark the payment as completed in your database
  }
};

export default function App() {

  useEffect(() => {
    // Listen for deep links while the app is open
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle deep links if the app was **opened** from a link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <StripeProvider publishableKey="pk_test_51PVKUSBgzlfK4h49cQZCpiH223xzj1SoQe769PZ9Yf2t1QQHHsTKmeKo2ILzdxd28dlNHe9WvrXFl3HVVWNKIOCf00gMDy1qdb">
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
