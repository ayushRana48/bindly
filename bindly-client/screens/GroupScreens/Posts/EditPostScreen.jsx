import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, Image, KeyboardAvoidingView, Keyboard, Platform, TouchableWithoutFeedback, Modal, ActivityIndicator } from "react-native";
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from "../../../UserContext";
import { useGroupsContext } from "../../GroupsContext";
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import compressPostImage from "../../../utils/compressPostImage";
import { BASE_URL } from "@env";

const EditPostScreen = () => {
    const { setGroups, setGroupData, groupData } = useGroupsContext();
    const { user } = useUserContext();

    const [caption, setCaption] = useState("");
    const [image, setImage] = useState("");
    const [video, setVideo] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [modalIsImage, setIsModalImage] = useState(true);
    const [postId, setPostId] = useState("")
    const [prevTime, setPrevTime] = useState(false)


    useEffect(()=>{
        const getPost = async () => {
            let correctPost = {}
            for (let i = 0; i < groupData?.post.length; i++) {
                if (user.username == groupData.post[i].username) {
                    correctPost = groupData.post[i]
                    setCaption(correctPost.caption)
                    setImage(correctPost.photolink)
                    setVideo(correctPost.videolink)
                    setPrevTime(correctPost.timepost)
                    setPostId(correctPost.postid)
                    const compressedUri = await compressVideo(correctPost.videolink);
                    setThumbnail(compressedUri)
                    break;
                }
            }
        }
        getPost()
    }, [])



    const takeImage = async () => {
        try {
            await ImagePicker.requestCameraPermissionsAsync();
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [9, 16],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const calculateBase64Size = (base64String) => {
        let padding = 0;
        if (base64String.endsWith('==')) {
            padding = 2;
        } else if (base64String.endsWith('=')) {
            padding = 1;
        }
        return (base64String.length * 3 / 4) - padding;
    };

    const takeVideo = async () => {
        try {
            await ImagePicker.requestCameraPermissionsAsync();
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                aspect: [9, 16],
                quality: 1,
                videoMaxDuration: 10 // Set max video length to 10 seconds
            });

            if (!result.canceled) {
                const compressedUri = await compressVideo(result.assets[0].uri);
                setVideo(result.assets[0].uri);
                setThumbnail(compressedUri);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [9, 16],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const pickVideo = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                aspect: [9, 16],
                quality: 1,
                videoMaxDuration: 10 // Set max video length to 10 seconds
            });

            if (!result.canceled) {
                const compressedUri = await compressVideo(result.assets[0].uri);
                setVideo(result.assets[0].uri);
                setThumbnail(compressedUri);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const compressVideo = async (uri) => {
        try {
            const { uri: compressedUri } = await VideoThumbnails.getThumbnailAsync(
                uri,
                {
                    time: 2000,
                }
            );
            return compressedUri;
        } catch (e) {
            console.warn(e);
        }
    };

    const removeImage = () => {
        setImage("");
    };

    const removeVideo = () => {
        setVideo("");
        setThumbnail("");
    };

    const navigation = useNavigation();

    const cancel = () => {
        navigation.goBack();
    };

    const submit = async () => {
        const d1 = new Date();
        if (loading) return; // Prevent double click
        setLoading(true);

        if (!caption.trim()) {
            console.error("Please enter caption.");
            setLoading(false);
            return;
        }
        if (!image && !video) {
            console.error("Please add picture or video");
            setLoading(false);
            return;
        }

        const time1 = Date.now();
        let imgPermanentUrl = "";
        let vidPermanentUrl = "";

        if (image) {
            try {
                const response = await fetch(`${BASE_URL}/bindly/post/getPresignedUrl`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileName: `${user.username}-${groupData.group.groupid}`,
                        date: time1,
                        isImage: true,
                    }),
                });

                const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

                let presignedUrl = "";
                if (status === 200) {
                    imgPermanentUrl = body.permanentUrl;
                    presignedUrl = body.presignedUrl;
                    const compressImage = await compressPostImage(image)
                    const blobResp = await fetch(compressImage);
                    const blob = await blobResp.blob();

                    const fileResponse = await fetch(presignedUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'image/jpeg', // Adjust this based on the file type
                        },
                        body: blob,
                    });

                    if (!fileResponse.ok) {
                        throw new Error('Failed to upload image');
                    }
                }
            } catch (error) {
                console.log("Fetch error: ", error);
                Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
                setLoading(false);
                return;
            }
        }

        if (video) {
            try {
                const response = await fetch(`${BASE_URL}/bindly/post/getPresignedUrl`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileName: `${user.username}-${groupData.group.groupid}`,
                        date: time1,
                        isImage: false,
                    }),
                });

                const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

                let presignedUrl = "";
                if (status === 200) {
                    vidPermanentUrl = body.permanentUrl;
                    presignedUrl = body.presignedUrl;

                    const blobResp = await fetch(video);
                    const blob = await blobResp.blob();

                    const fileResponse = await fetch(presignedUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'video/mp4', // Adjust this based on the file type
                        },
                        body: blob,
                    });

                    if (!fileResponse.ok) {
                        throw new Error('Failed to upload video');
                    }
                }
            } catch (error) {
                console.log("Fetch error: ", error);
                Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
                setLoading(false);
                return;
            }
        }


        try {
            const time = new Date(time1); // Record the start time

            const response = await fetch(`${BASE_URL}/bindly/post/updatePost/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user.username,
                    groupId: groupData.group.groupid,
                    photolink: imgPermanentUrl,
                    videolink: vidPermanentUrl,
                    caption: caption,
                    time: time,
                    prevFileName: `${user.username}-${groupData.group.groupid}-${Date.parse(prevTime)}`,
                    timecycle:groupData.timecycle

                }),
            });

            const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

            if (status === 200) {
                setGroupData(g => {
                    return {
                        ...g,
                        post: [body, ...g.post]
                    };
                });


                // Navigate to the desired page
                navigation.goBack()

                // Call compressVideo API after navigation
                if (video) {

                    fetch(`${BASE_URL}/bindly/post/compressVideo`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ videolink: `${user.username}-${groupData.group.groupid}-${time1}v` }),
                    })
                        .then(response => {
                            console.log(response)
                            return response.json()
                        })
                        .then(data => {
                            console.log('Video compressed:', data);
                        })
                        .catch(error => {
                            console.log('Compression error:', error);
                        });
                }
            }
        } catch (error) {
            console.log("Fetch error: ", error);
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        } finally {
            setLoading(false);
        }
    };


    const openModal = (content, isImage) => {
        setIsModalImage(isImage);
        setModalContent(content);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setModalContent("");
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <Pressable style={styles.cancel} onPress={cancel}>
                            <Text style={{ color: "red" }}>cancel</Text>
                        </Pressable>
                        <Text style={styles.title}>{groupData.group.groupname}</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 }}>
                            <View>
                                <Text>Select Picture</Text>
                                <Pressable style={styles.selectMedia} onPress={takeImage}>
                                    {image ? (
                                        <Pressable onPress={() => openModal(image, true)}>
                                            <Image source={{ uri: image }} style={{ width: 140, height: 140, borderRadius: 10 }} />
                                        </Pressable>
                                    ) : (
                                        <Text>Camera</Text>
                                    )}
                                </Pressable>
                                {image ? (
                                    <Pressable style={styles.remove} onPress={removeImage}>
                                        <Text style={styles.removeText}>X</Text>
                                    </Pressable>
                                ) : null}
                            </View>
                            <View>
                                <Text>Select Video</Text>
                                <Pressable style={styles.selectMedia} onPress={takeVideo}>
                                    {thumbnail ? (
                                        <Pressable onPress={() => openModal(video, false)}>
                                            <Image source={{ uri: thumbnail }} style={{ width: 140, height: 140, borderRadius: 10 }} />
                                        </Pressable>
                                    ) : (
                                        <Text>Video</Text>
                                    )}
                                </Pressable>
                                {video ? (
                                    <Pressable style={styles.remove} onPress={removeVideo}>
                                        <Text style={styles.removeText}>X</Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        </View>
                        <View>
                            <Text>caption</Text>
                            <TextInput
                                style={styles.captionInput}
                                multiline={true}
                                numberOfLines={5}
                                maxLength={1000}
                                value={caption}
                                onChangeText={setCaption}
                                placeholder="write caption ..."
                            />
                            <Text style={{ marginLeft: 'auto', marginRight: 10 }}>{caption.length}/1000</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Pressable style={styles.share} onPress={submit}>
                                {loading ? <ActivityIndicator color={'white'} /> : <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>Edit</Text>}
                            </Pressable>
                        </View>

                        <Modal
                            visible={modalVisible}
                            transparent={true}
                            animationType="slide"
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <Pressable style={styles.modalClose} onPress={closeModal}>
                                        <Text style={{ color: "red", fontSize: 18 }}>X</Text>
                                    </Pressable>
                                    {modalContent && modalIsImage && (
                                        <Image source={{ uri: modalContent }} style={styles.modalImage} />
                                    )}
                                    {modalContent && !modalIsImage && (
                                        <Video
                                            source={{ uri: modalContent }}
                                            style={styles.modalImage}
                                            useNativeControls
                                            resizeMode="contain"
                                            shouldPlay
                                            isLooping
                                        />
                                    )}
                                </View>
                            </View>
                        </Modal>

                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 32,
        flexGrow: 1,
    },
    cancel: {
        position: 'absolute',
        top: 30,
        left: 10,
        height: 40,
        width: 50,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    selectMedia: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 140,
        height: 140,
        borderRadius: 10,
        backgroundColor: '#e3e3e3',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 20,
        marginTop: 60
    },
    share: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'dodgerblue',
        width: 180,
        height: 50,
        padding: 10,
        borderRadius: 8,
        marginTop: 40,
    },
    remove: {
        width: 35,
        height: 35,
        borderColor: 'black',
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',  // Center content vertically
        alignItems: 'center',      // Center content horizontally,
        position: 'absolute',
        right: -13,
        top: 3,
        backgroundColor: 'white',
        zIndex: 10
    },
    removeText: {
        fontSize: 16
    },
    captionInput: {
        padding: 10,
        height: 200,
        borderColor: 'black',
        borderWidth: 0.5,
        borderRadius: 5,
        backgroundColor: '#f0f0f0'
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '90%',
        height: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalClose: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1
    },
    modalImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        resizeMode: 'contain'
    }
});

export default EditPostScreen;
