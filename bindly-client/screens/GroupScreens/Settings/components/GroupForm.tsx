import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface GroupFormProps {
    groupName: string;
    setGroupName: (name: string) => void;
    description: string;
    setDescription: (desc: string) => void;
    startDate: Date;
    numWeeks: number;
    setNumWeeks: (weeks: number) => void;
    buyIn: number;
    setBuyIn: (amount: number) => void;
    taskPerWeek: number;
    setTaskPerWeek: (tasks: number) => void;
    formatLocalDateTime: (date: Date) => string;
    showDatePicker: boolean;
    toggleDatePicker: () => void;
    onDateChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
    isEditScreen: boolean;
}

const GroupForm: React.FC<GroupFormProps> = ({
    groupName,
    setGroupName,
    description,
    setDescription,
    startDate,
    numWeeks,
    setNumWeeks,
    buyIn,
    setBuyIn,
    taskPerWeek,
    setTaskPerWeek,
    formatLocalDateTime,
    showDatePicker,
    toggleDatePicker,
    onDateChange,
    isEditScreen
}) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
    <View>
        <View style={styles.inputContainer}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
                style={styles.input}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Group Name"
            />
        </View>

        <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Description"
            />
        </View>

        <View style={styles.inputContainer}>
            <Text style={styles.label}>Start Date</Text>
            <Pressable onPress={toggleDatePicker} style={styles.input}>
                <Text>{formatLocalDateTime(startDate)}</Text>
            </Pressable>
        </View>

        {showDatePicker && (
           <View>
           <DateTimePicker
               mode="datetime"
               display="spinner"
               value={startDate}
               onChange={onDateChange}
               style={{ height: 120 }}
               minimumDate={isEditScreen ? startDate : tomorrow}
           />
           <View style={styles.centeredRow}>
               <Pressable  style={({ pressed }) => [styles.doneButton, pressed && styles.buttonPressed]} onPress={toggleDatePicker}>
                   <Text style={styles.buttonText}>Done</Text>
               </Pressable>
           </View>
       </View>
        )}

        <View style={styles.inputContainer}>
            <Text style={styles.label}>Weeks</Text>
            <TextInput
                style={styles.input}
                value={numWeeks.toString()}
                onChangeText={(text) => setNumWeeks(parseInt(text, 10) || 0)}
                keyboardType="numeric"
                placeholder="Weeks"
            />
        </View>

        {!isEditScreen &&  <View style={styles.inputContainer}>
            <Text style={styles.label}>Buy In</Text>
            <TextInput
                style={styles.input}
                value={buyIn.toString()}
                onChangeText={(text) => setBuyIn(parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholder="Buy In"
            />
        </View>
}
        <View style={styles.inputContainer}>
            <Text style={styles.label}>Tasks Per Week</Text>
            <TextInput
                style={styles.input}
                value={taskPerWeek.toString()}
                onChangeText={(text) => setTaskPerWeek(parseInt(text, 10) || 0)}
                keyboardType="numeric"
                placeholder="Tasks Per Week"
            />
        </View>
    </View>
    )
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 24,
        flexGrow: 1,
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
        width: 80,
        height: 80,
    },
    cancel: {
        position: 'absolute',
        top: 30,
        left: 10,
        height: 40,
        width: 50,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    logoContainer: {
        marginTop: 36,
        marginBottom: 36,
        alignItems: 'center',
    },
    title: {
        marginTop: 8,
        fontSize: 24,
        fontWeight: 'bold',
    },
    label: {
        color: 'gray',
        marginBottom: 4,
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        height: 40,
        backgroundColor: "#f8f8f8",
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        fontSize: 16,
        justifyContent: "center",
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
        textAlign: 'center',
    },
    bold: {
        fontWeight: 'bold',
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
      doneButton: {
        backgroundColor: "dodgerblue",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        width: 130,
        marginBottom:16
      },
     
    
    
});

export default GroupForm;
