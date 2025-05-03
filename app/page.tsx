import React from 'react';
import Welcome from './components/Welcome';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
      <Welcome />
      
      {/* Main content */}
      <div className="max-w-6xl mx-auto p-8 pt-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Next.js + Supabase + Stripe
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Build powerful full-stack applications with the perfect combination of Supabase's backend capabilities, Next.js's frontend excellence, and Stripe's payment processing.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          {/* Next.js Feature Card */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 backdrop-blur-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 w-full md:w-[280px]">
            <div className="text-blue-400 text-2xl mb-4">▲</div>
            <h3 className="text-xl font-semibold mb-2">Next.js</h3>
            <p className="text-gray-400">Lightning-fast performance, server components, and seamless full-stack development with the Next.js App Router.</p>
          </div>

          {/* Modern UI Feature Card (Tailwind + shadcn) */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 backdrop-blur-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 w-full md:w-[280px]">
            <div className="text-purple-400 text-2xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Modern UI</h3>
            <p className="text-gray-400">Create beautiful, responsive interfaces with Tailwind CSS and shadcn/ui component patterns.</p>
          </div>

          {/* Supabase Feature Card */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 backdrop-blur-lg border border-gray-700 hover:border-green-500 transition-all duration-300 w-full md:w-[280px]">
            <div className="text-green-400 text-2xl mb-4">🟩</div>
            <h3 className="text-xl font-semibold mb-2">Supabase Backend</h3>
            <p className="text-gray-400">Leverage Supabase for authentication, database, storage, and real-time APIs—all open source and Postgres-powered.</p>
          </div>

          {/* Type Safe Feature Card */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 backdrop-blur-lg border border-gray-700 hover:border-emerald-500 transition-all duration-300 w-full md:w-[280px]">
            <div className="text-emerald-400 text-2xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold mb-2">Type Safe</h3>
            <p className="text-gray-400">Full TypeScript support ensures your code is reliable and maintainable from frontend to backend.</p>
          </div>

          {/* Stripe Feature Card */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 backdrop-blur-lg border border-gray-700 hover:border-green-500 transition-all duration-300 w-full md:w-[280px]">
            <div className="text-green-400 text-2xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2">Stripe Payments</h3>
            <p className="text-gray-400">Integrate secure payment processing with Stripe's powerful API for subscriptions, one-time payments, and more.</p>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Build Something Amazing?</h2>
          <a 
            href="https://supabase.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-medium transition-colors duration-200"
          >
            Explore the Docs
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
} 