import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from '../../UserContext';
import backArrow from '../../assets/backArrow.png';
import AddCard from './components/AddCard';
import DepositMoney from './components/DepositMoney';
import TransferMoney from './components/TransferMoney';

const WalletScreen = () => {
    const [cards, setCards] = useState([]);
    const { user } = useUserContext();
    const navigation = useNavigation();

    useEffect(() => {
        if (user && user.stripeid) {
            fetch(`http://localhost:3000/bindly/stripe/getSavedCards/${user.stripeid}`)
                .then(response => response.json())
                .then(data => setCards(data.data))
                .catch(error => console.error('Error fetching cards:', error));
        }
    }, [user]);

    const back = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.backArrow} onPress={back}>
                <Image style={styles.backArrowImage} source={backArrow} />
            </Pressable>
            <Text style={styles.title}>Wallet</Text>
            <View style={{paddingHorizontal:20}}>
                <View style={{borderColor:'black', borderBottomWidth:0.5}}>
                <Text style={{fontSize:20,fontWeight:'600'}}>Balance</Text>
                </View>
                <Text style={styles.balance}>${user.balance}</Text>
            </View>
            <AddCard setCards={setCards} />
            <View style={{paddingHorizontal:20}}>
                <View style={{borderColor:'black', borderBottomWidth:0.5}}>
                <Text style={{fontSize:20,fontWeight:'600'}}>Balance</Text>
                </View>
                </View>

                <DepositMoney cards={cards} />
                <TransferMoney />
           


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    backArrow: {
        position: 'absolute',
        top: 40,
        left: 30,
        zIndex:10,
    },
    backArrowImage: {
        height: 40,
        width: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop:60,
        marginBottom:10
    },
    balance:{
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default WalletScreen;
