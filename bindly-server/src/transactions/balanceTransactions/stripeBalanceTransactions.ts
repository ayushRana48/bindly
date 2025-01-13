import { supabase } from "../../initSupabase";
import { createPendingBalanceTransaction, finalizeBalanceTransaction } from "./balanceTransactions";


async function createPendingStripeBalanceTransaction(
    cardid: string,
    amount: number,
    username: string
) {
    console.log("Creating pending stripe transaction")
    const { data, error } = await createPendingBalanceTransaction('Stripe', username, amount);
    if (error) {
        return { data: null, error: new Error(`Failed to create pending transaction: ${error.message}`) };
    }

    console.log("Pending transaction created in stripe_balance_transaction", data.id)
    const transactionId = data.id;

    // Insert into `balance_stripe_transaction` with the pending state
    const { data: stripeData, error: stripeError } = await supabase.from('balance_stripe_transaction').insert({
        id: transactionId,
        cardid: cardid,
        state: 'Pending',
        timeinitiated: new Date(),
    });

    if (stripeError) {
        console.log("Failed to create pending Stripe transaction", stripeError)
        return { data: null, error: new Error(`Failed to create pending Stripe transaction: ${stripeError.message}`) };
    }

    return { data: { transactionId, stripeData }, error: null };
}


async function finalizeStripeBalanceTransaction(
    id: string,
    cardid: string,
    state: 'Success' | 'Fail',
    timeconfirmed: Date,
    username: string,
    amountNumber: number,
    errorMessage?: string | null
) {
    await finalizeBalanceTransaction(id, state, username, amountNumber, errorMessage);

    
    const { data, error } = await supabase.from('balance_stripe_transaction').update({
        state: state,
        timeconfirmed: timeconfirmed,
    }).eq('id', id);

    if (error) {
        return { data: null, error: new Error(`Failed to finalize Stripe transaction: ${error.message}`) };
    }

    return { data, error: null };
}



export { createPendingStripeBalanceTransaction,finalizeStripeBalanceTransaction };
