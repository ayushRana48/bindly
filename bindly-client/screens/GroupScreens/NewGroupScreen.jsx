import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet, Alert,Modal } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from "../../UserContext";
import { useGroupsContext } from "../GroupsContext";
import placeholder from "../../assets/GroupIcon.png"
import camera from "../../assets/Camera.png"
import cameraIcon from "../../assets/cameraIcon.png"
import galleryIcon from "../../assets/galleryIcon.png"
import trashIcon from "../../assets/trashIcon.png"
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { nodeModuleNameResolver } from "typescript";


const NewGroupScreen = () => {

    const today = new Date();

    // Create a new Date object for tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);


    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState(tomorrow);
    const [numWeeks, setNumWeeks] = useState(0);
    const [buyIn, setBuyIn] = useState(0);
    const [taskPerWeek, setTaskPerWeek] = useState(0);
    const [show, setShow] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [imageSrc,setImageSrc]=useState(placeholder)
    const[openModal,setOpenModal]=useState(false)

    const pickImage = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      console.log(result);
  
      if (!result.canceled) {
        console.log(result.assets[0].uri)
        setImageSrc({ uri: result.assets[0].uri });
        setOpenModal(false)

    }
    };

    const takeImage = async () => {
        // No permissions request is necessary for launching the image library
        try{
            await ImagePicker.requestCameraPermissionsAsync();
            let result = await ImagePicker.launchCameraAsync({
                cameraType:ImagePicker.CameraType.front,
                allowsEditing:true,
                aspect:[1,1],
                quality:1,
            })
            console.log(result);
    
            if (!result.canceled) {
              console.log(result.assets[0].uri)
              setImageSrc({ uri: result.assets[0].uri });
              setOpenModal(false)
          }
        }
        catch(error){
            console.log(error)
        }    
      };

    const removeImage=()=>{
        setImageSrc(placeholder)
        setOpenModal(false)
    }
  

    useEffect(()=>{
        console.log(imageSrc,'from')
    },[imageSrc])


    const navigation = useNavigation();

    const { user } = useUserContext();
    const { setGroups } = useGroupsContext();



    const cancel=()=>{
        navigation.navigate("GroupsList")
    }



    const toggleDatepicker = () => {
        setShow(!show)
    }

    const submit = async () => {

        // Validate Names
        if (!groupName.trim()) {
            setErrorMessage("Enter Group Name");
            return;
        }

        // Validate Passwords

        if (!description.trim()) {
            setErrorMessage("Please enter description.");
            return;
        }

        if (!startDate) {
            setErrorMessage("Please enter start date.");
            return;
        }

        if (!numWeeks) {
            setErrorMessage("Please enter number of weeks.");
            return;
        }

        if (!buyIn) {
            setErrorMessage("Please enter buy in");
            return;
        }

        if (!taskPerWeek) {
            setErrorMessage("Please enter number of tasks per week");
            return;
        }

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + numWeeks * 7);

        console.log(startDate)
        console.log(endDate)

        let img=imageSrc;
        if(imageSrc==placeholder){
            img=""
        }


        fetch(`http://localhost:3000/bindly/group/createGroup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                groupname: groupName,
                description: description,
                buyin: buyIn,
                startdate: startDate,
                enddate: endDate,
                hostId: user.username,
                image:img?.uri,
                tasksperweek:taskPerWeek
            }),
        })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(({ status, body }) => {

                if (status === 200) {
                    // Navigate to confirm email page or handle the success scenario
                    console.log(body)
                    setGroups(g=>[...g,body])
                    navigation.navigate("Group", { groupData: body });
                } else {
                    // Handling different error messages from the server
                    // if (body.error) {
                    //     console.log(body.error, 'kjdsfbzlskdjferror')
                    // }
                }
            })
            .catch(error => {
                console.log(error)
                // In case the fetch fails
                Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
            });
        // All validations passed
    };



    const onChange = ({ type }, selctedDate) => {
        if (type == 'set') {
            const currentDate = selctedDate
            setStartDate(currentDate)
        }
        else {
            toggleDatepicker()
        }
    }

    return (
        <View style={styles.container}>
            <Pressable style={styles.cancel} onPress={cancel}>
                <Text style={{color:"red"}}>cancel</Text>
            </Pressable>
            <View style={styles.logoContainer}>
                <Text style={styles.title}>Create Group</Text>
            </View>

            <View style={{marginLeft:'auto',marginRight:'auto', position:'relative'}}>
                <Image style={{width:80, height:80, borderRadius:8}} source={imageSrc}>
                </Image>
                <Pressable style={{position:'absolute',bottom:-15, right:-15, borderColor:'black', borderWidth:1, borderRadius:20}} onPress={()=> setOpenModal(true)}>
                    <Image style={{width:40, height:40, borderRadius:8}} source={camera}/>
                </Pressable>
            </View>


            <Modal visible={openModal} transparent={true} onRequestClose={() => setOpenModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Group Photo</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}>
                        <Pressable style={styles.modalButton} onPress={takeImage}>
                            <Image style={{width:40,height:40, marginBottom:5}}source={cameraIcon}/>
                            <Text>Camera</Text>
                        </Pressable>
                        <Pressable style={styles.modalButton} onPress={pickImage}>
                            <Image style={{width:40,height:40, marginBottom:5}}source={galleryIcon}/>
                            <Text >Gallery</Text>
                        </Pressable>
                        <Pressable style={styles.modalButton} onPress={(removeImage)}>
                            <Image style={{width:40,height:40, marginBottom:5}} source={trashIcon}/>
                            <Text >Remove</Text>
                        </Pressable>
                        
                        </View>
                        
                    </View>
                </View>
            </Modal>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={groupName}
                onChangeText={setGroupName}
                placeholder="group name"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={description}
                onChangeText={setDescription}
                placeholder="description"
            />

            <Text style={styles.label}>Start Date</Text>
            <Pressable onPress={toggleDatepicker} style={styles.datePressable}>
                <Text >{startDate.toLocaleDateString()}</Text>
            </Pressable>
            <Text style={styles.label}>Weeks</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={numWeeks}
                onChangeText={text => setNumWeeks(text.replace(/[^0-9]/g, ''))}
                placeholder="5"
                keyboardType="numeric"
            />

            {show && (
                <View>
                    <DateTimePicker mode="date" display="spinner" value={startDate} onChange={onChange} style={{ height: 120 }} minimumDate={tomorrow} />

                    <View style={styles.centeredRow}>
                        <Pressable style={styles.doneButton} onPress={toggleDatepicker}>
                            <Text style={styles.buttonText}>Done</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            <Text style={styles.label}>Buy In</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={buyIn}
                onChangeText={text => setBuyIn(text.replace(/[^0-9]/g, ''))}
                placeholder="202"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Tasks Per Week</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={taskPerWeek}
                onChangeText={text => setTaskPerWeek(text.replace(/[^0-9]/g, ''))}
                placeholder="5"
                keyboardType="numeric"
            />



            {!show && (
                <View style={styles.centeredRow}>
                    <Pressable style={styles.signUpButton} onPress={submit}>
                        <Text style={styles.buttonText}>Create</Text>
                    </Pressable>
                </View>
            )}

            {errorMessage.length > 0 && (
                <View style={styles.centeredRow}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            )}
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
    modalContent: {
        width: 350,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        margin:'auto',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalButton: {
        paddingTop: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
        width:80,
        height:80
    },
    modalButtonText: {
        fontSize: 16,
        color: '#333',
    },
    cancel:{
        position:'absolute',
        top:50,
        left:30
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
});

export default NewGroupScreen;