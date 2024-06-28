import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Modal, Pressable, ActivityIndicator } from 'react-native';
import { useUserContext } from '../../../UserContext';
import { useNavigation } from '@react-navigation/native';
import { BASEROOT_URL } from "@env";

const TransferMoney = () => {
    const [isTransferMoneyModalVisible, setTransferMoneyModalVisible] = useState(false);
    const { user, setUser } = useUserContext();
    const [isVenmo, setIsVenmo] = useState(false);
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false)

    const handleWithdrawMoney = () => {
        console.log('call')
        console.log(email)
        console.log(confirmEmail)
        // Validate email format
        if (loading) {
            return
        }
        setLoading(true)
        // Validate amount is not null and within balance
        if (!amount || parseFloat(amount) > user.balance) {
            setError('Please enter a valid amount within your balance.');
            setLoading(false)
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        console.log(!emailRegex.test(email))
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            setLoading(false)
            return;
        }

        // Validate emails match
        console.log(email)
        console.log(confirmEmail)

        if (email !== confirmEmail) {
            setError('Emails do not match.');
            setLoading(false)

            return;
        }


        setError('');

        fetch(`${BASEROOT_URL}/bindly/paypal/payout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.username,
                recipient_email: email,
                is_venmo: isVenmo,
                amount: amount
            }),
        })
            .then(response => response.json())
            .then(data => {
                setTransferMoneyModalVisible(false);
                setUser(u => ({ ...u, balance: parseFloat(u.balance) - parseFloat(amount) }));
                setLoading(false)

            })
            .catch(error => {
                setLoading(false)
                console.error('Error withdrawing money:', error)
            });
    };

    return (
        <View style={{ padding: 20 }}>
            <Pressable style={styles.button} onPress={() => setTransferMoneyModalVisible(true)}>
                <Text style={styles.buttonText}>Transfer Money</Text>
            </Pressable>
            <Modal
                visible={isTransferMoneyModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setTransferMoneyModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Transfer Money</Text>

                        <Text style={styles.balanceText}>Current Balance: ${user.balance}</Text>

                        <Text style={styles.modalText}>Select Transfer Method:</Text>
                        <View style={styles.buttonContainer}>
                            <Pressable
                                style={[styles.methodButton, !isVenmo && styles.selectedButton]}
                                onPress={() => setIsVenmo(false)}
                            >
                                <Text style={styles.buttonText}>PayPal</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.methodButton, isVenmo && styles.selectedButton]}
                                onPress={() => setIsVenmo(true)}
                            >
                                <Text style={styles.buttonText}>Venmo</Text>
                            </Pressable>
                        </View>

                        <Text style={styles.modalText}>Enter Amount to Transfer:</Text>
                        <View style={styles.amountInputContainer}>
                            <View style={{ height: 40, textAlign: 'center' }}><Text style={styles.dollarSign}>$</Text></View>
                            <TextInput
                                placeholder="Amount"
                                onChangeText={text => setAmount(text.replace(/[^0-9]/g, ''))}
                                value={amount}
                                keyboardType="numeric"
                                style={styles.input}
                            />
                        </View>

                        <Text style={styles.modalText}>Enter Email Associated with Account:</Text>
                        <View style={{ ...styles.amountInputContainer, marginBottom: 10 }}>
                            <TextInput
                                placeholder="Email"
                                onChangeText={setEmail}
                                value={email}
                                keyboardType="email-address"
                                style={styles.input}
                            />
                        </View>

                        <Text>Confirm Email:</Text>
                        <View style={styles.amountInputContainer}>
                            <TextInput
                                placeholder="Confirm Email"
                                onChangeText={setConfirmEmail}
                                value={confirmEmail}
                                keyboardType="email-address"
                                style={styles.input}
                            />
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <View style={styles.buttonContainer}>
                            <Pressable
                                style={[styles.button, styles.buttonConfirm]}
                                onPress={handleWithdrawMoney}
                            >
                               {loading? <ActivityIndicator color={'white'}></ActivityIndicator> :<Text style={styles.buttonText}>Confirm</Text>}
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.buttonCancel]}
                                onPress={() => setTransferMoneyModalVisible(false)}
                            >
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
        paddingLeft: 10,
        borderRadius: 10,
        flex: 1,
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
    modalText: {
        fontSize: 16,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
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
    methodButton: {
        flex: 1,
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        marginHorizontal: 5,
        backgroundColor: '#ddd',
    },
    selectedButton: {
        backgroundColor: '#2196F3',
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 30,
    },
    dollarSign: {
        fontSize: 28,
        color: 'black',
        fontWeight: '200',
    },
    balanceText: {
        fontSize: 20,
        color: '#888',
        marginBottom: 20,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
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

export default TransferMoney;
