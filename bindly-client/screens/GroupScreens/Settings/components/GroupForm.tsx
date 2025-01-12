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
            <Pressable onPress={toggleDatePicker} style={styles.datePressable}>
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
               minimumDate={tomorrow}
           />
           <View style={styles.centeredRow}>
               <Pressable style={styles.doneButton} onPress={toggleDatePicker}>
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

        <View style={styles.inputContainer}>
            <Text style={styles.label}>Buy In</Text>
            <TextInput
                style={styles.input}
                value={buyIn.toString()}
                onChangeText={(text) => setBuyIn(parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholder="Buy In"
            />
        </View>

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
        textAlign: 'center',
    },
    bold: {
        fontWeight: 'bold',
    },
    
    
});

export default GroupForm;
