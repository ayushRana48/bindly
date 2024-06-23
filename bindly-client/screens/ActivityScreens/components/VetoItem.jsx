import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Pressable, Modal,ActivityIndicator } from 'react-native';
import Swiper from 'react-native-swiper';
import { Video } from 'expo-av';
import placeholder from '../../../assets/profile.png'
import { useUserContext } from '../../../UserContext';

const width = 300
const height = width * 1.77777778
const VetoItem = ({ postid, imageLink, videoLink, username, caption, users, time, groupname, veto }) => {

    const [pfpLink, setPfpLink] = useState(placeholder)
    const { user } = useUserContext()


    useEffect(() => {
    console.log(user)
      if(user.pfp){
        setPfpLink({uri:user.pfp})
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

                <Text style={{marginLeft:'auto'}}>from {groupname}</Text>

            </View>
            <Swiper style={styles.wrapper} showsButtons={false} paginationStyle={{ bottom: 10 }} dotColor="rgba(255, 255, 255, 0.5)" activeDotColor="#fff">
                {imageLink && (
                    <View style={styles.mediaContainer}>
                        <Image key="image" style={{
                            width: width,
                            height: width,
                            margin: 'auto'
                        }} source={{ uri: imageLink }} />


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
                    </View>
                )}
            </Swiper>
            <View style={styles.captionContainer}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ marginLeft: 'auto' }}>{`${veto.length} vetos`}</Text>
                </View>
                <Text style={styles.caption}><Text style={styles.username}>{username}</Text>    {caption}</Text>
            </View>
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

export default VetoItem;
