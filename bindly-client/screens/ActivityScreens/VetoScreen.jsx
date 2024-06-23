import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, Image, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import backArrow from '../../assets/backArrow.png'
import { useUserContext } from "../../UserContext";
import { BASEROOT_URL } from "@env";
import VetoItem from "./components/VetoItem";

const VetoScreen = () => {
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [vetos, setVetos] = useState([]);
    const [visibleVetos, setVisibleVetos] = useState([]);
    const postsPerPage = 5; // Number of posts to load at a time
    const { user } = useUserContext();

    const getVetos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASEROOT_URL}/bindly/post/getInvalid/${user.username}`, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.error || 'Failed to fetch veto data');
            }

            const res = await response.json();
            setVetos(res);
            setVisibleVetos(res.slice(0, postsPerPage)); // Initialize visible vetos
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getVetos().then(() => setRefreshing(false));
    }, []);

    useEffect(() => {
        getVetos();
    }, []);

    const back = () => {
        navigation.goBack();
    };

    const loadMorePosts = () => {
        const nextPage = page + 1;
        const newVisibleVetos = vetos.slice(0, nextPage * postsPerPage);
        setVisibleVetos(newVisibleVetos);
        setPage(nextPage);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onMomentumScrollEnd={(e) => {
                    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
                    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
                        loadMorePosts();
                    }
                }}
                style={{ padding: 24 }}
            >
                <Pressable style={styles.backArrow} onPress={back}>
                    <Image style={{ height: 40, width: 40 }} source={backArrow} />
                </Pressable>
                <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center', alignItems: 'center', marginTop: 60 }}>Vetos</Text>
                {loading && <ActivityIndicator size="large" color="#0000ff" />}

                {vetos.length === 0 && !loading && <Text style={styles.NoGroups}>No Vetos</Text>}

                {!loading && visibleVetos.map((veto, index) => (
                    <VetoItem
                        key={index}
                        postid={veto.postid}
                        imageLink={veto.photolink}
                        videoLink={veto.videolink}
                        username={veto.username}
                        caption={veto.caption}
                        time={veto.timepost}
                        veto={veto.veto}
                        groupname={veto.groups.groupname}
                    />
                ))}

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
    },
    backArrow: {
        position: 'absolute',
        top: 20,
        left: 10,
        width: 50,
        height: 50,
        zIndex: 10,
    },
    setting: {
        position: 'absolute',
        top: 20,
        right: 10,
        width: 50,
        height: 50,
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 20,
    },
    NoGroups: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default VetoScreen;
