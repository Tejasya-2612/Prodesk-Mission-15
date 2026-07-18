import Stripe from 'stripe';

export async function createCheckoutSession(req, res) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePriceId = process.env.STRIPE_PRICE_ID;

    if (!stripeSecretKey || !stripePriceId) {
      return res.status(500).json({ message: 'Stripe keys are not configured' });
    }

    if (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_')) {
      return res.status(500).json({ message: 'Stripe secret key must start with sk_test_ or sk_live_' });
    }

    if (!stripePriceId.startsWith('price_')) {
      return res.status(500).json({
        message: 'Stripe price ID must start with price_. Use a Stripe Price ID, not a Product ID.'
      });
    }

    const stripe = new Stripe(stripeSecretKey);
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: stripePriceId,
          quantity: 1
        }
      ],
      success_url: `${clientUrl}/success`,
      cancel_url: `${clientUrl}/checkout-cancel`,
      customer_email: req.user.email,
      metadata: {
        userId: req.user._id.toString()
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout failed:', error.message);
    res.status(500).json({ message: error.message || 'Stripe checkout failed' });
  }
}
