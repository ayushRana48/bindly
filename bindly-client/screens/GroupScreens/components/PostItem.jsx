import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Swiper from 'react-native-swiper';
import { Video } from 'expo-av';
import placeholder from '../../../assets/profile.png'

    const width = 300
    const height = width * 1.77777778
const PostComponent = ({ imageLink, videoLink, username, caption,users,time }) => {


    const [pfpLink,setPfpLink]=useState(placeholder)

    useEffect(()=>{
        for(let i=0;i<users?.length; i++){
            const user =users[i]
            if(user.username == username){
                if(user.users.pfp){
                    setPfpLink({uri:user.users.pfp})
                }
            }
        }
    },[users])

    const displayDate =(time)=>{
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
                <Image style={{width:45,height:45, borderRadius:4}} source={pfpLink}></Image>
                <Text style={{...styles.username,marginLeft:10, marginRight:'auto'}}>{username}</Text>

                <Text style={styles.date}>{displayDate(time)}</Text>
                <Text style={{...styles.date,margin:6}}>{displayTime(time)}</Text>

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
        paddingRight:28,
        paddingTop:10,
        paddingBottom:10,
        flexDirection:'row',
        justifyContent:'cener',
        alignItems:'center'
    },
    username: {
        fontWeight: 'bold',
        fontSize:14
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
        flexDirection: 'row',
        paddingLeft: 28,
        paddingRight:28,
        paddingTop:10,
        paddingBottom:10,
    },
    caption: {
        fontSize: 14,
    },
    date:{
        color:'#757575'
    }
});

export default PostComponent;
