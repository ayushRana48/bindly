import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Nav from './Nav';
import { UserProvider } from './UserContext';
import { GroupsProvider } from './screens/GroupsContext';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider publishableKey="pk_test_51PVKUSBgzlfK4h49cQZCpiH223xzj1SoQe769PZ9Yf2t1QQHHsTKmeKo2ILzdxd28dlNHe9WvrXFl3HVVWNKIOCf00gMDy1qdb">

    <UserProvider>
        <View style={styles.container}>
          <Nav style={{ flex: 1 }}></Nav>
          {/* <Text>sfsfsf</Text> */}
        </View>
    </UserProvider>
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
