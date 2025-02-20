import type React from "react";
import { View, Text, StyleSheet, Pressable, Alert, Linking } from "react-native";
import { useUserContext } from "../../../UserContext";
// @ts-ignore
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { checkToken } from "../../../utils/checkToken";
// import RNBraintreeDropIn from 'react-native-braintree-dropin-ui';

interface BalanceItemProps {
  payer: string;
  receiver: string;
  amount: number;
  isPaid: boolean;
  groupId?: string;
}

const BalanceItem: React.FC<BalanceItemProps> = ({ payer, receiver, amount, isPaid, groupId }) => {
  const { user } = useUserContext();
  const amReceiver = receiver === user?.username;

  const handleAction = async () => {
    if (amReceiver) {
      try {
        const token = await checkToken();
        const response = await fetch(
          `https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/balanceNotification`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ initiator: user?.username, receiver: payer }),
          }
        );
        const data = await response.json();
        Alert.alert(data.error || data.message || "Notification sent");
      } catch (error) {
        console.error("Error notifying:", error);
        Alert.alert("Error", "Failed to send notification.");
      }
    } else {
      try {
        // **1. Get Braintree client token from your backend**
        const clientTokenRes = await fetch(`http://localhost:3000/bindly/venmoBalance/getClientToken`);
        const { clientToken } = await clientTokenRes.json();
  
        if (!clientToken) {
          throw new Error("Failed to fetch Braintree client token.");
        }
  
        // **2. Open Braintree Drop-In UI**
        const result = await showDropIn({
          clientToken,
          googlePay: false,
          applePay: false,
          venmo: true, // Enable Venmo
          paypal: false,
        });
  
        if (result) {
          console.log("Payment successful! Nonce:", result.nonce);
  
          // **3. Send payment nonce to backend to process the transaction**
          const checkoutResponse = await fetch(`https://your-backend.com/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentMethodNonce: result.nonce,
              amount: amount.toFixed(2), // Ensure amount is formatted properly
            }),
          });
  
          const checkoutData = await checkoutResponse.json();
  
          if (checkoutData.success) {
            Alert.alert("Payment Successful!", `Transaction ID: ${checkoutData.transactionId}`);
          } else {
            throw new Error(checkoutData.message || "Payment failed.");
          }
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        Alert.alert("Payment Failed", error.message || "An error occurred.");
      }
    }
  };
  
  const groupName = groupId?.split("-**-")[1];
  const groupId2 = groupId?.split("-**-")[0].slice(-4);

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <View>
          <Text style={styles.name}>
            {amReceiver ? `${payer} owes you` : `You owe ${receiver}`}
          </Text>
          {groupId && <Text style={styles.groupName}>From {groupName} #{groupId2}</Text>}
        </View>
        <View style={styles.rightContainer}>
          <Text style={[styles.amount, { color: amReceiver ? "#4CAF50" : "#FF3B30" }]}>
            ${Math.abs(amount).toFixed(2)}
          </Text>
          {!isPaid && (
            <View>
              <Pressable style={styles.actionButton} onPress={handleAction}>
                <Icon name={amReceiver ? "bell-ring-outline" : "cash-fast"} size={24} color="#FFFFFF" />
              </Pressable>
              <Text style={{ textAlign: "center" }}>{amReceiver ? "Nudge" : "Pay"}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 17,
    color: "#000",
  },
  groupName: {
    fontSize: 13,
    color: "#8E8E93",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  amount: {
    fontSize: 17,
    fontWeight: "600",
  },
  actionButton: {
    backgroundColor: "#007AFF",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default BalanceItem;
