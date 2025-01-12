import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
//@ts-ignore
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
//@ts-ignore
import commentIcon from '../../../../assets/comment.png';

interface PostActionsProps {
    valid: boolean | null;
    userHasLiked: boolean;
    likes: string[];
    comments: any[];
    veto: string[];
    totalUsers: number;
    username: string;
    caption: string;
    postid: string;
    groupId: string;
    currentUsername: string;
    updatePostLikes: (postId: string, username: string) => void;
    onOpenLikesModal: (postid: string) => void;
    onOpenCommentsModal: (postid: string) => void;
    onVetoPress: () => void;
}

const PostActions: React.FC<PostActionsProps> = ({
    valid,
    userHasLiked,
    likes,
    comments,
    veto,
    totalUsers,
    username,
    caption,
    postid,
    groupId,
    currentUsername,
    updatePostLikes,
    onOpenLikesModal,
    onOpenCommentsModal,
    onVetoPress,
}) => {
    const [loading, setLoading] = useState(false);

    const toggleLike = async () => {
        if (loading) return;

        let route = 'https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/addLike';
        if (userHasLiked) {
            route = 'https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/post/removeLike';
        } else {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        updatePostLikes(postid, currentUsername);
        setLoading(true);

        try {
            await fetch(route, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postid,
                    username: currentUsername,
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

    return (
        <View style={styles.captionContainer}>
            <View style={styles.actionsRow}>
                {null == null && (
                    <>
                        <TouchableOpacity
                            style={{ ...styles.commentButton, padding: 5, paddingHorizontal: 8 }}
                            onPress={toggleLike}
                        >
                            <Icon
                                name={userHasLiked ? 'heart' : 'heart-o'}
                                size={22}
                                color={userHasLiked ? 'red' : 'black'}
                            />
                        </TouchableOpacity>
                        {/* Rest of the JSX remains the same */}
                        <TouchableOpacity onPress={() => onOpenLikesModal(postid)}>
                            <Text style={styles.commentCount}>{likes.length}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.commentButton}
                            onPress={() => onOpenCommentsModal(postid)}
                        >
                            <Image style={styles.commentIcon} source={commentIcon} />
                            <Text style={styles.commentCount}>{comments.length}</Text>
                        </TouchableOpacity>
                        <Text style={styles.vetoCount}>{`${veto.length}/${Math.ceil(totalUsers / 2)}`}</Text>
                        <TouchableOpacity
                            onPress={onVetoPress}
                            style={styles.deleteButton}
                        >
                            <Text style={styles.deleteButtonText}>X</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
            <Text style={styles.caption}>
                <Text style={styles.username}>{username}</Text> {caption}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    captionContainer: {
        paddingHorizontal: 14,
        width: '100%',
        margin: 'auto',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    commentButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentIcon: {
        width: 25,
        height: 25,
        borderRadius: 4,
    },
    commentCount: {
        marginLeft: 8,
        marginRight: 24,
        fontSize: 14,
        color: '#333',
    },
    vetoCount: {
        marginLeft: 'auto',
        marginRight: 8,
        fontSize: 14,
        color: '#333',
    },
    deleteButton: {
        backgroundColor: 'red',
        width: 26,
        height: 26,
        padding: 2,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
    caption: {
        fontSize: 14,
        color: '#333',
    },
    username: {
        fontWeight: 'bold',
    },
});

export default PostActions;