import React from 'react';

export type BadgeVariant = 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'slate' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  green: 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30',
  blue: 'bg-blue-950/70 text-blue-400 border border-blue-500/30',
  yellow: 'bg-amber-950/70 text-amber-400 border border-amber-500/30',
  red: 'bg-rose-950/70 text-rose-400 border border-rose-500/30',
  purple: 'bg-purple-950/70 text-purple-400 border border-purple-500/30',
  slate: 'bg-pitch-dark text-slate-300 border border-pitch-border',
  outline: 'bg-transparent text-slate-300 border border-slate-700',
};

const dotColors: Record<BadgeVariant, string> = {
  green: 'bg-emerald-400',
  blue: 'bg-blue-400',
  yellow: 'bg-amber-400',
  red: 'bg-rose-400',
  purple: 'bg-purple-400',
  slate: 'bg-slate-400',
  outline: 'bg-slate-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />
      )}
      {children}
    </span>
  );
};
