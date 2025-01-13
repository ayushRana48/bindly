import { supabase } from "../../initSupabase";
import { createPendingBalanceTransaction, finalizeBalanceTransaction } from "./balanceTransactions";

async function createGroupBalanceTransaction(
  username: string,
  groupid: string,
  subtype: string,
  amount: number,
  errorMessage?: string | null
) {
  // Create a pending transaction
  console.log("about to create pending transaction", username, groupid,amount)

  const { data: pendingTransaction, error: pendingError } = await createPendingBalanceTransaction('Group', username, amount);
  if (pendingError) {
    console.log(pendingError,' rerrie')
    return { data: null, error: pendingError };
  }

  try {
    // Insert child transaction into `balance_group_transaction`
    const { data: groupData, error: groupError } = await supabase
      .from('balance_group_transaction')
      .insert({
        id: pendingTransaction.id,
        groupid: groupid,
        type: subtype,
      });

    if (groupError) {
      // Mark the parent transaction as failed
      console.log('group error', groupError)
      const {newBalance, error} = await finalizeBalanceTransaction(pendingTransaction.id, 'Fail', username, amount, `Child transaction failed: ${groupError.message}`);
      return { newBalance, error: new Error(`Child transaction failed: ${groupError.message}`) };
    }

    // Finalize the transaction as successful
    console.log('bow finalize')
    const {newBalance, error}= await finalizeBalanceTransaction(pendingTransaction.id, 'Success', username, amount);
    return { newBalance, error };

  } catch (error) {
    // Mark the parent transaction as failed in case of any unexpected error
    const {newBalance}= await finalizeBalanceTransaction(pendingTransaction.id, 'Fail', username, amount, error instanceof Error ? error.message : 'Unknown error');
    return {newBalance, error: error instanceof Error ? error : new Error('Unknown error occurred.') };
  }
}

export { createGroupBalanceTransaction };
