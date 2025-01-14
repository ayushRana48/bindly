import { supabase } from '../../../initSupabase';
import { v4 as uuidv4 } from 'uuid';
async function updateUserBalance(
    username: string,
    netMoney: number,
    groupId: string
  ): Promise<{ error: Error | null }> {
    try {
      const time = new Date().toISOString();
  
      // Fetch current balance for the user
      const { data: userData, error: userFetchError } = await supabase
        .from("users")
        .select("balance")
        .eq("username", username)
        .single();
  
      if (userFetchError || !userData) {
        return { error: new Error("Failed to fetch user balance for: " + username) };
      }
  
      const currentBalance = userData.balance;
      const newBalance = currentBalance + netMoney;
  
      // Generate transaction ID
      const transactionId = uuidv4();
  
      // Log balance transaction
      const balanceTransaction = {
        id: transactionId,
        time,
        transactionType: "Group",
        username,
        amount: netMoney,
        state: "Success",
        error: null,
      };
  
      const { error: balanceLogError } = await supabase
        .from("balance_transaction")
        .insert(balanceTransaction);
  
      if (balanceLogError) {
        return { error: new Error("Failed to log balance transaction for: " + username) };
      }
  
      // Log group transaction
      const groupTransaction = {
        id: transactionId,
        groupid: groupId,
        type: "BuyIn",
      };
  
      const { error: groupLogError } = await supabase
        .from("balance_group_transaction")
        .insert(groupTransaction);
  
      if (groupLogError) {
        return { error: new Error("Failed to log group transaction for: " + username) };
      }
  
      // Update user balance
      const { error: balanceUpdateError } = await supabase
        .from("users")
        .update({ balance: newBalance })
        .eq("username", username);
  
      if (balanceUpdateError) {
        return { error: new Error("Failed to update balance for: " + username) };
      }
  
      return { error: null };
    } catch (error) {
      console.error("Error in updateUserBalance:", error);
      return { error: error instanceof Error ? error : new Error("Unknown error") };
    }
  }


  export { updateUserBalance }