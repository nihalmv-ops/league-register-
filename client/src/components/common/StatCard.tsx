import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export type StatColor = 'orange' | 'green' | 'blue' | 'yellow' | 'red' | 'purple';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: StatColor;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  badge?: string;
  onClick?: () => void;
  className?: string;
}

const colorVariants: Record<
  StatColor,
  {
    iconBg: string;
    iconColor: string;
    border: string;
    accentGlow: string;
    textHighlight: string;
  }
> = {
  orange: {
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-400',
    border: 'border-orange-500/20 hover:border-orange-500/40',
    accentGlow: 'hover:shadow-[0_0_20px_-3px_rgba(249,115,22,0.35)]',
    textHighlight: 'text-orange-400',
  },
  green: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    accentGlow: 'hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.25)]',
    textHighlight: 'text-emerald-400',
  },
  blue: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    accentGlow: 'hover:shadow-[0_0_20px_-3px_rgba(59,130,246,0.25)]',
    textHighlight: 'text-blue-400',
  },
  yellow: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    accentGlow: 'hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.25)]',
    textHighlight: 'text-amber-400',
  },
  red: {
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    border: 'border-rose-500/20 hover:border-rose-500/40',
    accentGlow: 'hover:shadow-[0_0_20px_-3px_rgba(244,63,94,0.25)]',
    textHighlight: 'text-rose-400',
  },
  purple: {
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    border: 'border-purple-500/20 hover:border-purple-500/40',
    accentGlow: 'hover:shadow-[0_0_20px_-3px_rgba(168,85,247,0.25)]',
    textHighlight: 'text-purple-400',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'orange',
  trend,
  badge,
  onClick,
  className = '',
}) => {
  const styles = colorVariants[color] || colorVariants.orange;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-pitch-card/90 backdrop-blur-md p-5 border ${styles.border} ${styles.accentGlow} transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      } ${className}`}
    >
      {/* Subtle top indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${color === 'orange' ? 'orange-500' : color === 'green' ? 'emerald-500' : color === 'blue' ? 'blue-500' : color === 'yellow' ? 'amber-500' : color === 'red' ? 'rose-500' : 'purple-500'}/60 to-transparent opacity-60`} />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {value}
            </h3>
            {badge && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className={`p-3 rounded-xl border border-slate-700/50 ${styles.iconBg} ${styles.iconColor}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-pitch-border/60 flex items-center justify-between text-xs text-slate-400">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <div
              className={`flex items-center gap-1 font-medium ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{trend.value}</span>
              {trend.label && <span className="text-slate-500 font-normal ml-0.5">{trend.label}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
