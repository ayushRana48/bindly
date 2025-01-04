import Stripe from 'stripe';

// Replace this with your secret key by setting it in an environment variable or directly in code (not recommended for production)
const secretKey = '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';
// const secretKey = 'sk_test_51PVKUSBgzlfK4h49tBChOo2Da6guBHjIHM0uIsmM6VRS2osV5toT0kDcNoqNyZNRcwJlMPmvuGeXjKW61EP8pirO00PseMscAg';

// Initialize Stripe with your secret key
const stripe = new Stripe(secretKey, {
  apiVersion: '2024-04-10', // Make sure to match your API version
});

// Export the initialized Stripe object
export { stripe };