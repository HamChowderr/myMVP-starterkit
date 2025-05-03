# Supabase Starter

A starter template with Supabase and Next.js.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker CLI)

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
- See the `.env` section below for required environment variables.

### 3. Add Dropzone (File Upload) Component
```
npx shadcn@latest add https://supabase.com/ui/r/dropzone-nextjs.json
```
- Adds a drag-and-drop file upload component for Supabase Storage.

### 4. Add Infinite Query Hook
```
npx shadcn@latest add https://supabase.com/ui/r/infinite-query-hook.json
```
- Adds a React hook for infinite lists and tables with Supabase.

### 5. Add AI Editor Rules for Supabase
```
npx shadcn@latest add https://supabase.com/ui/r/ai-editor-rules.json
```
- Adds project-specific rules for AI code editors to `.cursor/rules`.

---

### 6. Environment Variables
Create a `.env.local` file in your project root:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret  # Required for Stripe integration
```
- For supabase.com: Find these in the Connect modal or API settings.
- For local Supabase: Run `supabase start` or `supabase status`.

---

### 7. Email Templates (for Auth)
- Add a sign-up email template to your Supabase project:
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">Confirm your email</a>
</p>
```
- Add a reset password email template:
```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}">Reset Password</a>
</p>
```
- See [Supabase Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates) for details.

---

### 8. Route and Redirect Configuration
- Set your site URL in the Supabase Dashboard (URL Configuration).
- Add `/auth/forgot-password` to the list of Redirect URLs.
- Update redirect paths in `login-form.tsx` and `update-password-form.tsx` as needed.

---

### 9. Type Generation (Recommended)
- Generate TypeScript types from your Supabase schema for full type safety:
  - [Supabase Type Generation Guide](https://supabase.com/docs/guides/api/generating-types)

---

### 10. Monorepo Note
- If using a monorepo, move the `.cursor` directory to the root and update all paths in `.mdc` files.

---

## Stripe Integration (Local Development)

To enable Stripe integration for local development, follow these steps:

### 1. Install Stripe CLI
Download and install the Stripe CLI from [the official Stripe CLI page](https://stripe.com/docs/stripe-cli#install).

### 2. Login to Stripe via CLI
In your terminal, run:
```bash
stripe login
```
This will prompt you to open a link in your browser. Complete the login process, then return to your terminal.

### 3. Forward Webhook Events to Your Local Server
Run the following command to forward Stripe webhook events to your local API endpoint:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```
This will output a webhook signing secret (e.g., `whsec_...`).

### 4. Add the Webhook Secret to Your Environment
Add the following to your `.env.local` file (or `.env` if you do not have a local override):
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. Trigger Product and Price Events
To simulate Stripe events and create your product and price, run:
```bash
stripe trigger product.created
stripe trigger price.created
```

### 6. Confirm Events in Supabase
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

There are two ways to run the Stripe MCP server:

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

The Supabase Model Context Protocol allows you to interact with your Supabase database using AI assistants that support MCP.

### 1. Set Up Your Environment

Ensure your Supabase URL and anon key are in your environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
```

### 2. Run the Supabase MCP Server

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

### 3. Available Supabase MCP Features

The Supabase MCP server provides direct SQL access to your database, allowing you to:

- Query database tables and views
- Verify data storage from webhook events
- Check database schema
- Test database operations
- Debug data-related issues

These tools can be accessed through AI assistants that support the Model Context Protocol.

## Project Structure

```
├── supabase/          # Supabase configuration
│   ├── config.toml    # Project configuration
│   └── .gitignore     # Supabase specific ignores
├── .env.local         # Environment variables template
├── .gitignore        # Project ignores
└── README.md         # This file
```

## Useful Commands

```bash
# Initialize Supabase project
npx supabase init

# Start Supabase
npx supabase start

# Stop Supabase
npx supabase stop

# Check Supabase Status
npx supabase status

# Access Supabase Studio
http://localhost:54323

# Access Database
npx supabase db psql

# Check Docker status
docker ps

# Check Docker logs
docker logs -f supabase-db
```

## Configuration

The project uses the following default ports:
- **API**: 54321
- **Studio**: 54323
- **Inbucket** (Email testing): 54324
- **SMTP Port**: 54325
- **POP3 Port**: 54326
- **Analytics**: 54327

You can modify these in the `config.toml` file if needed.

## Authentication

This project is configured with email authentication:
- Email signup/signin enabled
- Email confirmations required
- Double confirmation for email changes

## Database Management

1. **Access Database**
   ```bash
   # Using psql
   npx supabase db psql
   ```

2. **Apply Migrations**
   ```bash
   npx supabase migration up
   ```

3. **Create New Migration**
   ```bash
   npx supabase migration new <migration-name>
   ```

## Development Workflow

1. Start local Supabase instance
2. Make changes to your database using Studio or migrations
3. Test API endpoints using the API documentation in Studio
4. Generate updated TypeScript types if schema changes
5. Commit changes and migrations to version control

## Important: Project Cleanup

Always stop your Supabase containers when you're done working:
```bash
npx supabase stop
```

This is crucial to:
- Free up system resources
- Avoid port conflicts with other projects
- Prevent unexpected behavior in future sessions

## Debugging Tips

When encountering issues with Supabase commands, always use the `--debug` flag to get detailed error information:
```bash
# Examples
npx supabase start --debug
npx supabase db reset --debug
npx supabase migration up --debug
```

The debug output will show:
- Detailed error messages
- Database queries and responses
- Container status and logs
- Network communication details

This information is invaluable for:
- Identifying the root cause of errors
- Understanding migration issues
- Debugging connection problems
- Resolving permission conflicts

## Troubleshooting

1. **Services Won't Start**
   - Ensure Docker is running
   - Check if ports are available
   - Run `npx supabase stop` and then `npx supabase start`
   - Check if another Supabase project is running

2. **Port Conflicts**
   - Run `netstat -ano | findstr :54321` (Windows) or `lsof -i :54321` (Mac/Linux) to check if ports are in use
   - Stop other Supabase instances
   - Modify ports in `config.toml` if needed

3. **Database Connection Issues**
   - Verify PostgreSQL is running: `npx supabase status`
   - Check connection string in your environment variables

4. **Email Testing**
   - Use Inbucket at [http://localhost:54324](http://localhost:54324) to catch emails
   - Check SMTP settings if emails aren't being received

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 