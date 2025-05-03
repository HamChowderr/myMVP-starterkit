import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Required for signature verification and Stripe API calls
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize Stripe client if secret key is available
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2025-04-30.basil' })
  : null;

// Initialize Supabase client using environment variables
// These must be set in .env.local for local development and in your hosting platform for production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl!, supabaseKey!);

// Log configuration status for debugging
console.log('Webhook configuration:');
console.log('- Supabase URL configured:', !!supabaseUrl);
console.log('- Stripe client initialized:', !!stripe);
console.log('- Webhook secret configured:', !!webhookSecret);

export async function POST(req: NextRequest) {
  console.log('Webhook endpoint called');
  
  try {
    // Check for required Supabase configuration
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase configuration' },
        { status: 500 }
      );
    }
    
    // Get the raw body as text
    const text = await req.text();
    
    // Get the signature from the headers
    const sig = req.headers.get('stripe-signature');
    
    // Parse the webhook - throws an error if verification fails
    let event;
    
    // Determine if this is a verified Stripe webhook or a manual test
    const isManualTest = !sig || !webhookSecret || !stripe;
    
    if (isManualTest) {
      console.log('Manual webhook test - skipping signature verification');
      try {
        event = JSON.parse(text);
      } catch (err: any) {
        console.error(`Invalid JSON in request body: ${err.message}`);
        return NextResponse.json(
          { error: `Invalid JSON in request body: ${err.message}` },
          { status: 400 }
        );
      }
    } else {
      try {
        // For webhook events from Stripe with proper verification
        event = stripe.webhooks.constructEvent(text, sig, webhookSecret);
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json(
          { error: `Webhook signature verification failed: ${err.message}` },
          { status: 400 }
        );
      }
    }

    console.log(`Event received: ${event.type}`);

    // Handle different event types
    if (event.type === 'product.created') {
      const product = event.data.object;
      console.log('Product created:', product.id, product.name);
      
      // Insert into products table
      const { error } = await supabase
        .from('products')
        .insert([
          {
            id: product.id,
            name: product.name,
            // Add other product fields as needed
          },
        ]);
      
      if (error) {
        console.error('Error inserting product:', error);
        return NextResponse.json(
          { error: `Error inserting product: ${error.message}` },
          { status: 500 }
        );
      }
      
      console.log('Product inserted successfully');
    } else if (event.type === 'price.created') {
      const price = event.data.object;
      console.log('Price created:', price.id, price.product, price.unit_amount);
      
      // Insert into prices table
      const { error } = await supabase
        .from('prices')
        .insert([
          {
            id: price.id,
            product_id: price.product,
            unit_amount: price.unit_amount,
            currency: price.currency,
            // Add other price fields as needed
          },
        ]);
      
      if (error) {
        console.error('Error inserting price:', error);
        return NextResponse.json(
          { error: `Error inserting price: ${error.message}` },
          { status: 500 }
        );
      }
      
      console.log('Price inserted successfully');
    }

    // Return a 200 success response
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Error handling webhook: ${err.message}`);
    return NextResponse.json(
      { error: `Error handling webhook: ${err.message}` },
      { status: 500 }
    );
  }
} 