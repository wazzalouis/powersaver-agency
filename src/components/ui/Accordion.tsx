'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Accordion({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function AccordionItem({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  children,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-fusion-cream-dark/30 rounded-[var(--fusion-radius-lg)] bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-fusion-cream/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="text-sm font-medium text-fusion-text truncate">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-fusion-text-muted mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-3"
        >
          <ChevronDown size={16} className="text-fusion-text-muted" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-fusion-cream-dark/20 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
