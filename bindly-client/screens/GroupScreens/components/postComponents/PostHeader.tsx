import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { User } from '../../../../types';

interface PostHeaderProps {
    username: string;
    time: Date | string;
    currentUser: User | null;
    profilePicture: any;
    onOptionsPress: () => void;
  
}

const PostHeader: React.FC<PostHeaderProps> = ({
    username,
    currentUser,
    profilePicture,
    time,
    onOptionsPress,
}) => {


  const displayDate = (time: Date | string) => {
    const date = new Date(time);
    date.setMonth(date.getMonth() + 3); // Add 4 months
    return date.toLocaleDateString();
  };


  const displayTime = (time: Date | string) => {
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };



    return (
        <View style={styles.header}>
            <Image style={styles.profileImage} source={profilePicture} />
            <View style={styles.headerTextContainer}>
                <Text style={styles.username}>{username}</Text>
                <View style={styles.dateContainer}>
                    <Text style={styles.date}>{displayDate(time)}</Text>
                    <Text style={[styles.date, { marginLeft: 2 }]}>{displayTime(time)}</Text>
                </View>
            </View>

            {username === currentUser?.username && (
                <Pressable
                    style={styles.optionsButton}
                    onPress={onOptionsPress}
                >
                    <Text style={styles.optionsButtonText}>...</Text>
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingLeft: 14,
        paddingRight: 2,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        margin: 'auto',
    },
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 4,
    },
    headerTextContainer: {
        marginLeft: 10,
        marginRight: 'auto',
    },
    username: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    dateContainer: {
        flexDirection: 'row',
        marginTop: 2,
    },
    date: {
        color: '#757575',
        fontSize: 12,
    },
    optionsButton: {
        width: 30,
        height: 30,
        alignItems: 'center',
        marginLeft: 'auto',
        marginRight: 10,
        justifyContent: 'center',
    },
    optionsButtonText: {
        fontSize: 18,
        marginBottom: 8,
    },
});

export default PostHeader;