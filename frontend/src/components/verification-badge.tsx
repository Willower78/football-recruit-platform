'use client';

import { BadgeCheck } from 'lucide-react';

interface VerificationBadgeProps {
  tier: 'unverified' | 'verified' | 'official' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeMap = { sm: 14, md: 18, lg: 22 };

export function VerificationBadge({ tier, size = 'sm', label }: VerificationBadgeProps) {
  if (tier === 'unverified' || tier === 'pending') return null;

  const iconSize = sizeMap[size];
  const isOfficial = tier === 'official';

  return (
    <span
      className="inline-flex items-center gap-0.5"
      title={label ?? (isOfficial ? 'Official Club' : 'Verified Club')}
    >
      <BadgeCheck
        className={isOfficial ? 'text-amber-500' : 'text-blue-500'}
        size={iconSize}
      />
    </span>
  );
}
