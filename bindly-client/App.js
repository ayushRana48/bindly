import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Nav from './Nav';
import { UserProvider } from './UserContext';
import { GroupsProvider } from './screens/GroupsContext';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider publishableKey="pk_live_51PQrx6RvCrhldyScNOVzgM88JBTEHj3RKUm0W1O4k1nRF9yR4pQiYRut6jg3VSmItdPTqAiICw45il9hyW6WuzUI00Fxsb1BXB">

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
