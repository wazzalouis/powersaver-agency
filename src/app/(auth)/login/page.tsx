'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FusionLogo } from '@/components/brand/FusionLogo';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@fusionstudents.co.uk');
  const [password, setPassword] = useState('FusionEnergy2026');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Demo: skip real auth, go straight to dashboard
    await new Promise((r) => setTimeout(r, 800));
    router.push('/overview');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-[var(--fusion-radius-xl)] shadow-[var(--fusion-shadow-lg)] p-8">
        <div className="flex justify-center mb-8">
          <FusionLogo size="lg" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-fusion-text-secondary mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-fusion-cream-dark/30 rounded-[var(--fusion-radius)] text-sm text-fusion-text focus:outline-none focus:ring-2 focus:ring-fusion-sage"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-fusion-text-secondary mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-fusion-cream-dark/30 rounded-[var(--fusion-radius)] text-sm text-fusion-text focus:outline-none focus:ring-2 focus:ring-fusion-sage"
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="text-xs text-fusion-text-muted text-center mt-6">
          Demo credentials pre-filled for presentation
        </p>
      </div>
    </motion.div>
  );
}
