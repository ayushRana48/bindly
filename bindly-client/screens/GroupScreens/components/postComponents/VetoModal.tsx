import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { checkToken } from '../../../../utils/checkToken';

interface VetoModalProps {
    isVisible: boolean;
    onClose: () => void;
    userHasVeto: boolean;
    postid: string;
    groupId: string;
    username: string;
    updatePostVeto: (updatedPost: any) => void;
}

const VetoModal: React.FC<VetoModalProps> = ({
    isVisible,
    onClose,
    userHasVeto,
    postid,
    groupId,
    username,
    updatePostVeto
}) => {
    const [loading, setLoading] = useState(false);

    const addVeto = async () => {
        if (loading) return;
        setLoading(true);
        
        try {
            const token = await checkToken();
            const response = await fetch(
                `https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/addVeto`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
                    body: JSON.stringify({
                        postid,
                        username,
                        groupid: groupId,
                    }),
                }
            );

            const { status, body } = await response.json().then((data) => ({
                status: response.status,
                body: data,
            }));

            if (status === 200) {
                updatePostVeto(body);
            }
        } catch (error) {
            console.log('Fetch error: ', error);
            Alert.alert('Network Error', 'Unable to connect to the server. Please try again later.');
        } finally {
            onClose();
            setLoading(false);
        }
    };

    const removeVeto = async () => {
        if (loading) return;
        setLoading(true);
        
        try {
            const token = await checkToken();
            const response = await fetch(
                `https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/removeVeto`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
                    body: JSON.stringify({
                        postid,
                        username,
                        groupid: groupId,
                    }),
                }
            );

            const { status, body } = await response.json().then((data) => ({
                status: response.status,
                body: data,
            }));

            if (status === 200) {
                updatePostVeto(body);
            }
        } catch (error) {
            console.log('Fetch error: ', error);
            Alert.alert('Network Error', 'Unable to connect to the server. Please try again later.');
        } finally {
            onClose();
            setLoading(false);
        }
    };

    return (
        <Modal
            isVisible={isVisible}
            onSwipeComplete={onClose}
            swipeDirection={['down']}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            style={styles.modal}
            backdropTransitionOutTiming={0}
            propagateSwipe={true}
        >
            {/* Rest of the JSX remains the same */}
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Veto</Text>
                <View style={styles.modalText}>
                    <View>
                        <Text style={styles.boldText}>
                            {userHasVeto 
                                ? 'Are you sure you want to remove your veto?' 
                                : 'Are you sure you want to veto this post?'
                            }
                        </Text>
                    </View>

                    {!userHasVeto && (
                        <Text style={styles.modalSubtitle}>
                            Only veto if you think this post does not demonstrate the group task
                        </Text>
                    )}
                </View>
                <View style={styles.modalButtons}>
                    <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={userHasVeto ? removeVeto : addVeto}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {userHasVeto ? 'Remove Veto' : 'Veto'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, styles.cancelButton]} 
                        onPress={onClose}
                    >
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: 'center',
        height: '30%'
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15,
    },
    boldText: {
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
        textAlign: 'center',
    },
    modalButtons: {
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    actionButton: {
        width: 240,
        height: 40,
        padding: 'auto',
        backgroundColor: 'dodgerblue',
        alignItems: 'center',
        borderRadius: 5,
        marginHorizontal: 'auto',
        justifyContent: 'center'
    },
    cancelButton: {
        backgroundColor: 'red',
        marginTop: 4
    },
    buttonText: {
        color: 'white',
        fontSize: 16
    }
});

export default VetoModal;