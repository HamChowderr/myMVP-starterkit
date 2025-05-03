'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeProps {
  onDismiss?: () => void;
}

export default function Welcome({ onDismiss }: WelcomeProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Check if this is the first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (hasVisited) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('hasVisitedBefore', 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                Welcome to Your Next.js + Supabase Journey!
              </h1>
              <div className="text-3xl">🚀</div>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Powerful Stack</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { name: 'Supabase', icon: '⚡', color: 'emerald' },
                    { name: 'Next.js', icon: '▲', color: 'blue' },
                    { name: 'TypeScript', icon: '📘', color: 'cyan' },
                    { name: 'Tailwind', icon: '🎨', color: 'purple' },
                    { name: 'Stripe', icon: '💳', color: 'green' },
                  ].map((tech) => (
                    <div
                      key={tech.name}
                      className={`bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700 hover:border-${tech.color}-500 transition-colors`}
                    >
                      <div className="text-2xl mb-1">{tech.icon}</div>
                      <div className="text-sm text-gray-300">{tech.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">What You'll Build</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Authentication System
                    </div>
                    <div className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Database Management
                    </div>
                    <div className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Payment Processing
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Real-time Features
                    </div>
                    <div className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Modern UI/UX
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDismiss}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors duration-200 flex items-center group"
              >
                Get Started
                <svg 
                  className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 