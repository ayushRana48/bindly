import fetch from 'node-fetch';
import { getAccessToken } from './paypalHelper/tokenUtility';
import { supabase } from '../initSupabase';
import { DatabaseResponse } from '../types';

const BASE_URL = 'https://api-m.paypal.com';

interface PayoutItem {
  recipient_type: 'EMAIL' | 'PHONE';
  amount: {
    value: number;
    currency: string;
  };
  receiver: string;
  note: string;
  sender_item_id: string;
  recipient_wallet?: 'Venmo';
}

interface PayoutRequest {
  sender_batch_header: {
    sender_batch_id: string;
    email_subject: string;
  };
  items: PayoutItem[];
}

interface PayoutResponse {
  batch_header: {
    payout_batch_id: string;
    batch_status: string;
  };
  // Add other PayPal response fields as needed
}

async function createPayout(
  user_id: string, 
  recipient_email: string, 
  amount: number, 
  is_venmo: boolean
): Promise<DatabaseResponse<PayoutResponse>> {
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('balance')
    .eq('username', user_id)
    .single();

  if (userError) {
    return { data: null, error: new Error(userError.message) };
  }

  const balance = parseFloat(userData.balance);

  if (balance < amount) {
    return { data: null, error: new Error('Cannot withdraw more than balance') };
  }

  try {
    const accessToken = await getAccessToken();

    const payout: PayoutRequest = {
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
      payout.items[0].recipient_type = 'PHONE';
      payout.items[0].recipient_wallet = 'Venmo';
    }

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
      return { data: null, error: new Error(JSON.stringify(payoutData)) };
    }

    const newBalance = balance - amount;

    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('username', user_id);

    if (updateError) {
      return { data: null, error: new Error(updateError.message) };
    }

    return { data: payoutData, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function checkPayoutStatus(batchId: string): Promise<DatabaseResponse<PayoutResponse>> {
  try {
    const accessToken = await getAccessToken();
    
    const response = await fetch(`${BASE_URL}/v1/payments/payouts/${batchId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { data: null, error: new Error(JSON.stringify(data)) };
    }
    
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

export { createPayout, checkPayoutStatus };