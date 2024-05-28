import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet, Alert, Modal } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from "../../UserContext";
import { useGroupsContext } from "../GroupsContext";
import placeholder from "../../assets/GroupIcon.png"
import backArrow from '../../assets/backArrow.png'
import { useRoute } from '@react-navigation/native';



const GroupSetting = () => {

    const route = useRoute();
    const { groupData } = route.params;


    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [buyIn, setBuyIn] = useState(0);
    const [taskPerWeek, setTaskPerWeek] = useState(0);
    const [show, setShow] = useState(false)
    const [imageSrc, setImageSrc] = useState(placeholder)




    useEffect(() => {
        if (groupData) {
            setGroupName(groupData.groupname)
            setDescription(groupData.description)
            setStartDate(groupData.startdate)
            setEndDate(groupData.enddate)
            if(groupData.pfp){
                setImageSrc({uri:groupData.pfp})
            }
            
            setBuyIn(groupData.buyin)
            setTaskPerWeek(groupData.tasksperweek)
        }
    }, [groupData])





    const navigation = useNavigation();

    const { user } = useUserContext();



    const back = () => {
        navigation.goBack()
    }

    const toEdit=()=>{

        if(isPastDate){
            Alert.alert("Can't edit already started")
        }
        else{
            try{
            navigation.navigate("GroupEdit", { groupData: groupData });
            }
            catch(err){
                console.log(err)
            }

        }
    }


    const toMembers=()=>{
        navigation.navigate("MembersList", { groupData: groupData });
    }

    const isPastDate = new Date(groupData.startdate) < new Date();




    return (
        <View style={styles.container}>
            <Pressable style={styles.cancel} onPress={back}>
                <Image style={{ height: 40, width: 40 }}
                    source={backArrow}></Image>
            </Pressable>

            {
                user.username === groupData.hostid &&
                <Pressable style={styles.edit} onPress={toEdit}>
                    <Text style={{ color: isPastDate ? "gray" : "blue" }}>Edit</Text>
                </Pressable>
            }

            <View style={styles.logoContainer}>
                <Text style={styles.title}>Group Settings</Text>
            </View>

            <View style={{ marginLeft: 'auto', marginRight: 'auto', position: 'relative' }}>
                <Image style={{ width: 80, height: 80, borderRadius: 8 }} source={imageSrc}>
                </Image>
            </View>

            <Text
                style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                }}
            >
                {groupName}
            </Text>

            <Text style={styles.label}>Description</Text>
            <Text style={styles.input}>{description}</Text>

            <Text style={styles.label}>Start Date</Text>
                <Text  style={styles.input} >{startDate}</Text>
            <Text style={styles.label}>End Date</Text>
            <Text  style={styles.input} >{endDate}</Text>


            <Text style={styles.label}>Buy In</Text>
            <Text style={styles.input} >{buyIn}</Text>


            <Text style={styles.label}>Tasks Per Week</Text>
            <Text style={styles.input} >{taskPerWeek}</Text>

            <View style={{alignItems: 'center'}}>
                <Pressable style={styles.viewMembers} onPress={toMembers}>
                    <Text style={{color:'white', fontSize:18, fontWeight:'600'}}>View Members</Text>
                </Pressable>
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    cancel: {
        backgroundColor:'red',
        zIndex: 10,
        height:40,
        width:40,
        position: 'absolute',
        top: 50,
        left: 30,
        alignItems:'center',
        justifyContent:'center'
    },
    edit: {
        position: 'absolute',
        top: 50,
        right: 30,
        zIndex: 10,
        height:40,
        width:40,
        backgroundColor:'red',
        alignItems:'center',
        justifyContent:'center'

    },
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
    viewMembers:{
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'dodgerblue',
        width:180,
        height:40,
        padding:10,
        borderRadius:8,
        marginTop:20

    }
});

export default GroupSetting;