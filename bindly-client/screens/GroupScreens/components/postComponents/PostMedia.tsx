import React, { useState } from 'react';
import { View, ScrollView, Image, Dimensions, StyleSheet, Alert } from 'react-native';
import { Video } from 'expo-av';
import { TapGestureHandler } from 'react-native-gesture-handler';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    Easing 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
//@ts-ignore
import Icon from 'react-native-vector-icons/FontAwesome';
import { checkToken } from '../../../../utils/checkToken';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth - 48;
const height = width;

interface MediaItem {
    type: 'image' | 'video';
    uri: string;
}

interface PostMediaProps {
    imageLink?: string;
    videoLink?: string;
    userHasLiked: boolean;
    postid: string;
    groupId: string;
    username: string;
    updatePostLikes: (postId: string, username: string) => void;
}

const PostMedia: React.FC<PostMediaProps> = ({
    imageLink,
    videoLink,
    userHasLiked,
    postid,
    groupId,
    username,
    updatePostLikes
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const scale = useSharedValue(0);
    let doubleTapRef = React.useRef();
    
    const mediaItems: MediaItem[] = [];
    if (imageLink) mediaItems.push({ type: 'image', uri: imageLink });
    if (videoLink) mediaItems.push({ type: 'video', uri: videoLink });

    const heartStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: scale.value,
    }));

    const handleDoubleTap = async () => {
        if (loading) return;

        scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }, () => {
            //@ts-ignore
            scale.value = withTiming(0, { duration: 300, delay: 500 });
        });

        if (userHasLiked) return;
        
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        updatePostLikes(postid, username);

        setLoading(true);
        try {
            const token = await checkToken();
            await fetch('https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/addLike', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
                body: JSON.stringify({
                    postid,
                    username,
                    groupid: groupId,
                }),
            });
        } catch (error) {
            console.log('Fetch error: ', error);
            Alert.alert('Network Error', 'Unable to connect to the server. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / width);
        setCurrentIndex(index);
    };

    return (
        <TapGestureHandler
            ref={doubleTapRef}
            numberOfTaps={2}
            maxDelayMs={300}
            onActivated={handleDoubleTap}
        >
            <View style={styles.wrapper}>
                <Animated.View style={[styles.heartContainer, heartStyle]}>
                    <Icon name="heart" size={100} color="red" />
                </Animated.View>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ alignItems: 'center' }}
                    onMomentumScrollEnd={handleScroll}
                    scrollEnabled={mediaItems.length > 1}
                >
                    {mediaItems.map((item, index) => (
                        <View key={index} style={styles.mediaContainer}>
                            {item.type === 'image' ? (
                                <Image style={styles.mediaImage} source={{ uri: item.uri }} />
                            ) : (
                                <Video
                                    style={styles.media}
                                    source={{ uri: item.uri }}
                                    useNativeControls
                                    //@ts-ignore
                                    resizeMode="contain"
                                    isLooping
                                />
                            )}
                        </View>
                    ))}
                </ScrollView>

                {mediaItems.length > 1 && (
                    <View style={styles.dotContainer}>
                        {mediaItems.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    { opacity: currentIndex === index ? 1 : 0.3 },
                                ]}
                            />
                        ))}
                    </View>
                )}
            </View>
        </TapGestureHandler>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 4,
        width: width,
        marginHorizontal: 'auto',
        backgroundColor: 'red'
    },
    mediaContainer: {
        width: width,
        height: height,
        backgroundColor: '#e3e3e3',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    mediaImage: {
        width: width,
        height: width,
    },
    media: {
        width: width,
        height: height,
    },
    dotContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 25,
        alignSelf: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'skyblue',
        marginHorizontal: 3,
    },
    heartContainer: {
        position: 'absolute',
        top: '40%',
        left: '40%',
        zIndex: 1,
    },
});

export default PostMedia;