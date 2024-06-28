import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Pressable, Modal,ActivityIndicator } from 'react-native';
import Swiper from 'react-native-swiper';
import { Video } from 'expo-av';
import placeholder from '../../../assets/profile.png'
import { useGroupsContext } from '../../GroupsContext';
import { useUserContext } from '../../../UserContext';
import { BASEROOT_URL } from "@env";

const width = 300
const height = width * 1.77777778
const PostComponent = ({ postid, imageLink, videoLink, username, caption, users, time, valid, veto }) => {


    const [pfpLink, setPfpLink] = useState(placeholder)
    const [modalVisible, setModalVisible] = useState(false)
    const [loading, setLoading] = useState(false)

    const [beenVeto, setBeenVeto] = useState(false)

    const { user } = useUserContext()
    const { groupData,setGroupData } = useGroupsContext()

   
    useEffect(() => {
        for (let i = 0; i < groupData?.post?.length; i++) {
            const currPost = groupData?.post[i]
            if (currPost.postid == postid) {
                if (currPost.veto.includes(user.username)) {
                    setBeenVeto(true)
                }
                else {
                    setBeenVeto(false)
                }
            }
        }
    }, [groupData])


    useEffect(() => {
        for (let i = 0; i < users?.length; i++) {
            const user = users[i]
            if (user.username == username) {
                if (user.users.pfp) {
                    setPfpLink({ uri: user.users.pfp })
                }
            }
        }
    }, [users])

    const displayDate = (time) => {
        const date = new Date(time)
        return date.toLocaleDateString()
    }
    const displayTime = (time) => {
        const date = new Date(time);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const addVeto = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${BASEROOT_URL}/bindly/post/addVeto`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postid: postid,
                    username: user.username,
                    groupid: groupData.group.groupid,
                }),
            });

            const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

            if (status === 200) {
                //possibly change to body

                setGroupData(g => {
                    const newPost = g.post.map(p => {
                        if (p.postid == postid) {
                            return body
                        }
                        else {
                            return p
                        }
                    })

                    return {
                        ...g,
                        post: newPost
                    };
                });
            }
        } catch (error) {
            console.log("Fetch error: ", error);
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        } finally {
            setModalVisible(false)
            setLoading(false);
        }
    }


    const removeVeto = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${BASEROOT_URL}/bindly/post/removeVeto`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postid: postid,
                    username: user.username,
                    groupid: groupData.group.groupid,
                }),
            });

            const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

            if (status === 200) {
                //possibly change to body

                setGroupData(g => {
                    const newPost = g.post.map(p => {
                        if (p.postid == postid) {
                            return body
                        }
                        else {
                            return p
                        }
                    })

                    return {
                        ...g,
                        post: newPost
                    };
                });
            }
        } catch (error) {
            console.log("Fetch error: ", error);
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        } finally {
            setModalVisible(false)
            setLoading(false);
        }
    }


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image style={{ width: 45, height: 45, borderRadius: 4 }} source={pfpLink}></Image>
                <View style={{}}>
                    <Text style={{ ...styles.username, marginLeft: 10, marginRight: 'auto' }}>{username}</Text>
                    <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                        <Text style={styles.date}>{displayDate(time)}</Text>
                        <Text style={{ ...styles.date, marginLeft: 2 }}>{displayTime(time)}</Text>
                    </View>
                </View>

            </View>
            <Swiper style={styles.wrapper} showsButtons={false} paginationStyle={{ bottom: 10 }} dotColor="rgba(255, 255, 255, 0.5)" activeDotColor="#fff">
                {imageLink && (
                    <View style={styles.mediaContainer}>
                        <Image key="image" style={{
                            width: width,
                            height: width,
                            margin: 'auto'
                        }} source={{ uri: imageLink }} />

                        {valid == null && users.length>2 && <Pressable onPress={() => setModalVisible(true)} style={{ backgroundColor: 'red', position: 'absolute', bottom: 20, right: 20, width: 40, height: 40, padding: 2, borderRadius: 20 }}><Text style={{ margin: 'auto', color: 'white', fontWeight: 'bold' }}>X</Text></Pressable>}

                    </View>
                )}
                {videoLink && (
                    <View style={styles.mediaContainer}>
                        <Video
                            key="video"
                            style={styles.media}
                            source={{ uri: videoLink }}
                            useNativeControls
                            resizeMode="contain"
                            isLooping
                        />
                        {valid == null && users.length>2 && <Pressable onPress={() => setModalVisible(true)} style={{ backgroundColor: 'red', position: 'absolute', bottom: 20, right: 20, width: 40, height: 40, padding: 2, borderRadius: 20 }}><Text style={{ margin: 'auto', color: 'white', fontWeight: 'bold' }}>X</Text></Pressable>}
                    </View>
                )}
            </Swiper>
            <View style={styles.captionContainer}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ marginLeft: 'auto' }}>{valid == null && `${veto.length}/${Math.ceil(users.length / 2)} vetos`}</Text>
                </View>
                <Text style={styles.caption}><Text style={styles.username}>{username}</Text>    {caption}</Text>
            </View>


            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Veto</Text>
                        <View style={styles.modalText}>
                            <View style={styles.modalItem}>
                                {!beenVeto ? <Text style={styles.boldText}>Are you sure want to veto this post</Text>
                                    : <Text style={styles.boldText}>Are you sure remove your veto</Text>}

                            </View>

                            {!beenVeto && <Text>Only veto if you think this post does not demonstrate the group task</Text>}
                        </View>
                        <View style={styles.modalButtons}>
                            {!beenVeto ? <Pressable style={styles.confirmButton} onPress={addVeto}>
                                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Veto</Text>}
                            </Pressable> :
                            
                            <Pressable style={styles.confirmButton} onPress={removeVeto}>

                                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Remove Veto</Text>}
                            </Pressable>}
                           
                            <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)} >
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
    container: {
        width: '100%',
        marginVertical: 10,
    },
    header: {
        paddingLeft: 28,
        paddingRight: 28,
        paddingTop: 10,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'cener',
        alignItems: 'center'
    },
    username: {
        fontWeight: 'bold',
        fontSize: 14
    },
    wrapper: {
        height: height,
        justifyContent: 'center',
        alignContent: 'center'
    },
    mediaContainer: {
        width: width,
        height: height,
        backgroundColor: '#e3e3e3',
        margin: 'auto'
    },
    media: {
        width: width,
        height: height,
        margin: 'auto'

    },
    captionContainer: {
        paddingLeft: 28,
        paddingRight: 28,
        paddingTop: 10,
        paddingBottom: 10,
    },
    caption: {
        fontSize: 14,
    },
    date: {
        color: '#757575'
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    boldText: {
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    confirmButton: {
        backgroundColor: 'dodgerblue',
        padding: 15,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ff7e75',
        padding: 15,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    modalItem: {
        marginBottom: 0,
        flexDirection: 'row',
        fontSize: 28,
    }
});

export default PostComponent;
