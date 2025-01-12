import React from 'react';
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Alert } from 'react-native';
import BottomSheetScrollView from '../BottomSheetScrollView';
//@ts-ignore
import placeholder from '../../../../assets/GroupIcon.png';

interface CommentsModalProps {
    bottomSheetRef: any;
    selectedPostComments: any[];
    setSelectedPostComments: (comments: any[]) => void;
    commentText: string;
    setCommentText: (text: string) => void;
    closeCommentsModal: () => void;
    styles: any;
    selectedPostId: string | null;
    groupId: string;
    username: string;
    addComment: (comment: any, postId: string) => void;
    userPfp: string;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
    bottomSheetRef,
    selectedPostComments,
    setSelectedPostComments,
    commentText,
    setCommentText,
    closeCommentsModal,
    styles,
    selectedPostId,
    groupId,
    username,
    addComment,
    userPfp
}) => {
    const postComment = async (): Promise<void> => {
        if (commentText.trim() === '') {
            return;
        }

        if (!selectedPostId) {
            console.error('No post selected for comment');
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:3000/bindly/comment/addComment`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        postid: selectedPostId,
                        groupid: groupId,
                        username: username,
                        message: commentText.trim(),
                    }),
                }
            );

            const { status, body } = await response.json().then((data: any) => ({
                status: response.status,
                body: data,
            }));

            if (status === 200) {
                addComment(body, selectedPostId);
                setSelectedPostComments(prevComments => [...prevComments, {
                    ...body,
                    users: {
                        pfp: userPfp
                    }
                }]);
            }
        } catch (error) {
            console.log('Fetch error: ', error);
            Alert.alert(
                'Network Error',
                'Unable to connect to the server. Please try again later.'
            );
        } finally {
            setCommentText('');
        }
    };

    return (
        <BottomSheetScrollView
            ref={bottomSheetRef}
            snapTo="66%"
            backgroundColor="white"
            backDropColor="rgba(0,0,0,0.5)"
            closeFunc={closeCommentsModal}
        >
            <View style={{ ...styles.commentsModalContainer }}>
                <View style={styles.commentsHeader}>
                    <Text style={styles.commentsTitle}>Comments</Text>
                </View>
                <ScrollView style={styles.commentsContent}>
                    {selectedPostComments.length === 0 ? (
                        <Text style={styles.noCommentsText}>No comments yet.</Text>
                    ) : (
                        selectedPostComments.map((comment) => (
                            <View key={comment.id} style={styles.commentItem}>
                                <View style={styles.commentRow}>
                                    <Image
                                        style={styles.commentProfileImage}
                                        source={comment.users.pfp ? { uri: comment.users.pfp } : placeholder}
                                    />
                                    <View style={styles.commentTextContainer}>
                                        <Text style={styles.commentUsername}>{comment.username}</Text>
                                        <Text style={styles.commentText}>{comment.message}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={320}
                    style={styles.commentInputKeyboardAvoiding}
                >
                    <View style={styles.commentInputContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Add a comment..."
                            multiline
                            maxLength={300}
                            value={commentText}
                            onChangeText={setCommentText}
                        />
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={() => {
                                postComment();
                                Keyboard.dismiss();
                            }}
                        >
                            <Text style={styles.sendButtonText}>Send</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </BottomSheetScrollView>
    );
};

export default CommentsModal;