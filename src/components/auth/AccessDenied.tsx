'use client';

import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface AccessDeniedProps {
  message?: string;
}

export function AccessDenied({ message = 'You do not have permission to access this page.' }: AccessDeniedProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-fusion-danger/10 flex items-center justify-center mx-auto mb-4">
          <ShieldX size={28} className="text-fusion-danger" />
        </div>
        <h2 className="text-lg font-medium text-fusion-text mb-2">Access Denied</h2>
        <p className="text-sm text-fusion-text-secondary mb-6">{message}</p>
        <Link href="/overview">
          <Button variant="outline" size="sm">Back to Overview</Button>
        </Link>
      </div>
    </div>
  );
}
