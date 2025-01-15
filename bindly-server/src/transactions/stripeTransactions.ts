import { stripe } from '../initStripe';
import { PrismaClient } from '@prisma/client';
import { DatabaseResponse, User } from '../types';
import Stripe from 'stripe';
import { createPendingStripeBalanceTransaction, finalizeStripeBalanceTransaction } from './balanceTransactions/stripeBalanceTransactions';

const prisma = new PrismaClient();

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

    await prisma.users.update({
      where: { email },
      data: { stripeid: customer.id }
    });

    console.log({
      setupIntent: setupIntent.client_secret ?? '',
      ephemeralKey: ephemeralKey.secret ?? '',
      customer: customer.id,
    }, 'from the transactions data');

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
  amount: string,
  cardId: string,
  username: string
): Promise<DatabaseResponse<Stripe.PaymentIntent>> {
  const amountNumber = parseFloat(amount);

  if (isNaN(amountNumber) || amountNumber <= 0) {
    return {
      data: null,
      error: new Error('Invalid amount provided.'),
    };
  }
  let transactionId = "";

  try {
    console.log("Creating pending transaction");
    // Step 1: Create Pending Transaction
    const { data: pendingTransaction, error: pendingError } = await createPendingStripeBalanceTransaction(
      prisma,
      cardId,
      amountNumber,
      username
    );

    if (pendingError) {
      return { data: null, error: pendingError };
    }

    transactionId = pendingTransaction.transactionId;
    console.log('now creating stripe payment intent', transactionId);

    // Step 2: Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountNumber * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      payment_method: cardId,
      off_session: true,
      confirm: true,
    });
    console.log('Stripe PaymentIntent created:', ' now finalizing stripe transaction');

    // Step 3: Finalize on Success
    await finalizeStripeBalanceTransaction(prisma,transactionId, cardId, 'Success', new Date(), username, amountNumber, null);

    console.log("Stripe transaction finalized");
    return { data: paymentIntent, error: null };
  } catch (error: any) {
    console.log('Error in addMoney:', error.message);

    // Step 4: Finalize on Failure
    await finalizeStripeBalanceTransaction(prisma,transactionId, cardId, 'Fail', new Date(), username, amountNumber, error.message);

    return { data: null, error: new Error('Payment failed.') };
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