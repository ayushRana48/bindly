import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert} from 'react-native';
import { useUserContext } from '../../../UserContext';
import { BASEROOT_URL } from "@env";

const TransferMoney = () => {
    const [isTransferMoneyModalVisible, setTransferMoneyModalVisible] = useState(false);
    const { user, setUser } = useUserContext();
    const [isVenmo, setIsVenmo] = useState(false);
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [confirmPhone, setConfirmPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleWithdrawMoney = () => {
        if (loading) return;

        setLoading(true);
        const amountNumber = parseFloat(amount);
        if (!amount || amountNumber > user.balance) {
            setError('Please enter a valid amount within your balance.');
            setLoading(false);
            return;
        }

        if (isVenmo) {
            const phoneRegex = /^\(\d{3}\)-\d{3}-\d{4}$/;
            if (!phoneRegex.test(phone)) {
                setError('Please enter a valid phone number.');
                setLoading(false);
                return;
            }

            if (phone !== confirmPhone) {
                setError('Phone numbers do not match.');
                setLoading(false);
                return;
            }
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Please enter a valid email address.');
                setLoading(false);
                return;
            }

            if (email !== confirmEmail) {
                setError('Emails do not match.');
                setLoading(false);
                return;
            }
        }

        setError('');
        fetch(`http://localhost:3000/bindly/paypal/payout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.username,
                recipient_email: isVenmo ? phone : email,
                is_venmo: isVenmo,
                amount: amountNumber,
            }),
        })
            .then(response => response.json())
            .then(data => {

                console.log({
                    user_id: user.username,
                    recipient_email: isVenmo ? phone : email,
                    is_venmo: isVenmo,
                    amount: amountNumber,
                })
                if (data.error) {
                    throw new Error(data.error.message || 'Error processing payout');
                }
                console.log('data', data, 'heree');
                setTransferMoneyModalVisible(false);
                setUser(u => ({ ...u, balance: u.balance - amountNumber }));
                Alert.alert('Transfer Pending', 'Should receive money in 2-5 minutes');
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                Alert.alert('Error withdrawing money', error.message || 'Unknown error');
                console.error('Error withdrawing money:', error);
            });
        setLoading(false)
        setTransferMoneyModalVisible(false);

    };

    const formatPhoneNumber = (value) => {
        const cleaned = ('' + value).replace(/\D/g, '').substring(0, 10);
        const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
        if (match) {
            return !match[2] ? match[1] : `(${match[1]})-${match[2]}${match[3] ? `-${match[3]}` : ''}`;
        }
        return value;
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
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.keyboardAvoidingView}
                        >
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Transfer Money</Text>

                                <Text style={styles.balanceText}>Current Balance: ${user.balance.toFixed(2)}</Text>

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
                                    <Text style={styles.dollarSign}>$</Text>
                                    <TextInput
                                        placeholder="Amount"
                                        onChangeText={text => setAmount(text.replace(/[^0-9.]/g, ''))}
                                        value={amount}
                                        keyboardType="numeric"
                                        style={styles.input}
                                    />
                                </View>

                                {isVenmo ? (
                                    <>
                                        <Text style={{...styles.modalText,textAlign:'center'}}>Enter Phone Number Associated with Venmo:</Text>
                                        <View style={{...styles.amountInputContainer, marginBottom:10}}>
                                            <TextInput
                                                placeholder="Phone Number"
                                                onChangeText={text => setPhone(formatPhoneNumber(text))}
                                                value={phone}
                                                keyboardType="phone-pad"
                                                style={styles.input}
                                                maxLength={14}
                                            />
                                        </View>

                                        <Text style={styles.modalText}>Confirm Phone Number:</Text>
                                        <View style={{...styles.amountInputContainer, marginBottom:10}}>
                                            <TextInput
                                                placeholder="Confirm Phone Number"
                                                onChangeText={text => setConfirmPhone(formatPhoneNumber(text))}
                                                value={confirmPhone}
                                                keyboardType="phone-pad"
                                                style={styles.input}
                                                maxLength={14}
                                            />
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <Text style={{...styles.modalText}}>Enter Email Associated with Account:</Text>
                                        <View style={{...styles.amountInputContainer, marginBottom:10}}>
                                            <TextInput
                                                placeholder="Email"
                                                onChangeText={setEmail}
                                                value={email}
                                                keyboardType="email-address"
                                                style={styles.input}
                                            />
                                        </View>

                                        <Text style={styles.modalText}>Confirm Email:</Text>
                                        <View style={styles.amountInputContainer}>
                                            <TextInput
                                                placeholder="Confirm Email"
                                                onChangeText={setConfirmEmail}
                                                value={confirmEmail}
                                                keyboardType="email-address"
                                                style={styles.input}
                                            />
                                        </View>
                                    </>
                                )}

                                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                                <View style={styles.buttonContainer}>
                                    <Pressable
                                        style={[styles.button, styles.buttonConfirm]}
                                        onPress={handleWithdrawMoney}
                                    >
                                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Confirm</Text>}
                                    </Pressable>
                                    <Pressable
                                        style={[styles.button, styles.buttonCancel]}
                                        onPress={() => setTransferMoneyModalVisible(false)}
                                    >
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
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
        backgroundColor: '#2196F3',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
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
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
});

export default TransferMoney;
