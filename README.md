# myMVP-starterkit

This starter template is designed for developers looking to build modern web applications with powerful AI-assisted IDE tools like Cursor & WindSurf. It's perfect for those transitioning away from no-code/low-code platforms like Lovable and v0, who want more control and flexibility over their stack.

We are committed to regularly updating this project with new features, patterns, and best practices. Our goal is to help developers learn these powerful tools and technologies through practical, real-world examples that you can build upon.

## What's Included

- **Frontend**: Next.js 15 with App Router, Tailwind CSS, and shadcn/ui components
- **Backend**: Supabase for authentication, database, and storage
- **Billing**: Complete Stripe integration with webhook handling
- **Local Development**: Full local development setup with Docker
- **AI-Ready**: MCP (Model Context Protocol) configurations for AI-assisted development

This template shows you how to build a complete SaaS application with authentication, billing, and database functionality without the limitations of no-code platforms.

## Prerequisites

Before starting, you need to have the following:

1. [GitHub Account](https://github.com/join) (for repository management)
2. [Git](https://git-scm.com/downloads) (for version control)
3. [Node.js](https://nodejs.org/en/) (v16 or higher)
4. [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker CLI)
5. [Stripe CLI](https://stripe.com/docs/stripe-cli#install) (for Stripe integration)
6. [Stripe Account](https://dashboard.stripe.com/register) (for payment processing)

### Installing Prerequisites

If you don't have these tools installed, follow these instructions:

1. **Create a GitHub Account**:
   - Go to [GitHub's signup page](https://github.com/join) and follow the instructions

2. **Install Git**:
   - Download and install from [Git website](https://git-scm.com/downloads)
   - Verify installation: `git --version`

3. **Install Node.js**:
   - Download and install from [Node.js website](https://nodejs.org/en/) (LTS version recommended)
   - Verify installation: `node --version && npm --version`

4. **Install Docker Desktop**:
   - Download and install from [Docker Desktop website](https://www.docker.com/products/docker-desktop)
   - Windows/Mac: Follow the installer instructions
   - Verify installation: `docker --version`
   - Make sure Docker Desktop is running before starting Supabase

5. **Install Stripe CLI**:
   - Windows: 
     1. Download the zip file `stripe_1.26.1_windows_x86_64.zip` from [Stripe CLI Releases](https://github.com/stripe/stripe-cli/releases/latest)
     2. Extract it to a folder on your computer
     3. Add the folder to your PATH environment variable:
        - Copy the full path to the folder where you extracted the stripe.exe file (right-click on the stripe file in File Explorer, hold Shift and select "Copy as path")
        - Press Windows key + X and select "System"
        - Click on "Advanced system settings" on the right
        - Click the "Environment Variables" button near the bottom
        - In the "System variables" section, find and select "Path"
        - Click "Edit"
        - Click "New"
        - Paste the folder path you copied earlier (without the filename itself and without .exe, just the folder path)
        - Click "OK" on all dialog boxes to save changes
     4. Verify installation: Open a new Command Prompt or PowerShell window and run `stripe --version`
   - macOS: Use `brew install stripe/stripe-cli/stripe`
   - Linux: Download the appropriate package from [Stripe CLI Releases](https://github.com/stripe/stripe-cli/releases/latest)
   - Verify installation: `stripe --version`

6. **Create a Stripe Account**:
   - Sign up at [Stripe's registration page](https://dashboard.stripe.com/register)
   - No banking information is required for test mode

Note: We'll be using `npx` to run Supabase CLI commands instead of installing it globally. This ensures:
- Everyone uses the same CLI version
- No global dependencies to manage
- No conflicts with other Supabase projects
- Easier setup process

## Project Setup Workflow

Follow this step-by-step workflow to set up the complete project:

### 1. Basic Setup

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/HamChowderr/myMVP-starterkit.git
   cd myMVP-starterkit
   npm install
   ```

### 2. Environment Variables Setup

Create an empty `.env.local` file at the root of your project with one of these commands:

**Windows (PowerShell):**
```powershell
New-Item -Path .env.local -ItemType "file" -Force
```

**Mac/Linux (Bash):**
```bash
touch .env.local
```

Then add the following content to the file:

```
# supabase
# These values never change when supabase is ran locally regardless of project
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
SUPABASE_DATABASE_PASSWORD=postgres
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
# SUPABASE_PROJECT_REF=SUPABASE_PROJECT_REF
# stripe
STRIPE_SECRET_KEY=STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET
# host
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Note: You'll only need to update the STRIPE_WEBHOOK_SECRET for now. We'll configure the other Stripe keys later when setting up the MCP server.

### 3. Supabase Initialization

1. Start Supabase with debug mode enabled:
   ```bash
   npx supabase start --debug
   ```

   This will start all the Supabase services using Docker. The first time you run this it will take a while to download the Docker images.

   > **IMPORTANT**: The current project ID name in `supabase/config.toml` can be used once, but if you create multiple projects with this template, you must change the `project_id` value in the file to a unique name for each new project to avoid Docker conflicts.

Your Supabase instance is now running on http://localhost:54321, and you can access the Supabase Studio on http://localhost:54323.

#### Troubleshooting Docker Port Conflicts

If you encounter an error like this:
```
failed to start docker container: Error response from daemon: failed to set up container networking: driver failed programming external connectivity on endpoint supabase_inbucket_starter-kit: failed to bind host port for 0.0.0.0:54324: address already in use
```

Try these solutions:

1. Stop all Supabase instances and remove containers:
   ```bash
   npx supabase stop
   docker rm -f $(docker ps -a -q --filter "name=supabase")
   ```

2. Check and kill processes using conflicting ports:
   ```bash
   # Windows (PowerShell)
   netstat -ano | findstr 5432
   # Then kill the process: 
   taskkill /PID [PID] /F
   ```

3. Restart Docker Desktop completely

4. Change the project ID in `supabase/config.toml` to a unique name

### 4. Database Table Setup

#### Using AI Assistant (Recommended)

1. Copy the following SQL query:

```sql
-- Create products table with gateway-agnostic design
CREATE TABLE IF NOT EXISTS public.billing_products (
  gateway_product_id TEXT PRIMARY KEY,
  gateway_name TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  features JSONB,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible_in_ui BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(gateway_name, gateway_product_id)
);

-- Create prices table with gateway-agnostic design
CREATE TABLE IF NOT EXISTS public.billing_prices (
  gateway_price_id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_product_id TEXT NOT NULL REFERENCES public.billing_products(gateway_product_id) ON DELETE CASCADE,
  currency TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  recurring_interval TEXT NOT NULL,
  recurring_interval_count INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  tier TEXT,
  free_trial_days INT,
  gateway_name TEXT NOT NULL,
  UNIQUE(gateway_name, gateway_price_id)
);

-- Add RLS
ALTER TABLE public.billing_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_prices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read-only access to billing_products" ON public.billing_products
  FOR SELECT USING (true);
  
CREATE POLICY "Allow public read-only access to billing_prices" ON public.billing_prices
  FOR SELECT USING (true);

-- Create customers table with gateway-agnostic design
CREATE TABLE IF NOT EXISTS public.billing_customers (
  gateway_customer_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  gateway_name TEXT NOT NULL,
  default_currency TEXT,
  billing_email TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  UNIQUE (gateway_name, gateway_customer_id)
);

-- Enable RLS for customers
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;

-- Create policy for customers
CREATE POLICY "Allow workspace members to view their customers" ON public.billing_customers
  FOR SELECT USING (true);

-- Create invoices table with gateway-agnostic design
CREATE TABLE IF NOT EXISTS public.billing_invoices (
  gateway_invoice_id TEXT PRIMARY KEY,
  gateway_customer_id TEXT NOT NULL REFERENCES public.billing_customers(gateway_customer_id) ON DELETE CASCADE,
  gateway_product_id TEXT REFERENCES public.billing_products(gateway_product_id) ON DELETE CASCADE,
  gateway_price_id TEXT REFERENCES public.billing_prices(gateway_price_id) ON DELETE CASCADE,
  gateway_name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL,
  STATUS TEXT NOT NULL,
  due_date DATE,
  paid_date DATE,
  hosted_invoice_url TEXT,
  UNIQUE(gateway_name, gateway_invoice_id)
);

-- Enable RLS for invoices
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;

-- Create policy for invoices
CREATE POLICY "Allow workspace members to view their invoices" ON public.billing_invoices
  FOR SELECT USING (true);

-- Create one-time payments table with gateway-agnostic design
CREATE TABLE IF NOT EXISTS public.billing_one_time_payments (
  gateway_charge_id TEXT PRIMARY KEY NOT NULL,
  gateway_customer_id TEXT NOT NULL REFERENCES public.billing_customers(gateway_customer_id) ON DELETE CASCADE,
  gateway_name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL,
  STATUS TEXT NOT NULL,
  charge_date TIMESTAMP WITH TIME ZONE NOT NULL,
  gateway_invoice_id TEXT NOT NULL REFERENCES public.billing_invoices(gateway_invoice_id) ON DELETE CASCADE,
  gateway_product_id TEXT NOT NULL REFERENCES public.billing_products(gateway_product_id) ON DELETE CASCADE,
  gateway_price_id TEXT NOT NULL REFERENCES public.billing_prices(gateway_price_id) ON DELETE CASCADE
);

-- Enable RLS for one-time payments
ALTER TABLE public.billing_one_time_payments ENABLE ROW LEVEL SECURITY;

-- Create policy for one-time payments
CREATE POLICY "Allow workspace members to view their one-time payments" ON public.billing_one_time_payments
  FOR SELECT USING (true);

-- Create subscriptions table with gateway-agnostic design
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
  gateway_customer_id TEXT NOT NULL REFERENCES public.billing_customers(gateway_customer_id) ON DELETE CASCADE,
  gateway_name TEXT NOT NULL,
  gateway_subscription_id TEXT NOT NULL,
  gateway_product_id TEXT NOT NULL REFERENCES public.billing_products(gateway_product_id) ON DELETE CASCADE,
  gateway_price_id TEXT NOT NULL REFERENCES public.billing_prices(gateway_price_id) ON DELETE CASCADE,
  STATUS public.subscription_status NOT NULL,
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  currency TEXT NOT NULL,
  is_trial BOOLEAN NOT NULL,
  trial_ends_at DATE,
  cancel_at_period_end BOOLEAN NOT NULL,
  quantity INT,
  UNIQUE(gateway_name, gateway_subscription_id)
);

-- Enable RLS for subscriptions
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for subscriptions
CREATE POLICY "Allow workspace members to view their subscriptions" ON public.billing_subscriptions
  FOR SELECT USING (true);

-- Example queries for your application:

-- Select all products
SELECT *, billing_prices(*)
FROM billing_products
WHERE gateway_name = 'stripe';

-- Select single product
SELECT *, billing_prices(*)
FROM billing_products
WHERE gateway_product_id = :productId
AND gateway_name = 'stripe'
LIMIT 1;

-- Upsert product
INSERT INTO billing_products (
  gateway_product_id, gateway_name, name, description, 
  is_visible_in_ui, features, active
)
VALUES (
  :productId, 'stripe', :name, :description,
  :isVisibleInUi, :features, :active
)
ON CONFLICT (gateway_product_id, gateway_name)
DO UPDATE SET
  name = :name,
  description = :description,
  is_visible_in_ui = :isVisibleInUi,
  features = :features,
  active = :active;

-- Update product visibility
UPDATE billing_products
SET is_visible_in_ui = :isVisible
WHERE gateway_product_id = :productId
AND gateway_name = 'stripe';

-- Select single price
SELECT *
FROM billing_prices
WHERE gateway_price_id = :priceId
AND gateway_name = 'stripe'
LIMIT 1;

-- Upsert price
INSERT INTO billing_prices (
  gateway_product_id, gateway_name, gateway_price_id,
  currency, amount, recurring_interval,
  recurring_interval_count, active
)
VALUES (
  :productId, 'stripe', :priceId,
  :currency, :amount, :recurringInterval,
  :recurringIntervalCount, :active
)
ON CONFLICT (gateway_price_id)
DO UPDATE SET
  currency = :currency,
  amount = :amount,
  recurring_interval = :recurringInterval,
  recurring_interval_count = :recurringIntervalCount,
  active = :active;

-- Insert new customer
INSERT INTO billing_customers (
  gateway_name, gateway_customer_id, billing_email, user_id
)
VALUES (
  'stripe', :customerId, :billingEmail, auth.uid()
)
RETURNING *;

-- Get customer by customer ID
SELECT *
FROM billing_customers
WHERE gateway_customer_id = :customerId
AND gateway_name = 'stripe'
LIMIT 1;

-- Get customer by user ID
SELECT *
FROM billing_customers
WHERE user_id = auth.uid()
AND gateway_name = 'stripe'
LIMIT 1;

-- Get subscriptions by user ID
SELECT s.*
FROM billing_subscriptions s
JOIN billing_customers c ON s.gateway_customer_id = c.gateway_customer_id
WHERE c.user_id = auth.uid()
AND s.gateway_name = 'stripe';

-- Get invoices by user ID
SELECT i.*
FROM billing_invoices i
JOIN billing_customers c ON i.gateway_customer_id = c.gateway_customer_id
WHERE c.user_id = auth.uid()
AND i.gateway_name = 'stripe';

-- Get one-time purchases by customer ID
SELECT *, billing_products(*), billing_prices(*), billing_invoices(*)
FROM billing_one_time_payments
WHERE gateway_customer_id = :customerId
AND gateway_name = 'stripe';
```

2. Paste it into the AI Assistant chat and say: "Create these tables for me in Supabase."

3. Run the migration to save these changes:
   ```bash
   npx supabase migration new add_billing_tables
   ```

4. Apply the migration to your Supabase database:
   ```bash
   npx supabase migration up
   ```

   If you encounter any errors, try running with the debug flag:
   ```bash
   npx supabase migration up --debug
   ```

5. If you continue to have issues, you may need to reset your local database:
   ```bash
   npx supabase db reset
   ```
   Note: This will erase all data in your local database and reapply migrations.

6. The AI will help create the tables in Supabase Studio, and the migration will preserve them in your project.

#### Alternative Method: Manual Setup

You can also create the tables manually:

1. Access the Supabase Studio at http://localhost:54323
2. Go to the SQL Editor
3. Paste and run the SQL query above

### 5. Stripe CLI and Webhook Setup

1. Login to Stripe via CLI:
   ```bash
   stripe login
   ```
   This will prompt you to open a link in your browser. Complete the login process, then return to your terminal.

2. Forward Webhook Events to Your Local Server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```
   This will output a webhook signing secret (e.g., `whsec_...`).

3. Add the Webhook Secret to Your Environment:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
   Update the `STRIPE_WEBHOOK_SECRET` in your `.env.local` file with this value and save the file for the changes to take effect.

### 6. Start the Next.js Development Server

Start your Next.js application:
```bash
npm run dev
```

Your application is now running on http://localhost:3000.

### 7. Create Products and Prices via Stripe Webhooks

With everything set up, trigger the Stripe events to create products and prices:
```bash
stripe trigger product.created
stripe trigger price.created
```

You should see a 200 response in your console for each successful webhook event, confirming that your application has processed the events correctly.

### 8. Verify Setup

- Open [http://localhost:54323](http://localhost:54323) to access Supabase Studio
- Use the Table Editor to confirm that the products and prices have been created in your Supabase database
- Visit your application at http://localhost:3000 to verify it's functioning correctly

---

## Supabase Model Context Protocol (MCP)

The Supabase Model Context Protocol allows you to interact with your Supabase database using AI assistants that support MCP. The Supabase MCP server automatically connects to your local Supabase instance, so no additional setup is required if you've already started Supabase locally.

### Running the Supabase MCP Server

**Important:** The Supabase MCP server is pre-configured to connect to your local Supabase instance. No configuration is needed as it works automatically after you run Supabase locally.

The project has been configured to automatically load the Supabase MCP server when using Cursor. The configuration is in `.cursor/mcp.json`.

**Note:** You may need to restart Cursor after starting Supabase locally for the MCP connection to work properly.

### Available Supabase MCP Features

The Supabase MCP server provides direct SQL access to your database, allowing you to:

- Query database tables and views
- Verify data storage from webhook events
- Check database schema
- Test database operations
- Debug data-related issues

These tools can be accessed through AI assistants that support the Model Context Protocol.

---

## Stripe Model Context Protocol (MCP)

The Stripe Model Context Protocol allows you to interact with Stripe API using AI assistants that support MCP.

### Running the Stripe MCP Server

Before using the Stripe MCP server, you need to configure your Stripe API key:

Edit the `.cursor/mcp.json` file to include your Stripe API key:
```json
{
  "mcpServers": {
    "stripe": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@stripe/mcp", "--tools=all", "--api-key=sk_test_YOUR_KEY_HERE"]
    }
  }
}
```
Replace `sk_test_YOUR_KEY_HERE` with your actual Stripe secret key.

The project has been configured to automatically load the Stripe MCP server when using Cursor.

**Note:** You may need to restart Cursor after updating the API key in the configuration file for the changes to take effect.

**Important:** When you first start the application in Cursor, you will see a notification that "2 MCPs have been detected". You should press "Enable" to activate both the Stripe and Supabase MCPs.

### Available Stripe Tools

The Stripe MCP server provides the following tools:

- **Customers**: Create and read customer information
- **Products**: Create and read product information
- **Prices**: Create and read price information
- **Payment Links**: Create payment links
- **Invoices**: Create and update invoices
- **Balance**: Retrieve balance information
- **Refunds**: Create refunds
- **Payment Intents**: Read payment intent information
- **Subscriptions**: Read and update subscription information
- **Coupons**: Create and read coupon information
- **Documentation**: Search Stripe documentation

These tools can be accessed through AI assistants that support the Model Context Protocol.

---

## VAPI Model Context Protocol (MCP)

The VAPI Model Context Protocol allows you to interact with your VAPI assistants directly through Cursor. The MCP server is pre-configured in this project and just needs your API key to work.

### Setting Up VAPI MCP

To use the VAPI MCP, you only need to add your VAPI API key to the configuration file:

1. Edit the `.cursor/mcp.json` file to include your VAPI API key:
   ```json
   "vapi-mcp-server": {
     "command": "npx",
     "args": [
         "-y",
         "@vapi-ai/mcp-server"
     ],
     "env": {
       "VAPI_TOKEN": "your_vapi_token_here"
     }
   }
   ```
   Replace `your_vapi_token_here` with your actual VAPI token.

2. Restart Cursor to apply the changes.

The VAPI MCP server will automatically load when you restart Cursor, and you'll be able to manage your voice assistants directly through the MCP tools.

### Available VAPI MCP Features

The VAPI MCP server provides tools to:

- List all your VAPI assistants
- Create new voice assistants
- Update existing assistants
- Get assistant details
- Manage calls and phone numbers
- Configure voice models and transcription services

These tools make it easy to create and manage voice assistants without leaving your development environment.

---

## 🚀 First-time Project Setup (UI, Auth, Infinite Query, Dropzone, and More)

This project uses the [Supabase UI Library](https://supabase.com/ui/docs/getting-started/introduction) and shadcn/ui blocks for rapid, type-safe, and beautiful UI development. **You must run these commands once after cloning the repo to scaffold all required UI, authentication, and utility components.**

### 1. Install Supabase UI Library Client for Next.js
```
npx shadcn@latest add https://supabase.com/ui/r/supabase-client-nextjs.json
```
- Sets up a Supabase client for SSR and App Router support with Next.js
- Provides authentication helpers, type-safe database queries, and server-side rendering support
- If you already have a Supabase client, you may skip this step.

### 2. Add Password-based Authentication
```
npx shadcn@latest add https://supabase.com/ui/r/password-based-auth-nextjs.json
```
- Adds complete authentication flow with sign-in, sign-up, password reset, and account management
- Creates responsive, accessible, themed auth pages and components
- Implements security best practices and proper error handling
- See the environment variables section above for required environment variables.

### 3. Add Dropzone (File Upload) Component
```
npx shadcn@latest add https://supabase.com/ui/r/dropzone-nextjs.json
```
- Adds a complete drag-and-drop file upload system with preview and progress indicators
- Integrates directly with Supabase Storage for file handling
- Includes built-in validation, error handling, and accessibility features

### 4. Add Infinite Query Hook
```
npx shadcn@latest add https://supabase.com/ui/r/infinite-query-hook.json
```
- Implements efficient data pagination with infinite scrolling capabilities
- Provides optimized performance for large datasets with React Query integration
- Includes TypeScript types and simple API for querying Supabase tables