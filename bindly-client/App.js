import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Nav from './Nav';
import { UserProvider } from './UserContext';
import { GroupsProvider } from './screens/GroupsContext';

export default function App() {
  return (
    <UserProvider>
        <View style={styles.container}>
          <Nav style={{ flex: 1 }}></Nav>
          {/* <Text>sfsfsf</Text> */}
        </View>
    </UserProvider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center', // This will center the content vertically
  }
});
