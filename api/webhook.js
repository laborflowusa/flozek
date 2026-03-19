// Import Stripe package
import Stripe from 'stripe';

// Initialize Stripe with your secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Set the webhook signing secret from environment variables
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Required for Vercel / Next.js API routes
export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body for signature verification
  },
};

// Helper function to convert readable stream to raw body
const buffer = async (readable) => {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

// Main webhook handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  let event;

  try {
    // Get raw body from request
    const rawBody = await buffer(req);

    // Retrieve the Stripe signature from headers
    const signature = req.headers['stripe-signature'];

    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Checkout session completed:', session.id);
      // TODO: Add your fulfillment logic here (e.g., update database)
      break;

    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('💰 Payment succeeded:', paymentIntent.id);
      // TODO: Add post-payment logic here
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt
  res.status(200).send('Webhook received');
}