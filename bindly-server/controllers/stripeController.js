const { addMoney, getSavedCards, saveCard } = require('../transactions/stripeTransactions');
const { stripe } = require('../initStripe.js');
const { supabase } = require('../initSupabase');


// Save card2
async function saveCardController(req, res) {
  const {
    email,
  } = req.body;

  const {
    setupIntent,
    ephemeralKey,
    customer,
    error
  } = await saveCard(email)

  if (error) {
    res.status(400).json({ error });
    return;
  }



  console.log(
    'in controlllleaaaaaaaa'
  )

  console.log({
    setupIntent,
    ephemeralKey,
    customer
})
  

  return res.status(200).json({
        setupIntent: setupIntent,
        ephemeralKey: ephemeralKey,
        customer: customer,
    });

}


// Add money to balance
async function addMoneyController(req, res) {
  const { customerId, amount, cardId, username } = req.body;

  console.log('addMoney')

  try {
    const { data, error } = await addMoney(customerId, amount, cardId, username);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



async function detachOldPaymentMethods(req, res) {
  const { customerId, cardId } = req.body;

  console.log(customerId)

  console.log(cardId)

  try {
    await stripe.paymentMethods.detach(cardId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error detaching payment method:', error);
    res.status(500).json({ error: error.message });
  }
}


// Fetch saved cards
async function getSavedCardsController(req, res) {
  const { customerId } = req.params;
  console.log('call')
  console.log(customerId)

  console.log('call GET SAVED CARDSSS')

  try {
    const { data, error } = await getSavedCards(customerId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { saveCardController, addMoneyController, getSavedCardsController, detachOldPaymentMethods };
