import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, Pressable, FlatList, ActivityIndicator,Alert } from 'react-native';
import { useUserContext } from '../../../UserContext';
import { BASEROOT_URL } from "@env";

const DepositMoney = ({ cards }) => {
    const [isAddMoneyModalVisible, setAddMoneyModalVisible] = useState(false);
    const [amount, setAmount] = useState('');
    const { user, setUser } = useUserContext();
    const [error, setError] = useState('');
    const [selectedCard, setSelectedCard] = useState();
    const [selectCardScreen, setSelectCardScreen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(cards && cards?.length>0 && cards[0]){
            setSelectedCard(cards[0]);
        }
    }, [cards]);

    const handleAddMoney = () => {
        if(cards.length==0){
            Alert.alert('add card')
            return
        }
        setLoading(true);
        if (!amount) {
            setError('Please enter a valid amount within your balance and select a payment method.');
            setLoading(false);
            return;
        }

        setError('');
        fetch(`${BASEROOT_URL}/bindly/stripe/addMoney`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId: user.stripeid,
                amount,
                cardId: selectedCard.id,
                username: user.username,
            }),
        })
            .then(response => response.json())
            .then(data => {
                setUser(u => ({ ...u, balance: parseFloat(u.balance) + parseFloat(amount) }));
                setLoading(false);
                setAddMoneyModalVisible(false);
                setAmount('');
            })
            .catch(error => {
                setLoading(false);
                setAmount('');
                console.error('Error adding money:', error);
            });
    };

    const openModal = () => {
        if (!user.stripeid && cards.length == 0) {
            Alert.alert('Add Card first');
            return;
        } else {
            setAddMoneyModalVisible(true);
        }
    };

    const selectCard = card => {
        setSelectedCard(card);
        setSelectCardScreen(false);
    };

    const renderCard = ({ item }) => (
        <Pressable style={styles.cardContainer} onPress={() => selectCard(item)}>
            <Text style={styles.cardBrand}>{item.card.brand}</Text>
            <Text style={styles.cardLast4}>**** {item.card.last4}</Text>
        </Pressable>
    );

    return (
        <View style={{ padding: 20 }}>
            <Pressable style={styles.button} onPress={openModal}>
                <Text style={styles.buttonText}>Add Money</Text>
            </Pressable>
            <Modal
                visible={isAddMoneyModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setAddMoneyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {!selectCardScreen ? (
                            <>
                                <Text style={styles.modalTitle}>{'Bank -> Bindly'}</Text>
                                <Text style={styles.modalTitle}>Enter amount to deposit:</Text>
                                <View style={styles.amountInputContainer}>
                                    <Text style={styles.dollarSign}>$</Text>
                                    <TextInput
                                        placeholder="Amount"
                                        onChangeText={setAmount}
                                        value={amount}
                                        keyboardType="numeric"
                                        style={styles.input}
                                    />
                                </View>
                                {selectedCard && (
                                    <Pressable
                                        onPress={() => setSelectCardScreen(true)}
                                        style={styles.cardSelection}
                                    >
                                        <Text>{selectedCard?.card?.brand}</Text>
                                        <Text> **** {selectedCard?.card?.last4}</Text>
                                        <Text style={styles.arrow}>→</Text>
                                    </Pressable>
                                )}
                                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                                <View style={styles.buttonContainer}>
                                    <Pressable style={[styles.button, styles.buttonConfirm]} onPress={handleAddMoney}>
                                        {loading ? <ActivityIndicator color={'white'} /> : <Text style={styles.buttonText}>Confirm</Text>}
                                    </Pressable>
                                    <Pressable style={[styles.button, styles.buttonCancel]} onPress={() => setAddMoneyModalVisible(false)}>
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </Pressable>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.selectPaymentMethod}>Select Payment Method</Text>
                                {cards.length > 0 ? (
                                    <FlatList
                                        data={cards}
                                        keyExtractor={item => item.id}
                                        renderItem={renderCard}
                                    />
                                ) : (
                                    <Text>No card saved</Text>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingLeft: 10,
        borderRadius: 10,
        flex: 1,
    },
    dollarSign: {
        fontSize: 28,
        color: 'black',
        textAlignVertical: 'center',
        margin: 'auto',
        fontWeight: '200',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    cardSelection: {
        marginBottom: 20,
        flexDirection: 'row',
        width: '90%',
        height: 30,
        backgroundColor: 'white',
        alignItems: 'center',
        borderColor: 'lightgray',
        borderTopWidth: 1,
    },
    arrow: {
        marginLeft: 'auto',
        marginRight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    buttonConfirm: {
        backgroundColor: '#2196F3',
    },
    buttonCancel: {
        backgroundColor: '#f44336',
    },
    selectPaymentMethod: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
    },
    cardContainer: {
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 5,
        borderBottomColor: 'lightgray',
        borderBottomWidth: 0.5,
        elevation: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    cardBrand: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardLast4: {
        fontSize: 16,
        marginVertical: 5,
    },
});

export default DepositMoney;
