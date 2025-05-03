# Supabase Starter

A starter template with Supabase and Next.js.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker CLI)
- [Stripe CLI](https://stripe.com/docs/stripe-cli#install) (optional, required for Stripe integration)
- [Git](https://git-scm.com/downloads) (for version control)
- [Stripe Account](https://dashboard.stripe.com/register) (required for Stripe integration)

### Installing Prerequisites

If you don't have these tools installed, follow these instructions:

1. **Install Node.js**:
   - Download and install from [Node.js website](https://nodejs.org/en/) (LTS version recommended)
   - Verify installation: `node --version && npm --version`

2. **Install Docker Desktop**:
   - Download and install from [Docker Desktop website](https://www.docker.com/products/docker-desktop)
   - Windows/Mac: Follow the installer instructions
   - Verify installation: `docker --version`
   - Make sure Docker Desktop is running before starting Supabase

3. **Install Git**:
   - Download and install from [Git website](https://git-scm.com/downloads)
   - Verify installation: `git --version`

Note: We'll be using `npx` to run Supabase CLI commands instead of installing it globally. This ensures:
- Everyone uses the same CLI version
- No global dependencies to manage
- No conflicts with other Supabase projects
- Easier setup process

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   git clone <repository-url>
   cd supabase-starter
   npm install
   ```

2. Initialize Supabase:
   ```bash
   npx supabase init
   ```

3. Copy the environment variables:
   ```bash
   cp .env.local .env
   ```

4. Start Supabase:
   ```bash
   npx supabase start
   ```

   This will start all the Supabase services using Docker. The first time you run this it will take a while to download the Docker images.

5. Start the development server:
   ```bash
   npm run dev
   ```

Your application is now running on http://localhost:3000, and you can access the Supabase Studio on http://localhost:54323.

---

## Environment Variables Setup

Create a `.env.local` file in your project root:
```
# Supabase variables - DO NOT CHANGE for local development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Stripe variables - These need to be set from your Stripe account
STRIPE_PUBLISHABLE_KEY=pk_test_... # From Stripe Dashboard > Developers > API keys
STRIPE_SECRET_KEY=sk_test_...      # From Stripe Dashboard > Developers > API keys
STRIPE_WEBHOOK_SECRET=whsec_...     # From running the Stripe CLI webhook command
```

### Supabase Variables
For local Supabase development, the URL and anon key are fixed standard values. Do not change them as long as you're running Supabase locally with the default configuration.

### Stripe Variables
To get your Stripe API keys:
1. Create a [Stripe account](https://dashboard.stripe.com/register) if you don't have one
2. Go to the [Stripe Dashboard](https://dashboard.stripe.com)
3. Navigate to Developers > API keys
4. Copy your publishable key (starts with `pk_test_`) and secret key (starts with `sk_test_`)
5. The webhook secret will be provided when you run the Stripe CLI webhook command (explained in the Stripe Integration section)

---

## Stripe Integration (Local Development)

To enable Stripe integration for local development, follow these steps:

### 1. Create a Stripe Account
If you don't already have one, [register for a Stripe account](https://dashboard.stripe.com/register). All testing can be done in test mode, so you don't need to provide real banking information.

### 2. Install Stripe CLI
Download and install the Stripe CLI from [the official Stripe CLI page](https://stripe.com/docs/stripe-cli#install).

**Important Note**: This project requires the Stripe CLI to be installed directly on your system (not in Docker). Make sure to:

- Windows: Download the zip file `stripe_1.26.1_windows_x86_64.zip` from [Stripe CLI Releases](https://github.com/stripe/stripe-cli/releases/latest), extract it, and add the folder to your PATH
- macOS: Use `brew install stripe/stripe-cli/stripe`
- Linux: Download the appropriate package from [Stripe CLI Releases](https://github.com/stripe/stripe-cli/releases/latest)

After installation, verify the CLI is working by running:
```bash
stripe --version
```

The Stripe CLI must be accessible from your system's PATH environment variable.

### 3. Login to Stripe via CLI
In your terminal, run:
```bash
stripe login
```
This will prompt you to open a link in your browser. Complete the login process, then return to your terminal.

### 4. Forward Webhook Events to Your Local Server
Run the following command to forward Stripe webhook events to your local API endpoint:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```
This will output a webhook signing secret (e.g., `whsec_...`).

### 5. Add the Webhook Secret to Your Environment
Add the following to your `.env.local` file (or `.env` if you do not have a local override):
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 6. Create Required Database Tables in Supabase
Before triggering Stripe events, you need to create the necessary tables in Supabase to store product and price information:

#### Option 1: Using Migration File (Recommended)
Create a migration file in the `supabase/migrations` directory:

1. Create a new migration:
```bash
npx supabase migration new add_products_and_prices_tables
```

2. Add the following SQL to the generated migration file:
```sql
-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_id TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create prices table
CREATE TABLE IF NOT EXISTS prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_id TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES products(id),
  active BOOLEAN DEFAULT TRUE,
  description TEXT,
  unit_amount BIGINT,
  currency TEXT,
  type TEXT,
  interval TEXT,
  interval_count INTEGER,
  trial_period_days INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read-only access to products" ON products
  FOR SELECT USING (true);
  
CREATE POLICY "Allow public read-only access to prices" ON prices
  FOR SELECT USING (true);
```

3. Apply the migration:
```bash
npx supabase migration up
```

#### Option 2: Using Supabase Studio UI
1. Open Supabase Studio at [http://localhost:54323](http://localhost:54323)
2. Go to the "Table Editor" in the sidebar
3. Click "Create a new table" and create the products table with the fields described in the SQL above
4. Create another table for prices with the fields described in the SQL above
5. Add appropriate foreign key references and indexes

### 7. Trigger Product and Price Events
To simulate Stripe events and create your product and price, run:
```bash
stripe trigger product.created
stripe trigger price.created
```

### 8. Confirm Events in Supabase
- Open [http://localhost:54323](http://localhost:54323) to access Supabase Studio.
- Use the Table Editor to confirm that the products and prices have been created in your Supabase database.

---

## Stripe Model Context Protocol (MCP)

The Stripe Model Context Protocol allows you to interact with Stripe API using AI assistants that support MCP.

### 1. Set Up Your Environment

Add your Stripe Secret Key to your environment variables:
```
STRIPE_SECRET_KEY=sk_test_...
```

### 2. Run the Stripe MCP Server

There are three ways to run the Stripe MCP server:

#### Option 1: Using the npm script

```bash
npm run stripe-mcp
```

#### Option 2: Using the batch file

```bash
run-stripe-mcp.bat
```

#### Option 3: Using Cursor's MCP integration

The project has been configured to automatically load the Stripe MCP server when using Cursor. The configuration is in `.cursor/mcp.json`.

### 3. Available Stripe Tools

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

> **Note:** The agent-toolkit directory in this repository is not required for MCP functionality. It can be safely removed to reduce the project size since we're using NPX to run the MCP servers directly.

---

## Supabase Model Context Protocol (MCP)

The Supabase Model Context Protocol allows you to interact with your Supabase database using AI assistants that support MCP. The Supabase MCP server automatically connects to your local Supabase instance, so no additional setup is required if you've already started Supabase locally.

### Running the Supabase MCP Server

There are three ways to run the Supabase MCP server:

#### Option 1: Using the npm script

```bash
npm run supabase-mcp
```

#### Option 2: Using the batch file

```bash
run-supabase-mcp.bat
```

#### Option 3: Using Cursor's MCP integration

The project has been configured to automatically load the Supabase MCP server when using Cursor. The configuration is in `.cursor/mcp.json`.

### Available Supabase MCP Features

The Supabase MCP server provides direct SQL access to your database, allowing you to:

- Query database tables and views
- Verify data storage from webhook events
- Check database schema
- Test database operations
- Debug data-related issues

These tools can be accessed through AI assistants that support the Model Context Protocol.

---

## 🚀 First-time Project Setup (UI, Auth, Infinite Query, Dropzone, and More)

This project uses the [Supabase UI Library](https://supabase.com/ui/docs/getting-started/introduction) and shadcn/ui blocks for rapid, type-safe, and beautiful UI development. **You must run these commands once after cloning the repo to scaffold all required UI, authentication, and utility components.**

### 1. Install Supabase UI Library Client for Next.js
```
npx shadcn@latest add https://supabase.com/ui/r/supabase-client-nextjs.json
```
- Sets up a Supabase client for SSR and App Router support.
- If you already have a Supabase client, you may skip this step.

### 2. Add Password-based Authentication
```
npx shadcn@latest add https://supabase.com/ui/r/password-based-auth-nextjs.json
```
- Adds all pages and components for password-based authentication.
- See the environment variables section above for required environment variables.

### 3. Add Dropzone (File Upload) Component
```
npx shadcn@latest add https://supabase.com/ui/r/dropzone-nextjs.json
```
- Adds a drag-and-drop file upload component for Supabase Storage.

### 4. Add Infinite Query Hook
```
npx shadcn@latest add https://supabase.com/ui/r/infinite-query-hook.json
```