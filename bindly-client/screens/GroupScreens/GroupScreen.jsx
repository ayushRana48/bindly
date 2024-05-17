import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet, Alert } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from "../../UserContext";
import { useRoute } from '@react-navigation/native';
import placeholder from '../../assets/GroupIcon.png'
import backArrow from '../../assets/backArrow.png'
import settings from '../../assets/settings.png'

const GroupScreen = () => {
    const route = useRoute();
    const { groupData } = route.params;


    const navigation = useNavigation();

    const { user } = useUserContext();


    useEffect(() => {
        console.log(groupData.pfp, 'uri')
    }, [])

    const back = () => {
        console.log('sd')
        navigation.navigate('GroupsList')
    }

    const setting = () => {
    }

    return (
        <View style={styles.container}>
            <Pressable style={styles.backArrow} onPress={back}>
                <Image style={{height: 40,width: 40}}
                 source={backArrow}></Image>
            </Pressable>
            <Pressable style={styles.setting} onPress={setting}>
                <Image source={settings} style={{height: 40,width: 40}}></Image>
            </Pressable>
            <View style={styles.logoContainer}>
                <Text style={styles.title}>Group</Text>
                <Text style={styles.title}>{groupData.groupname}</Text>
                <Image style={{ width: 100, height: 100, borderRadius: 8 }} source={groupData.pfp ? { uri: groupData.pfp } : placeholder}></Image>

            </View>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 24,
        flex: 1,
        // justifyContent: 'center',

    },
    backArrow: {
        position: 'absolute',
        top: 50,
        left: 30,
        width:50,
        height:50,
        zIndex:10

    },
    setting: {
        position: 'absolute',
        top: 50,
        right: 30,
        width:50,
        height:50,
        zIndex:10

      
    }
    ,
    logoContainer: {
        marginTop: 36,

        marginBottom: 36,
        alignItems: 'center',
    },
    logo: {
        width: 60,
        height: 60,
    },
    title: {
        marginTop: 8,
        fontSize: 24,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    DateInputContainer: {
        width: '75%',
    },
    WeekInputContainer: {
        width: '25%',
    },
    inputPaddingLeft: {
        paddingLeft: 4,
    },
    label: {
        color: 'gray',
        marginBottom: 4,
    },
    input: {
        marginBottom: 12,
        height: 32,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        padding: 8,
    },
    datePressable: {
        height: 32,
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        marginBottom: 12,

    },
    centeredRow: {
        alignItems: 'center',
        marginTop: 16,
    },
    doneButton: {
        backgroundColor: 'dodgerblue',
        padding: 8,
        width: 72,
        borderRadius: 4,
    },
    signUpButton: {
        backgroundColor: 'dodgerblue',
        padding: 8,
        width: 96,
        borderRadius: 4,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkText: {
        color: 'dodgerblue',
        textAlign: 'center'
    },
    bold: {
        fontWeight: 'bold',
    },
});

export default GroupScreen;