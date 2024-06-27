import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet, FlatList, Text, Modal, Pressable, ActivityIndicator } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useUserContext } from '../../../UserContext';

const AddCard = ({ setCards: setCards2 }) => {
    const { user, setUser } = useUserContext();
    const { initPaymentSheet, presentPaymentSheet, confirmPaymentSheetPayment } = useStripe();
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [cards, setCards] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [loadingRemove, setLoadingRemove] = useState(false);

    useEffect(() => {
        console.log(user.stripeid,'in the useEffect')
        if (user && user.stripeid) {
            getCards(user.stripeid);
        }
    }, []);

    const getCards = async (customer) => {
        if(customer){
        try {
            const response = await fetch(`http://localhost:3000/bindly/stripe/getSavedCards/${user.stripeid}`);
            const data = await response.json();
            setCards(data.data);
            setCards2(data.data);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    }

    };

    const initialisePaymentSheet = async () => {
        setLoading(true);
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
        } else {
            setUser(prevUser => ({ ...prevUser, stripeid: customer }));
            setIsInitialized(true);
        }
        setLoading(false);
        return customer
    };

    const fetchPaymentSheetParams = async () => {
        const response = await fetch(`http://localhost:3000/bindly/stripe/saveCard`, {
            method: 'POST',
            body: JSON.stringify({ email: user.email }),
            headers: { 'Content-Type': 'application/json' },
        });
        const { setupIntent, ephemeralKey, customer, account } = await response.json();
        return { setupIntent, ephemeralKey, customer, account };
    };

    const handleBuyPress = async () => {
        let customer
        if (!isInitialized) {
            customer = await initialisePaymentSheet();
        }

        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert(`Error code: ${error.code}`, error.message);
        } else {
            await confirmPaymentSheetPayment();
            try {
                console.log('customer in buy press',customer)
                const response = await fetch(`http://localhost:3000/bindly/stripe/getSavedCards/${customer}`);
                const data = await response.json();
                setCards(data.data);
                setCards2(data.data);
            } catch (error) {
                console.error('Error fetching cards:', error);
            }
            Alert.alert('Success', 'The payment method was setup successfully');
            setIsInitialized(false);
            
        }
    };

    const handleRemoveCard = (cardId) => {
        setCardToDelete(cardId);
        setModalVisible(true);
    };

    const confirmRemoveCard = async () => {
        if (loadingRemove) {
            return;
        }
        setLoadingRemove(true);

        const response = await fetch(`http://localhost:3000/bindly/stripe/detachOldPaymentMethods`, {
            method: 'POST',
            body: JSON.stringify({ customerId: user.stripeid, cardId: cardToDelete }),
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (data.success) {
            const updatedCards = cards.filter(card => card.id !== cardToDelete);
            setCards(updatedCards);
            setCards2(updatedCards);
            setCardToDelete(null);
            setModalVisible(false);
            setLoadingRemove(false);
            Alert.alert('Success', 'The card was removed successfully');
        } else {
            setLoadingRemove(false);
            Alert.alert('Error', 'There was an error removing the card');
        }
    };

    const renderCard = ({ item }) => (
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
            {cards?.length > 0 ? (
                <FlatList
                    data={cards}
                    keyExtractor={item => item.id}
                    renderItem={renderCard}
                />
            ) : (
                <Text>No card saved</Text>
            )}
            </View>
          
            <Pressable style={styles.button} onPress={handleBuyPress}>
                <Text style={styles.buttonText}>{loading ? 'Loading...' : cards?.length >= 3 ? 'Maximum cards added' : 'Set up payment method'}</Text>
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
    button: {
        flex: 1,
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        marginHorizontal: 5,
    },
    buttonConfirm: {
        backgroundColor: '#2196F3',
    },
    buttonCancel: {
        backgroundColor: '#f44336',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
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
