// Initialize Stripe with optional secret key (graceful if missing)
const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.Stripe_SECRET_KEY;
const stripe = stripeKey ? require('stripe')(stripeKey) : null;

const createSubscriptionIntent = async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(503).json({
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      });
    }

    // You should get the customer ID from your DB or create a new one if needed
    const { userId, amount, currency } = req.body;

    // Create a PaymentIntent for the subscription
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // e.g., 999 for $9.99
      currency, // e.g., 'usd'
      customer: userId, // Assuming userId is stored in req.user
      description: 'User profile subscription',
      // You can add more options as needed
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { createSubscriptionIntent };
