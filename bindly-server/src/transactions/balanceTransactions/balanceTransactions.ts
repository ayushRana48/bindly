import { supabase } from "../../initSupabase";
import { v4 as uuidv4 } from 'uuid';

async function createPendingBalanceTransaction(
  transactionType: string,
  username: string,
  amount: number
) {
  const time = new Date().toISOString();

  const { data, error } = await supabase
    .from('balance_transaction')
    .insert({
      id: uuidv4(),
      time: time,
      transactionType: transactionType,
      username: username,
      amount: amount,
      error: null,
      state: 'Pending', // Add a state to track progress
    })
    .select()
    .single();

  if (error) {
    console.log("Failed to create pending transaction", error)
    return { data: null, error: new Error(`Failed to create pending transaction: ${error.message}`) };
  }

  console.log("Pending transaction created in balance_transaction", data.id)

  return { data, error: null };
}



async function finalizeBalanceTransaction(
  id: string,
  state: 'Success' | 'Fail',
  username: string,
  amount: number,
  errorMessage?: string | null
) {
  const time = new Date().toISOString();

  let newBalance = 0;
  let oldBalance = 0

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('balance')
    .eq('username', username)
    .single();


  if (userError) {
    throw new Error(`Failed to fetch user balance: ${userError.message}`);
  }


  oldBalance = userData.balance

  
  newBalance = userData.balance + amount;

  if(state === 'Fail'){
    newBalance=oldBalance
  }

  try {
    // For "Success," update the user balance
    if (state === 'Success') {
      console.log('in success space')

      if (newBalance < 0) {
        console.log('throw insufficient funds')
        throw new Error('Insufficient Funds');
      }

      const { error: balanceUpdateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('username', username);

      if (balanceUpdateError) {
        throw new Error(`Failed to update user balance: ${balanceUpdateError.message}`);
      }
    }

    // Update the balance transaction state to "Success"
    const { data, error } = await supabase
      .from('balance_transaction')
      .update({
        state: state, // "Success"
        error: errorMessage || null,
        time: time,
      })
      .eq('id', id)
      .select()
      .single();

    return { newBalance, error };
  } catch (err: any) {
    console.log(`Error in finalizeBalanceTransaction: ${err.message}`);

    // Update the balance transaction state to "Fail"
    const { data: failData, error: failError } = await supabase
      .from('balance_transaction')
      .update({
        state: 'Fail', // Change state to "Fail"
        error: err.message || 'Unknown error',
        time: time,
      })
      .eq('id', id)
      .select()
      .single();

    return { newBalance: oldBalance, error: failError || err };
  }
}



export { createPendingBalanceTransaction, finalizeBalanceTransaction };