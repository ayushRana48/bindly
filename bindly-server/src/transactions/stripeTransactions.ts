import { stripe } from '../initStripe';
import { supabase } from '../initSupabase';
import { DatabaseResponse, User } from '../types';
import Stripe from 'stripe';

interface SaveCardResponse {
  setupIntent: string;
  ephemeralKey: string;
  customer: string;
}

async function saveCard(email: string): Promise<DatabaseResponse<SaveCardResponse>> {
  try {
    let customer: Stripe.Customer;

    // Fetch or create customer
    const customers = await stripe.customers.list({
      email,
      limit: 1
    });

    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({ email });
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-04-10' }
    );

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
    });

    const { error } = await supabase
      .from('users')
      .update({ stripeid: customer.id })
      .eq('email', email);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    console.log({
      setupIntent: setupIntent.client_secret ?? '',
      ephemeralKey: ephemeralKey.secret ?? '',
      customer: customer.id,
    }, 'from the transactions data')
    return {
      data: {
        setupIntent: setupIntent.client_secret ?? '',
        ephemeralKey: ephemeralKey.secret ?? '',
        customer: customer.id,
      },
      error: null
    };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function addMoney(
  customerId: string, 
  amount: number, 
  cardId: string, 
  username: string
): Promise<DatabaseResponse<Stripe.PaymentIntent>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('balance')
      .eq('username', username)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const newBalance = parseFloat(data.balance) + amount;

    const { error: supabaseError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('username', username);

    if (supabaseError) {
      return { data: null, error: new Error(supabaseError.message) };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // amount in cents
      currency: 'usd',
      customer: customerId,
      payment_method: cardId,
      off_session: true,
      confirm: true,
    });

    return { data: paymentIntent, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function withdrawMoney(
  customerId: string, 
  amount: number
): Promise<DatabaseResponse<Stripe.Transfer>> {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      destination: customerId,
    });

    return { data: transfer, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function getSavedCards(
  customerId: string
): Promise<DatabaseResponse<Stripe.ApiList<Stripe.PaymentMethod>>> {
  try {
    const cards = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return { data: cards, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

export { saveCard, addMoney, withdrawMoney, getSavedCards };