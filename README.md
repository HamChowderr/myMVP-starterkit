# Supabase Starter

A starter template with Supabase and Next.js.

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
   - Windows: Download the zip file `stripe_1.26.1_windows_x86_64.zip` from [Stripe CLI Releases](https://github.com/stripe/stripe-cli/releases/latest), extract it, and add the folder to your PATH
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

### 1. Basic Setup and Supabase Initialization

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

Your Supabase instance is now running on http://localhost:54321, and you can access the Supabase Studio on http://localhost:54323.

### 2. Database Table Setup

Before proceeding with Stripe integration, you need to create the necessary tables in Supabase:

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

### 3. Environment Variables Setup

Create or update your `.env.local` file with the following variables:
```
# Supabase variables - DO NOT CHANGE for local development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Stripe variables - These need to be set from your Stripe account
STRIPE_PUBLISHABLE_KEY=pk_test_... # From Stripe Dashboard > Developers > API keys
STRIPE_SECRET_KEY=sk_test_...      # From Stripe Dashboard > Developers > API keys
# STRIPE_WEBHOOK_SECRET will be added later after setting up the webhook
```

To get your Stripe API keys:
1. Go to the [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers > API keys
3. Copy your publishable key (starts with `pk_test_`) and secret key (starts with `sk_test_`)

### 4. Stripe CLI and Webhook Setup

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
   Add this to your `.env.local` file.

### 5. Start the Next.js Development Server

Start your Next.js application:
```bash
npm run dev
```

Your application is now running on http://localhost:3000.

### 6. Create Products and Prices via Stripe Webhooks

With everything set up, trigger the Stripe events to create products and prices:
```bash
stripe trigger product.created
stripe trigger price.created
```

### 7. Verify Setup

- Open [http://localhost:54323](http://localhost:54323) to access Supabase Studio
- Use the Table Editor to confirm that the products and prices have been created in your Supabase database
- Visit your application at http://localhost:3000 to verify it's functioning correctly

---

## Stripe Model Context Protocol (MCP)

The Stripe Model Context Protocol allows you to interact with Stripe API using AI assistants that support MCP.

### Running the Stripe MCP Server

Before using the Stripe MCP server, you need to configure your Stripe API key:

1. If using Cursor's MCP integration, edit the `.cursor/mcp.json` file to include your Stripe API key:
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

2. If using the batch file method, edit the `run-stripe-mcp.bat` file to include your Stripe API key.

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

**Note:** You may need to restart Cursor after updating the API key in the configuration file.

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

> **Note:** The agent-toolkit directory in this repository is not required for MCP functionality. It can be safely removed to reduce the project size since we're using NPX to run the MCP servers directly.

---

## Supabase Model Context Protocol (MCP)

The Supabase Model Context Protocol allows you to interact with your Supabase database using AI assistants that support MCP. The Supabase MCP server automatically connects to your local Supabase instance, so no additional setup is required if you've already started Supabase locally.

### Running the Supabase MCP Server

**Important:** The Supabase MCP server is pre-configured to connect to your local Supabase instance. Do not change the connection settings in the configuration files as they're already set up correctly for the local development environment.

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

**Note:** You may need to restart Cursor after making any changes or if the MCP connection isn't working properly.

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