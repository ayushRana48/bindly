import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Group, RootStackParamList, User } from "../../../types"
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { useGroupsContext } from "../../GroupsContext";
import { useUserContext } from "../../../UserContext";

import blobToBase64 from "../../../utils/blobToBase64"
import compressImage from "../../../utils/compressImage"

// @ts-ignore
import backArrow from "../../../assets/backArrow.png"

import { checkToken } from "../../../utils/checkToken"

type GroupCreationScreen2RouteProp = RouteProp<RootStackParamList, "GroupCreation2">

const GroupCreationScreen2: React.FC = () => {
  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() + 30);


  const [startDate, setStartDate] = useState(minDate)
  const [weeks, setWeeks] = useState(0)
  const [tasksPerWeek, setTasksPerWeek] = useState(0)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const route = useRoute<GroupCreationScreen2RouteProp>()
  const { groupName, description, buyIn, imageSrc } = route.params
  const [loading, setLoading] = useState(false)




  const { user, setUser } = useUserContext()
  const { setGroups, setGroupData } = useGroupsContext()


  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      console.log('selectedDate in onDateChange', selectedDate);
        setStartDate(selectedDate);
    } else {
        toggleDatePicker();
    }
};


  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const formatLocalDateTime = (date: Date) => {
    return date.toLocaleTimeString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};



  const submit = async () => {
    if (loading) return; // Prevent double click
    setLoading(true);

    // Validate inputs
    if (!groupName.trim()) {
      setErrorMessage("Enter Group Name");
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Please enter description.");
      setLoading(false);
      return;
    }

    if (!startDate) {
      setErrorMessage("Please enter start date.");
      setLoading(false);
      return;
    }

    if (!weeks) {
      setErrorMessage("Please enter number of weeks.");
      setLoading(false);
      return;
    }

    if (buyIn < 0 || isNaN(buyIn)) {
      setErrorMessage("Buy-in must be a positive number or zero.");
      setLoading(false);
      return;
    }


    if (!tasksPerWeek) {
      setErrorMessage("Please enter number of tasks per week");
      setLoading(false);
      return;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + weeks * 7);

    let img = imageSrc;

    let imgBase64 = "";

    if (img.uri) {
      try {
        const compressedUri = await compressImage(img.uri);
        const response = await fetch(compressedUri);
        const blob = await response.blob();
        imgBase64 = await blobToBase64(blob);
      } catch (error) {
        console.log("Error compressing or converting image: ", error);
        setErrorMessage("Error processing image. Please try again.");
        setLoading(false);
        return;
      }
    }

    // Convert dates to UTC
    const startTime = new Date(startDate)
    const endTime = new Date(endDate)
    startTime.setSeconds(0, 0)
    endTime.setSeconds(0, 0)

    const startDateUTC = startTime.toISOString();
    const endDateUTC = endTime.toISOString();

  

    try {
      const token = await checkToken();
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/group/createGroup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          groupname: groupName,
          description: description,
          buyin: buyIn,
          startdate: startDateUTC,
          enddate: endDateUTC,
          hostId: user?.username,
          image: imgBase64,
          tasksperweek: tasksPerWeek
        }),
      });

      const { status, body } = await response.json().then(data => ({ status: response.status, body: data }));

      if (status === 200) {
        console.log(body, 'body\n')
        setGroups((g: Group[]) => {
          if (Array.isArray(g)) {
            return [...g, body];
          } else {
            return [body];
          }
        });


        setGroupData({
          group: body,
          usergroup: [{
            groupid: body.groupid, // Assuming body contains the groupid
            username: user?.username || '',
            tokens: [],
            users: user || undefined
          }],
          invite: [],
          post: []
        });

        setUser((u: User | null) => {
          if (!u) return null; // Handle the case where user is null
          return {
            ...u,
            balance: u.balance - buyIn,
          };
        });

        navigation.navigate("Group", { groupData: body });

      } else {
        if (body.error === "Insufficient Funds") {
          setErrorMessage("Insufficient jkFunds, lower buy in");
        } else {
          setErrorMessage(body.error || "An error occurred. Please try again.");
        }
      }
    } catch (error) {
      Alert.alert("Network Error", "Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Image style={{ height: 40, width: 40 }} source={backArrow} />
        </Pressable>

        <View style={styles.logoContainer}>
          <Text style={styles.title}>Group Details</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Start Date</Text>
          <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
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
              minimumDate={minDate}
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
            value={weeks.toString()}
            onChangeText={(text) => setWeeks(parseInt(text, 10) || 0)}
            placeholder="Enter number of weeks"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tasks per Week</Text>
          <TextInput
            style={styles.input}
            value={tasksPerWeek.toString()}
            onChangeText={(text) => setTasksPerWeek(parseInt(text, 10) || 0)}
            placeholder="Enter tasks per week"
            keyboardType="numeric"
          />
          <Text style={styles.infoText}>Maximum amount that someone can do a task in a week</Text>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {!showDatePicker && <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={submit}
          >
            <Text style={styles.buttonText}>Create Group</Text>
          </Pressable>
        </View>}
        
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 32,
    flexGrow: 1,
  },
  backArrow: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    zIndex: 10,
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
  inputContainer: {
    marginBottom: 16,
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
    justifyContent: "center",
  },
  infoText: {
    color: "gray",
    fontSize: 12,
    marginTop: 4,
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
 
  buttonPressed: {
    backgroundColor: "#1E90FF",
    opacity: 0.9,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 16,
  },
  centeredRow: {
    alignItems: 'center',
    marginTop: 16,
},


})

export default GroupCreationScreen2

