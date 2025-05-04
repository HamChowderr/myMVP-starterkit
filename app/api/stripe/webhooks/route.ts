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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;  // Service role key for admin operations
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client with service role key if available, otherwise fallback to anon key
const supabase = createClient(
  supabaseUrl!,
  supabaseServiceKey || supabaseAnonKey!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

// Log configuration status for debugging
console.log('Webhook configuration:');
console.log('- Supabase URL configured:', !!supabaseUrl);
console.log('- Supabase using service role key:', !!supabaseServiceKey);
console.log('- Stripe client initialized:', !!stripe);
console.log('- Webhook secret configured:', !!webhookSecret);

export async function POST(req: NextRequest) {
  console.log('Webhook endpoint called');
  
  try {
    // Check for required Supabase configuration
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase configuration' },
        { status: 500 }
      );
    }
    
    // Debug 1: Log request headers
    console.log('Debug 1: Request headers', {
      'stripe-signature': req.headers.get('stripe-signature') ? 'Present' : 'Missing',
      'content-type': req.headers.get('content-type')
    });
    
    // Get the raw body as text
    const text = await req.text();
    
    // Debug 2: Log request body length
    console.log('Debug 2: Request body length', text.length);
    
    // Get the signature from the headers
    const sig = req.headers.get('stripe-signature');
    
    // Parse the webhook - throws an error if verification fails
    let event;
    
    // Determine if this is a verified Stripe webhook or a manual test
    const isManualTest = !sig || !webhookSecret || !stripe;
    
    // Debug 3: Log verification mode
    console.log('Debug 3: Webhook verification mode', {
      isManualTest,
      hasSignature: !!sig,
      hasWebhookSecret: !!webhookSecret,
      hasStripeClient: !!stripe
    });
    
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

    // Debug 4: Log event details
    console.log('Debug 4: Event details', {
      type: event.type,
      id: event.id,
      apiVersion: event.api_version,
      created: event.created,
      dataObjectId: event.data?.object?.id || 'N/A'
    });

    console.log(`Event received: ${event.type}`);

    // Debug 5: Log Supabase connection details
    console.log('Debug 5: Supabase connection details', {
      supabaseUrl: supabaseUrl,
      usingServiceRole: !!supabaseServiceKey,
      usingAnonKey: !supabaseServiceKey && !!supabaseAnonKey
    });

    // Handle different event types
    if (event.type === 'product.created') {
      const product = event.data.object;
      console.log('Product created:', product.id, product.name);
      
      // Debug 6: Log product data before insert
      console.log('Debug 6: Product data before insert', {
        gateway_product_id: product.id,
        name: product.name,
        description: product.description?.substring(0, 50) || 'null',
        features: product.metadata?.features ? 'Present' : 'Missing',
        active: product.active,
        is_visible_in_ui: product.metadata?.visible_in_ui !== 'false'
      });
      
      // Insert into billing_products table
      const { error } = await supabase
        .from('billing_products')
        .insert([
          {
            gateway_product_id: product.id,
            gateway_name: 'stripe',
            name: product.name,
            description: product.description,
            features: product.metadata?.features ? JSON.parse(product.metadata.features) : null,
            active: product.active,
            is_visible_in_ui: product.metadata?.visible_in_ui !== 'false', // Default to true unless explicitly set to false
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
      
      // Insert into billing_prices table
      const { error } = await supabase
        .from('billing_prices')
        .insert([
          {
            gateway_price_id: price.id,
            gateway_product_id: price.product,
            currency: price.currency,
            amount: price.unit_amount / 100, // Convert from cents to decimal
            recurring_interval: price.recurring?.interval || null,
            recurring_interval_count: price.recurring?.interval_count || 0,
            free_trial_days: price.recurring?.trial_period_days || null,
            active: price.active,
            gateway_name: 'stripe',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
    } else if (event.type === 'customer.created' || event.type === 'customer.updated') {
      const customer = event.data.object;
      console.log('Customer event:', event.type, customer.id);
      
      // Check if metadata contains a workspace_id
      const workspaceId = customer.metadata?.workspace_id;
      if (!workspaceId) {
        console.warn('No workspace_id found in customer metadata', customer.id);
        // Skip processing as we need a workspace_id to link the customer
        return NextResponse.json(
          { received: true, warning: 'No workspace_id found in customer metadata' },
          { status: 200 }
        );
      }
      
      // Format the customer data
      const customerData = {
        gateway_customer_id: customer.id,
        workspace_id: workspaceId,
        gateway_name: 'stripe',
        default_currency: customer.currency,
        billing_email: customer.email || 'unknown@example.com',
        metadata: customer.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Upsert the customer
      const { error } = await supabase
        .from('billing_customers')
        .upsert([customerData], { 
          onConflict: 'gateway_name,gateway_customer_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Error upserting customer:', error);
        return NextResponse.json(
          { error: `Error upserting customer: ${error.message}` },
          { status: 500 }
        );
      }
      
      console.log('Customer upserted successfully');
    } else if (event.type === 'invoice.created' || event.type === 'invoice.updated') {
      const invoice = event.data.object;
      console.log('Invoice event:', event.type, invoice.id);
      
      // Get the first line item if present
      const lineItem = invoice.lines?.data?.[0];
      
      // Format the invoice data
      const invoiceData = {
        gateway_invoice_id: invoice.id,
        gateway_customer_id: invoice.customer,
        gateway_product_id: lineItem?.price?.product || null,
        gateway_price_id: lineItem?.price?.id || null,
        gateway_name: 'stripe',
        amount: invoice.total / 100, // Convert from cents to decimal
        currency: invoice.currency,
        status: invoice.status,
        due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString().split('T')[0] : null,
        paid_date: invoice.status === 'paid' ? new Date().toISOString().split('T')[0] : null,
        hosted_invoice_url: invoice.hosted_invoice_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Upsert the invoice
      const { error } = await supabase
        .from('billing_invoices')
        .upsert([invoiceData], { 
          onConflict: 'gateway_name,gateway_invoice_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Error upserting invoice:', error);
        return NextResponse.json(
          { error: `Error upserting invoice: ${error.message}` },
          { status: 500 }
        );
      }
      
      console.log('Invoice upserted successfully');
    } else if (event.type === 'charge.succeeded') {
      const charge = event.data.object;
      console.log('Charge succeeded:', charge.id);
      
      // Make sure this is associated with an invoice
      if (!charge.invoice) {
        console.warn('Charge has no associated invoice', charge.id);
        return NextResponse.json(
          { received: true, warning: 'Charge has no associated invoice' },
          { status: 200 }
        );
      }
      
      // Retrieve the invoice to get product and price info
      let invoice;
      if (stripe) {
        try {
          invoice = await stripe.invoices.retrieve(charge.invoice, {
            expand: ['lines.data.price.product']
          });
        } catch (err: any) {
          console.error('Error fetching invoice from Stripe:', err);
          return NextResponse.json(
            { error: `Error fetching invoice: ${err.message}` },
            { status: 500 }
          );
        }
      } else {
        console.warn('Stripe client not initialized, cannot fetch invoice');
        return NextResponse.json(
          { received: true, warning: 'Stripe client not initialized' },
          { status: 200 }
        );
      }
      
      // Get the first invoice line item
      const lineItem = invoice.lines.data[0];
      if (!lineItem) {
        console.warn('No line items in invoice', charge.invoice);
        return NextResponse.json(
          { received: true, warning: 'No line items in invoice' },
          { status: 200 }
        );
      }
      
      // Ensure we have product and price information from the line item
      const priceInfo = (lineItem as any).price;
      if (!priceInfo || !priceInfo.product) {
        console.warn('Missing price or product information in invoice line item', charge.invoice);
        return NextResponse.json(
          { received: true, warning: 'Missing price or product information in invoice line item' },
          { status: 200 }
        );
      }
      
      // Format the payment data
      const paymentData = {
        gateway_charge_id: charge.id,
        gateway_customer_id: charge.customer,
        gateway_name: 'stripe',
        amount: charge.amount / 100, // Convert from cents to decimal
        currency: charge.currency,
        status: charge.status,
        charge_date: new Date(charge.created * 1000).toISOString(),
        gateway_invoice_id: charge.invoice,
        gateway_product_id: priceInfo.product.id,
        gateway_price_id: priceInfo.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Insert the one-time payment
      const { error } = await supabase
        .from('billing_one_time_payments')
        .upsert([paymentData], { 
          onConflict: 'gateway_name,gateway_charge_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Error upserting payment:', error);
        return NextResponse.json(
          { error: `Error upserting payment: ${error.message}` },
          { status: 500 }
        );
      }
      
      console.log('Payment recorded successfully');
    } else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      console.log('Subscription event:', event.type, subscription.id);
      
      // Get the first item (most subscriptions have only one item)
      const item = subscription.items.data[0];
      if (!item) {
        console.error('No subscription items found');
        return NextResponse.json(
          { error: 'No subscription items found' },
          { status: 400 }
        );
      }
      
      // Format the subscription data
      const subscriptionData = {
        gateway_subscription_id: subscription.id,
        gateway_customer_id: subscription.customer,
        gateway_name: 'stripe',
        gateway_product_id: item.price.product,
        gateway_price_id: item.price.id,
        status: subscription.status.toUpperCase(),
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString().split('T')[0],
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
        currency: item.price.currency,
        is_trial: !!subscription.trial_end,
        trial_ends_at: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString().split('T')[0] 
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        quantity: item.quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Upsert the subscription
      const { error } = await supabase
        .from('billing_subscriptions')
        .upsert([subscriptionData], { 
          onConflict: 'gateway_name,gateway_subscription_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Error upserting subscription:', error);
        return NextResponse.json(
          { error: `Error upserting subscription: ${error.message}` },
          { status: 500 }
        );
      }
      
      console.log('Subscription upserted successfully');
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      console.log('Subscription deleted:', subscription.id);
      
      // Delete the subscription record
      const { error } = await supabase
        .from('billing_subscriptions')
        .delete()
        .match({ 
          gateway_subscription_id: subscription.id,
          gateway_name: 'stripe'
        });
      
      if (error) {
        console.error('Error deleting subscription:', error);
        return NextResponse.json(
          { error: `Error deleting subscription: ${error.message}` },
          { status: 500 }
        );
      }
      
      console.log('Subscription deleted successfully');
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