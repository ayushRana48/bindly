import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import BottomSheetScrollView from '../BottomSheetScrollView';
// @ts-ignore
import placeholder from '../../../../assets/GroupIcon.png';

interface LikesModalProps {
    bottomSheetRef: any;
    selectedPostLikes: string[];
    getUserPfp: (username: string) => string;
    closeLikesModal: () => void;
    styles: any;
}

const LikesModal: React.FC<LikesModalProps> = ({
    bottomSheetRef,
    selectedPostLikes,
    getUserPfp,
    closeLikesModal,
    styles
}) => {
    return (
        <BottomSheetScrollView
            ref={bottomSheetRef}
            snapTo="66%"
            backgroundColor="white"
            backDropColor="rgba(0,0,0,0.5)"
            closeFunc={closeLikesModal}
        >
            <View style={{ ...styles.commentsModalContainer }}>
                <View style={styles.commentsHeader}>
                    <Text style={styles.commentsTitle}>Likes</Text>
                </View>
                <ScrollView style={styles.commentsContent}>
                    {selectedPostLikes.length === 0 ? (
                        <Text style={styles.noCommentsText}>No likes yet.</Text>
                    ) : (
                        selectedPostLikes.map((like) => (
                            <View key={like} style={styles.likeItem}>
                                <View style={styles.commentRow}>
                                    <Image
                                        style={styles.likeProfileImage}
                                        source={getUserPfp(like) ? { uri: getUserPfp(like) } : placeholder}
                                    />
                                    <Text style={styles.likeUsername}>{like}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </BottomSheetScrollView>
    );
};

export default LikesModal;