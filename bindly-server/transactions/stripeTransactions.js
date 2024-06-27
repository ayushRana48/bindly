const { stripe } = require('../initStripe.js');
const { supabase } = require('../initSupabase');



async function saveCard(email) {
  console.log('email',email)
  let customer;

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
      { apiVersion: '2024-06-20' }
  );
  const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
  });


  const { data, error } = await supabase
  .from('users')
  .update({ stripeid: customer.id })
  .eq('email', email);

  if (error) {
      return {error};
  }

  console.log({
    setupIntent: setupIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
})

  return {
      setupIntent: setupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
  };
}


const addMoney = async (customerId, amount, cardId, username) => {
  try {
    console.log('inTransactions')

    const { data, error } = await supabase
      .from('users')
      .select('balance')
      .eq('username', username)
      .single();

    const newBalance = parseFloat(data.balance) + parseFloat(amount)
    console.log(newBalance,'ballaance')


    const { data: supabaseData, error: supabaseError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('username', username)
      .select()
      .single()

    if (supabaseError) {
      return { error: supabaseError }
    }

    console.log(supabaseData,'suppaa')


    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // amount in cents
      currency: 'usd',
      customer: customerId,
      payment_method: cardId,
      off_session: true,
      confirm: true,
    });

    return { data: paymentIntent };
  } catch (error) {
    return { error };
  }
};


async function withdrawMoney(customerId, amount) {

  try {
    const transfer = await stripe.transfers.create({
      amount: amount * 100,
      currency: 'usd',
      destination: customerId, // Assuming you have the customer's bank account or card ID
    });

    return { data: transfer }
  } catch (error) {
    return { error }
  }
}

// Fetch saved cards
async function getSavedCards(customerId) {

  try {
    const cards = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return ({ data: cards })
  } catch (error) {
    return { error }
  }
}

module.exports = { saveCard, addMoney, withdrawMoney, getSavedCards };