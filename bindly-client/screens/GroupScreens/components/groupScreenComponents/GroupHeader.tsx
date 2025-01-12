import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
// @ts-ignore
import placeholder from '../../../../assets/GroupIcon.png';
// @ts-ignore
import backArrow from '../../../../assets/backArrow.png';
// @ts-ignore
import settings from '../../../../assets/settings.png';
// @ts-ignore
import members from '../../../../assets/members.png';
// @ts-ignore
import info from '../../../../assets/info.png';

interface GroupHeaderProps {
    loading: boolean;
    imageUrl: string;
    groupName: string;
    started: boolean;
    ended: boolean;
    startDate: string;
    endDate: string;
    createStatus: 'post' | 'edit';
    back: () => void;
    setting: () => void;
    toMembers: () => void;
    toInfo: () => void;
    toPost: () => void;
    styles: any;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
    loading,
    imageUrl,
    groupName,
    started,
    ended,
    startDate,
    endDate,
    createStatus,
    back,
    setting,
    toMembers,
    toInfo,
    toPost,
    styles
}) => {
    return (
        <>
            <Pressable style={styles.backArrow} onPress={back}>
                <Image style={{ height: 40, width: 40 }} source={backArrow} />
            </Pressable>
            {!loading && (
                <Pressable style={styles.setting} onPress={setting}>
                    <Image style={{ height: 40, width: 40 }} source={settings} />
                </Pressable>
            )}
            <View style={styles.logoContainer}>
                <Text style={styles.title}>{groupName}</Text>

                <View style={{ flexDirection: 'row' }}>
                    <View>
                        <Image 
                            style={{ width: 100, height: 100, borderRadius: 8 }} 
                            source={imageUrl.length > 0 && !loading ? { uri: imageUrl } : placeholder} 
                        />
                    </View>
                    {!loading && (
                        <View style={{ flexDirection: 'row', width: 160, justifyContent: 'space-between', marginTop: 20, marginLeft: 40 }}>
                            <View style={{ alignItems: 'center' }}>
                                <Pressable style={styles.headerButton} onPress={toMembers}>
                                    <Image style={styles.headerButtonIcon} source={members} />
                                </Pressable>
                                <Text>Members</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <Pressable style={styles.headerButton} onPress={toInfo}>
                                    <Image style={styles.headerButtonIcon} source={info} />
                                </Pressable>
                                <Text>Info</Text>
                            </View>
                        </View>
                    )}
                </View>

                {(!loading && started && !ended) && (
                    <>
                        <Pressable style={styles.createPost} onPress={toPost}>
                            <Text style={{ color: 'white' }}>{createStatus == 'edit' ? 'Edit Post' : 'Create Post'}</Text>
                        </Pressable>
                        <Text style={{ textAlign: 'center' }}>Post by {new Date(startDate).toLocaleTimeString()}</Text>
                    </>
                )}

                {(!loading && !started) && 
                    <Text style={{ textAlign: 'center', fontSize: 18, marginTop: 20 }}>
                        Starts {new Date(startDate).toLocaleDateString() + ' ' + 
                        new Date(startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                }

                {(!loading && ended) && 
                    <Text style={{ textAlign: 'center', fontSize: 18, marginTop: 20 }}>
                        Ended {new Date(endDate).toLocaleDateString() + ' ' + 
                        new Date(endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                }
            </View>
        </>
    );
};

export default GroupHeader;