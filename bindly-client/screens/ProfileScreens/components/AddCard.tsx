import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet, FlatList, Text, Modal, Pressable, ActivityIndicator } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useUserContext } from '../../../UserContext';
import { StripeCard, User } from '../../../types';
import { checkToken } from '../../../utils/checkToken';

interface AddCardProps {
    setCards: React.Dispatch<React.SetStateAction<StripeCard[]>>;
    cards: StripeCard[];
}

interface PaymentSheetParams {
    setupIntent: string;
    ephemeralKey: string;
    customer: string;
    account?: string;
}

const AddCard: React.FC<AddCardProps> = ({ setCards: setCards2, cards: cards2 }) => {
    const { user, setUser } = useUserContext();
    const { initPaymentSheet, presentPaymentSheet, confirmPaymentSheetPayment } = useStripe();
    const [loading, setLoading] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [cardToDelete, setCardToDelete] = useState<string | null>(null);
    const [loadingRemove, setLoadingRemove] = useState<boolean>(false);

    const fetchPaymentSheetParams = async (): Promise<PaymentSheetParams> => {
        const token = await checkToken();
        const response = await fetch(`http://localhost:3000/bindly/stripe/saveCard`, {
            method: 'POST',
            body: JSON.stringify({ email: user?.email }),
            headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
        });
        return response.json();
    };

    const initialisePaymentSheet = async (): Promise<string | null> => {
        setLoading(true);
        try {
            const { setupIntent, ephemeralKey, customer } = await fetchPaymentSheetParams();
            
            const { error } = await initPaymentSheet({
                customerId: customer,
                customerEphemeralKeySecret: ephemeralKey,
                setupIntentClientSecret: setupIntent,
                merchantDisplayName: 'Bindly Inc.',
                allowsDelayedPaymentMethods: false,
                returnURL: 'stripe-example://stripe-redirect',
            });

            if (error) {
                Alert.alert(`Error code: ${error.code}`, error.message);
                return null;
            }

            console.log('setupIntent, ephemeralKey, customer ',setupIntent, ephemeralKey, customer )

            setUser(prevUser => prevUser ? { ...prevUser, stripeid: customer } : null);
            setIsInitialized(true);
            return customer;
        } catch (error) {
            console.error('Payment sheet initialization error:', error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleBuyPress = async (): Promise<void> => {
        if (cards2?.length >= 3) return;

        try {
            let customerId = user?.stripeid;

            if (!isInitialized || !customerId) {
                const newCustomerId = await initialisePaymentSheet();
                if (!newCustomerId) {
                    throw new Error('Failed to initialize payment sheet');
                }
                console.log('newCustomerId ', newCustomerId)
                customerId = newCustomerId;
            }

            const { error } = await presentPaymentSheet();
            if (error) {
                Alert.alert(`Error code: ${error.code}`, error.message);
                return;
            }

            await confirmPaymentSheetPayment();
            const token = await checkToken();
            const response = await fetch(`http://localhost:3000/bindly/stripe/getSavedCards/${customerId}`,{
                headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
            });
            const data = await response.json();
            
            if (JSON.stringify(cards2) !== JSON.stringify(data.data)) {
                setCards2(data.data);
            }
            
            setIsInitialized(false);
        } catch (error) {
            console.error('Error in handleBuyPress:', error);
            Alert.alert('Error', 'Failed to process payment setup');
        }
    };

    const handleRemoveCard = (cardId: string): void => {
        setCardToDelete(cardId);
        setModalVisible(true);
    };

    const confirmRemoveCard = async (): Promise<void> => {
        if (loadingRemove || !user?.stripeid || !cardToDelete) return;
        
        setLoadingRemove(true);
        try {
            const token = await checkToken();
            const response = await fetch(`http://localhost:3000/bindly/stripe/detachOldPaymentMethods`, {
                method: 'POST',
                body: JSON.stringify({ 
                    customerId: user.stripeid, 
                    cardId: cardToDelete 
                }),
                headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
            });
            
            const data = await response.json();
            if (data.success) {
                setCards2(cards2.filter(card => card.id !== cardToDelete));
                setCardToDelete(null);
                setModalVisible(false);
                Alert.alert('Success', 'The card was removed successfully');
            } else {
                Alert.alert('Error', 'There was an error removing the card');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to remove card');
        } finally {
            setLoadingRemove(false);
        }
    };

    const renderCard = ({ item }: { item: StripeCard }): React.ReactElement => (
        <View style={styles.cardContainer}>
            <Text style={styles.cardBrand}>{item.card.brand}</Text>
            <Text style={styles.cardLast4}>**** **** **** {item.card.last4}</Text>
            <Pressable onPress={() => handleRemoveCard(item.id)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>X</Text>
            </Pressable>
        </View>
    );


    return (
        <View style={{ padding: 20 }}>
            <View style={{borderColor:'black', borderBottomWidth:1}}>
            <Text style={{fontSize:20,fontWeight:'600'}}>Payment Methods</Text>
            </View>
            <View style={{marginTop:10,marginBottom:16}}>
            {cards2?.length > 0 ? (
                <FlatList
                    data={cards2}
                    keyExtractor={item => item.id}
                    renderItem={renderCard}
                />
            ) : (
                <Text>No card saved</Text>
            )}
            </View>
          
            <Pressable style={styles.button} onPress={handleBuyPress}>
                <Text style={styles.buttonText}>{loading ? 'Loading...' : cards2?.length >= 3 ? 'Maximum cards added' : 'Set up payment method'}</Text>
            </Pressable>
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Remove Card</Text>
                        <Text>Are you sure you want to remove this card?</Text>
                        <View style={styles.buttonContainer}>
                            <Pressable style={[styles.button, styles.buttonConfirm]} onPress={confirmRemoveCard}>
                                {loadingRemove ? <ActivityIndicator color={'white'} /> : <Text style={styles.buttonText}>Confirm</Text>}
                            </Pressable>
                            <Pressable style={[styles.button, styles.buttonCancel]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
        width: '80%',
    },
    cardField: {
        height: 50,
        marginVertical: 30,
        width: '80%',
    },
    cardContainer: {
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardBrand: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardLast4: {
        fontSize: 16,
        marginVertical: 5,
    },
    cardExp: {
        fontSize: 14,
        color: '#888',
    },
    removeButton: {
        backgroundColor: 'red',
        borderRadius: 20,
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
   
    buttonConfirm: {
        backgroundColor: '#2196F3',
    },
    buttonCancel: {
        backgroundColor: '#f44336',
    },
    button: {
        backgroundColor: '#2196F3',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddCard;