import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Image, StyleSheet, Alert } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from "../../UserContext";

const SignUpScreen = () => {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const navigation = useNavigation();

    const {email:email2,setEmail:setEmail2}= useUserContext();



    const [show, setShow] = useState(false)
    const [date, setDate] = useState(new Date())

    const toggleDatepicker = () => {
        setShow(!show)
    }

    const submit = async () => {

        // Validate Names
        if (!firstName.trim() || !lastName.trim()) {
            setErrorMessage("Please enter both your first and last name.");
            return;
        }

        // Validate Email using a simple regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        // Validate Passwords

        if (!password.trim()) {
            setErrorMessage("Please enter password.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("The passwords do not match.");
            return;
        }

        // Validate Birthday for being at least 18 years old
        const today = new Date();
        const birthDate = new Date(date);
        const age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            setErrorMessage("You must be at least 18 years old to sign up.");

            return;
        }

            fetch(`http://localhost:3000/bindly/auth/signUp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                email: email,
                firstName: firstName,
                lastName: lastName,
                password: password,
            }),
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            if (status === 200) {
                // Navigate to confirm email page or handle the success scenario
                setEmail2(email)
            } else {
                // Handling different error messages from the server
                if (body.error) {
                    if (body.error.includes('duplicate key value violates unique constraint "users_pkey"')) {
                        setErrorMessage("Username already taken.");
                    } else if (body.error.includes("User already registered")) {
                        setErrorMessage("Email already taken.");
                    }
                    else if (body.error.includes("at least 6 characters")) {
                        setErrorMessage("Password should be at least 6 characters");
                    }
                }
            }
        })
        .catch(error => {
            // In case the fetch fails
            Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
        });
        // All validations passed
    };

    const toSignIn = () => {
        navigation.navigate('SignIn');
    }


    const onChange = ({ type }, selctedDate) => {
        if (type == 'set') {
            const currentDate = selctedDate
            setDate(currentDate)
        }
        else {
            toggleDatepicker()
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require("../../assets/logo.png")}
                    style={styles.logo}
                />
                <Text style={styles.title}>Sign Up</Text>
            </View>

            <View style={styles.row}>
                <View style={styles.halfInputContainer}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize='none'
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Jesse"
                    />
                </View>
                <View style={[styles.halfInputContainer, styles.inputPaddingLeft]}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize='none'
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Doe"
                    />
                </View>
            </View>

            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={email}
                onChangeText={setEmail}
                placeholder="hello@123.com"
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={username}
                onChangeText={setUsername}
                placeholder="username"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={password}
                onChangeText={setPassword}
                placeholder="password"
                secureTextEntry={true}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
                style={styles.input}
                autoCapitalize='none'
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="password"
                secureTextEntry={true}
            />

            <Text style={styles.label}>Birthday</Text>
            <Pressable onPress={toggleDatepicker} style={styles.datePressable}>
                <Text>{date.toLocaleDateString()}</Text>
            </Pressable>

            {show && (
                <View>
                    <DateTimePicker mode="date" display="spinner" value={date} onChange={onChange} style={{ height: 120 }} maximumDate={new Date()}/>

                        <View style={styles.centeredRow}>
                            <Pressable style={styles.doneButton} onPress={toggleDatepicker}>
                                <Text style={styles.buttonText}>Done</Text>
                            </Pressable>
                        </View>
                </View>
            )}

            {!show && (
                <View style={styles.centeredRow}>
                    <Pressable style={styles.signUpButton} onPress={submit}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </Pressable>
                </View>
            )}

            {errorMessage.length > 0 && (
                <View style={styles.centeredRow}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            )}

            <View style={styles.footer}>
                <Pressable onPress={toSignIn} >
                    <Text style={styles.linkText}>Already have an account?</Text>
                    <Text style={[styles.linkText, styles.bold]}> Sign in Here</Text>
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
        justifyContent: 'center',

    },
    logoContainer: {
        marginBottom: 16,
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
    halfInputContainer: {
        width: '50%',
    },
    inputPaddingLeft: {
        paddingLeft: 4,
    },
    label: {
        color: 'gray',
        marginBottom: 4,
    },
    input: {
        marginBottom: 8,
        height: 32,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'dodgerblue',
    },
    datePressable: {
        height: 32,
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
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
        textAlign:'center'
    },
    bold: {
        fontWeight: 'bold',
    },
});

export default SignUpScreen;