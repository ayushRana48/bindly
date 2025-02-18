import type React from "react"
import { useState } from "react"
import {
    View,
    Text,
    TextInput,
    Pressable,
    Image,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../types"
import * as ImagePicker from "expo-image-picker"
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker"

// @ts-ignore
import placeholder from "../../assets/profile.png"
// @ts-ignore
import camera from "../../assets/Camera.png"
// @ts-ignore
import cameraIcon from "../../assets/cameraIcon.png"
// @ts-ignore
import galleryIcon from "../../assets/galleryIcon.png"
// @ts-ignore
import trashIcon from "../../assets/trashIcon.png"


// Default birthday is 18 years ago from today
const defaultBirthday = new Date();
defaultBirthday.setFullYear(defaultBirthday.getFullYear() - 18);

const SignUpScreen1: React.FC = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [openModal, setOpenModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(defaultBirthday);
    const [errorMessage, setErrorMessage] = useState("");

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


    const toSignIn = () => {
        navigation.navigate('SignIn');
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImageSrc({ uri: result.assets[0].uri });
            setOpenModal(false);
        }
    };

    const takeImage = async () => {
        try {
            await ImagePicker.requestCameraPermissionsAsync();
            const result = await ImagePicker.launchCameraAsync({
                cameraType: ImagePicker.CameraType.front,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setImageSrc({ uri: result.assets[0].uri });
                setOpenModal(false);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const removeImage = () => {
        setImageSrc(placeholder);
        setOpenModal(false);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleDone = () => {
        setShowDatePicker(false);
    };

    const handleNext = () => {
        // Validate input
        if (!firstName.trim() || !lastName.trim()) {
            setErrorMessage("Please enter both your first and last name.");
            return;
        }

        const today = new Date();
        const birthDate = new Date(date);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            setErrorMessage("You must be at least 18 years old to sign up.");
            return;
        }

        // Navigate to the next screen with validated data
        navigation.navigate("SignUpScreen2", { firstName, lastName, imageSrc: imageSrc, username: username, birthday: date });
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
         

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.logoContainer}>
                    <Text style={styles.title}>Sign Up</Text>
                </View>

                <View style={styles.imageContainer}>
                    <Image style={styles.profileImage} source={imageSrc} />
                    <Pressable style={styles.cameraButton} onPress={() => setOpenModal(true)}>
                        <Image style={styles.cameraIcon} source={camera} />
                    </Pressable>
                </View>

                <Modal visible={openModal} transparent onRequestClose={() => setOpenModal(false)}>
                    <TouchableWithoutFeedback onPress={() => setOpenModal(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>User Photo</Text>
                                    <View style={styles.modalButtonContainer}>
                                        <Pressable style={styles.modalButton} onPress={takeImage}>
                                            <Image style={styles.modalButtonIcon} source={cameraIcon} />
                                            <Text>Camera</Text>
                                        </Pressable>
                                        <Pressable style={styles.modalButton} onPress={pickImage}>
                                            <Image style={styles.modalButtonIcon} source={galleryIcon} />
                                            <Text>Gallery</Text>
                                        </Pressable>
                                        <Pressable style={styles.modalButton} onPress={removeImage}>
                                            <Image style={styles.modalButtonIcon} source={trashIcon} />
                                            <Text>Remove</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                <View style={styles.row}>
                    <View style={styles.halfInputContainer}>
                        <Text style={styles.label}>First Name</Text>
                        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Jesse" />
                    </View>
                    <View style={[styles.halfInputContainer, styles.inputPaddingLeft]}>
                        <Text style={styles.label}>Last Name</Text>
                        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Bob" />
                    </View>
                </View>

                <View style={[styles.inputContainer]}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Doe" />
                    </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Birthday</Text>
                    <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
                        <Text>{date.toLocaleDateString()}</Text>
                    </Pressable>
                </View>

                {showDatePicker && (
                    <>
                        <DateTimePicker mode="date" display="spinner" value={date} onChange={handleDateChange} maximumDate={defaultBirthday}  style={{ height: 120 }} />
                        <View style={styles.buttonContainer}>

                            <Pressable style={styles.button} onPress={handleDone}>
                                <Text style={styles.buttonText}>Done</Text>
                            </Pressable>
                        </View>

                    </>
                )}

                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                {!showDatePicker && (
                    <View style={styles.buttonContainer}>
                        <Pressable style={styles.button} onPress={handleNext}>
                            <Text style={styles.buttonText}>Next</Text>
                        </Pressable>
                    </View>
                )}

                <View style={styles.footer}>
                    <Pressable onPress={toSignIn}>
                        <Text style={styles.linkText}>Already have an account?</Text>
                        <Text style={[styles.linkText, styles.bold]}> Sign in Here</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        padding: 32,
        flexGrow: 1,
        // justifyContent: "center",
    },
    logoContainer: {
        marginBottom: 32,
        alignItems: "center",
        marginTop: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    imageContainer: {
        alignItems: "center",
        marginBottom: 64,
        position: "relative",
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 8
   },
    cameraButton: {
        position: "absolute",
        bottom: -15,
        right: "50%",
        marginRight: -75,
        overflow: "hidden",
    },
    cameraIcon: {
        width: 50,
        height: 50,
    },
    linkText: {
        color: 'dodgerblue',
        textAlign: 'center',
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    halfInputContainer: {
        width: "48%",
    },
    inputPaddingLeft: {
        paddingLeft: 8,
    },
    doneButton: {
        backgroundColor: "dodgerblue",
        padding: 10,
        marginTop: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    inputContainer: {
        marginTop: 24,
    },
    label: {
        color: "#333",
        marginBottom: 4,
        fontSize: 14,
        fontWeight: "600",
    },
    input: {
        height: 40,
        backgroundColor: "#f8f8f8",
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        fontSize: 16,
        justifyContent: "center", // Center vertically
        alignItems: "flex-start", // Align text to the left
    },

    buttonContainer: {
        alignItems: "center",
        marginTop: 24,
    },
    button: {
        backgroundColor: "dodgerblue",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        maxWidth: 250,
    },
    buttonPressed: {
        backgroundColor: "#1E90FF",
        opacity: 0.9,
    },
    buttonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },
    datePicker: {
        height: 120,
        marginTop: 10,
    },
    footer: {
        marginTop: 32,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    footerPressable: {
        flexDirection: "row",
    },
    footerText: {
        color: "dodgerblue",
    },
    bold: {
        fontWeight: "bold",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
    },
    modalButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    modalButton: {
        alignItems: "center",
    },
    modalButtonIcon: {
        width: 40,
        height: 40,
        marginBottom: 5,
    },
    errorText: {
        color: 'red',
        fontWeight: 'bold',
    },
})

export default SignUpScreen1

