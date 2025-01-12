import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';

interface DeleteModalProps {
    isVisible: boolean;
    onClose: () => void;
    modalStep: string;
    postid: string;
    removePost: (postId: string) => void;
    onDeletePress: () => void;

}

const DeleteModal: React.FC<DeleteModalProps> = ({
    isVisible,
    onClose,
    modalStep,
    postid,
    removePost,
    onDeletePress
}) => {
    const [deleteLoading, setDeleteLoading] = useState(false);

    const deletePost = async () => {
        if (deleteLoading) return;
        setDeleteLoading(true);

        try {
            const response = await fetch(
                `https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/deletePost/${postid}`,
                {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            const { status, body } = await response.json().then((data) => ({
                status: response.status,
                body: data,
            }));

            if (status === 200) {
                removePost(postid);
            }
        } catch (error) {
            console.log('Fetch error: ', error);
            Alert.alert('Network Error', 'Unable to connect to the server. Please try again later.');
        } finally {
            onClose();
            setDeleteLoading(false);
        }
    };

    return (
        <Modal
            isVisible={isVisible}
            onSwipeComplete={onClose}
            swipeDirection={['down']}
            onBackdropPress={onClose}
            style={styles.modal}
            backdropTransitionOutTiming={0}
            propagateSwipe={true}
        >
            <View style={styles.modalContainer}>
                {modalStep === 'delete' ? (
                    <>
                        <Text style={styles.modalTitle}>Delete Post?</Text>
                        <TouchableOpacity 
                            style={styles.deleteOptionButton} 
                            onPress={() => onDeletePress()}
                        >
                            <Text style={styles.buttonText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.cancelButton} 
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.modalTitle}>Confirm Deletion</Text>
                        <Text style={styles.modalText}>
                            This action cannot be undone. Are you sure you want to delete this post?
                        </Text>
                        <TouchableOpacity 
                            style={styles.confirmButton} 
                            onPress={deletePost}
                        >
                            {deleteLoading ? (
                                <ActivityIndicator color={'white'} />
                            ) : (
                                <Text style={styles.buttonText}>Confirm</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.cancelButton} 
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                )}
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
    confirmButton: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
        marginBottom: 15,
        height: 50
    },
    cancelButton: {
        backgroundColor: 'dodgerblue',
        padding: 15,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
        height: 50
    },
    deleteOptionButton: {
        backgroundColor: 'red',
        width: '45%',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 15,
        height: 50,
        marginTop: 25
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        marginVertical: 'auto'
    }
});

export default DeleteModal;