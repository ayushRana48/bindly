import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserContext } from '../../UserContext';
//@ts-ignore
import backArrow from '../../assets/backArrow.png';
import AddCard from './components/AddCard';
import DepositMoney from './components/DepositMoney';
import TransferMoney from './components/TransferMoney';
import { StripeCard, RootStackParamList } from '../../types';
import { checkToken } from '../../utils/checkToken';

interface CardsResponse {
    data: StripeCard[];
}

const WalletScreen: React.FC = () => {
    const [cards, setCards] = useState<StripeCard[]>([]);    
    const { user } = useUserContext();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchCards = async () => {
            if (user?.stripeid) {
                setLoading(true);
                const token = await checkToken();
                try {
                    const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/stripe/getSavedCards/${user.stripeid}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                    });
                    const data = await response.json() as CardsResponse;
                    setCards(data.data);
                } catch (error) {
                    console.error('Error fetching cards:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
    
        fetchCards();
    }, [user]);

    const back = (): void => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.backArrow} onPress={back}>
                <Image style={styles.backArrowImage} source={backArrow} />
            </Pressable>
            <Text style={styles.title}>Wallet</Text>
            {loading ? <ActivityIndicator /> 
                : <>
                    <View style={{ paddingHorizontal: 20 }}>
                        <View style={{ borderColor: 'black', borderBottomWidth: 0.5 }}>
                            <Text style={{ fontSize: 20, fontWeight: '600' }}>Balance</Text>
                        </View>
                        <Text style={styles.balance}>${user?.balance.toFixed(2)}</Text>
                    </View>
                    <AddCard setCards={setCards} cards={cards}/>
                    <View style={{ paddingHorizontal: 20 }}>
                        <View style={{ borderColor: 'black', borderBottomWidth: 0.5 }}>
                            <Text style={{ fontSize: 20, fontWeight: '600' }}>Balance</Text>
                        </View>
                    </View>

                    <DepositMoney cards={cards} />
                    <TransferMoney />
                </>
            }
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
        zIndex: 10,
    },
    backArrowImage: {
        height: 40,
        width: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 60,
        marginBottom: 10
    },
    balance: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default WalletScreen;