const fetch = require('node-fetch');
const { getAccessToken } = require('./tokenUtility');
const { supabase } = require('../initSupabase');

const BASE_URL = 'https://api-m.paypal.com';

async function createPayout(user_id, recipient_email, amount, is_venmo) {
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('username', user_id)
        .single();

    if (userError) {
        return { error: userError };
    }

    const balance = parseFloat(userData.balance);

    if (balance < amount) {
        return { error: { message: 'Cannot withdraw more than balance' } };
    }

    try {
        const accessToken = await getAccessToken();

        console.log('Got the access token', accessToken);

        let payout = {
            sender_batch_header: {
                sender_batch_id: `Payouts_${Math.random()}`,
                email_subject: 'You have a payout!'
            },
            items: [{
                recipient_type: 'EMAIL',
                amount: {
                    value: amount,
                    currency: 'USD'
                },
                receiver: recipient_email,
                note: is_venmo ? 'Thanks for your service! (Sent to your Venmo account)' : 'Thanks for your service!',
                sender_item_id: user_id
            }]
        };

        if (is_venmo) {
            payout.items[0].recipient_wallet = "Venmo";
            payout.items[0].recipient_type = "PHONE";
        }

        console.log(payout, 'payout');

        const response = await fetch(`${BASE_URL}/v1/payments/payouts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payout)
        });

        const payoutData = await response.json();

        if (!response.ok) {
            return { error: payoutData };
        }

        const newBalance = balance - parseFloat(amount);
        console.log(payoutData, 'payout data');

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('username', user_id)
            .single();

        if (updateError) {
            console.log(updateError, 'Update error');
            return { error: updateError };
        }

        console.log(updatedUser, 'Updated user data');
        return {payoutData };
    } catch (error) {
        return { error };
    }
}

module.exports = { createPayout };
