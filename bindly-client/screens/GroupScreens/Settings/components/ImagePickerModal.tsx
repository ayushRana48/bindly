import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Image, TouchableWithoutFeedback, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// @ts-ignore
import cameraIcon from "../../../../assets/cameraIcon.png";
// @ts-ignore
import galleryIcon from "../../../../assets/galleryIcon.png";
// @ts-ignore
import trashIcon from "../../../../assets/trashIcon.png";
//@ts-ignore
import compressImage from "../../../../utils/compressImage";

interface ImagePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onImageSelected: (imageUri: string | null) => void;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ visible, onClose, onImageSelected }) => {
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        try {
            setLoading(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                const compressedUri = await compressImage(result.assets[0].uri);
                onImageSelected(compressedUri); // Pass the image URI to the parent component
                onClose();
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const takeImage = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "Camera access is required to take a photo.");
                return;
            }

            setLoading(true);
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                const compressedUri = await compressImage(result.assets[0].uri);
                onImageSelected(compressedUri); // Pass the image URI to the parent component
                onClose();
            }
        } catch (error) {
            Alert.alert("Error", "Failed to take photo. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const removeImage = () => {
        onImageSelected(null); // Notify the parent that the image was removed
        onClose();
    };

    return (
        <Modal visible={visible} transparent={true} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Group Photo</Text>
                            {loading ? (
                                <ActivityIndicator size="large" color="#000" />
                            ) : (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}>
                                    <Pressable style={styles.modalButton} onPress={takeImage}>
                                        <Image style={styles.modalIcon} source={cameraIcon} />
                                        <Text>Camera</Text>
                                    </Pressable>
                                    <Pressable style={styles.modalButton} onPress={pickImage}>
                                        <Image style={styles.modalIcon} source={galleryIcon} />
                                        <Text>Gallery</Text>
                                    </Pressable>
                                    <Pressable style={styles.modalButton} onPress={removeImage}>
                                        <Image style={styles.modalIcon} source={trashIcon} />
                                        <Text>Remove</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 350,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalButton: {
        alignItems: 'center',
        width: 80,
        height: 80,
    },
    modalIcon: {
        width: 40,
        height: 40,
        marginBottom: 5,
    },
});

export default ImagePickerModal;
