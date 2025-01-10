import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';

//@ts-ignore
import backArrow from '../../assets/backArrow.png';
import StravaConnect from './components/StravaConnect';
import ConnectEx from "./components/ConnectEx";

const ConnectionScreen = () => {
   

    return (
        <View style={styles.container}>
           
            <Text>Connections</Text>
            <Text style={styles.title}>Connections</Text>
            <View>
                <StravaConnect></StravaConnect>
                <ConnectEx text={'what'}></ConnectEx>
                <ConnectEx text={'else'}></ConnectEx>
                <ConnectEx text={'connect'}></ConnectEx>
                <ConnectEx text={'?'}></ConnectEx>

            </View>
            

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    backArrow: {
        position: 'absolute',
        top: 40,
        left: 30,
        zIndex: 10,
    },
    backArrowImage: {
        height: 40,
        width: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 60,
        marginBottom: 10
    },
    balance: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default ConnectionScreen;
