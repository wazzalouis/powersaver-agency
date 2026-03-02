'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FusionLogo } from '@/components/brand/FusionLogo';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/overview';

  const [email, setEmail] = useState('admin@fusionstudents.co.uk');
  const [password, setPassword] = useState('FusionDemo2026!');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setIsLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  const hasError = error.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md px-4"
    >
      <div className="bg-white rounded-[var(--fusion-radius-xl)] shadow-[var(--fusion-shadow-xl)] p-8">
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <FusionLogo size="lg" />
        </div>
        <p className="text-center text-sm text-fusion-text-secondary mb-8">
          Energy Intelligence Platform
        </p>

        {/* Error Banner */}
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 mb-4 rounded-[var(--fusion-radius)] bg-fusion-danger/10 text-fusion-danger text-sm"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-fusion-text-secondary mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className={`w-full px-4 py-2.5 border rounded-[var(--fusion-radius)] text-sm text-fusion-text focus:outline-none focus:ring-2 focus:ring-fusion-sage transition-colors ${
                hasError ? 'border-fusion-danger ring-1 ring-fusion-danger/30' : 'border-fusion-cream-dark/30'
              }`}
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
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className={`w-full px-4 py-2.5 border rounded-[var(--fusion-radius)] text-sm text-fusion-text focus:outline-none focus:ring-2 focus:ring-fusion-sage transition-colors ${
                hasError ? 'border-fusion-danger ring-1 ring-fusion-danger/30' : 'border-fusion-cream-dark/30'
              }`}
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
