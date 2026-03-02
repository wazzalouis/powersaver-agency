'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 ml-[var(--sidebar-width)] p-6 min-h-screen"
    >
      <div className="max-w-[1400px] mx-auto">
        {children}
      </div>
    </motion.main>
  );
}
