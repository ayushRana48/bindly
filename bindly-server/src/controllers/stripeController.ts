import { Request, Response } from 'express';
import { addMoney, getSavedCards, saveCard } from '../transactions/stripeTransactions';
import { stripe } from '../initStripe';
import { supabase } from '../initSupabase';

async function saveCardController(req: Request, res: Response) {
  const { email } = req.body;

  //@ts-ignore
  const { setupIntent, ephemeralKey, customer, error } = await saveCard(email);

  if (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : error 
    });
  }

  return res.status(200).json({
    setupIntent,
    ephemeralKey,
    customer,
  });
}

async function addMoneyController(req: Request, res: Response) {
  const { customerId, amount, cardId, username } = req.body;

  try {
    const { data, error } = await addMoney(customerId, amount, cardId, username);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function detachOldPaymentMethods(req: Request, res: Response) {
  const { customerId, cardId } = req.body;

  try {
    await stripe.paymentMethods.detach(cardId);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function getSavedCardsController(req: Request, res: Response) {
  const { customerId } = req.params;

  try {
    const { data, error } = await getSavedCards(customerId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

export { 
  saveCardController, 
  addMoneyController, 
  getSavedCardsController, 
  detachOldPaymentMethods 
};