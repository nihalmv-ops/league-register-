import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingStyles = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = false,
  hover = false,
  padding = 'md',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-pitch-card/90 backdrop-blur-sm border border-pitch-border rounded-2xl shadow-card-dark ${
        hover ? 'transition-all duration-200 hover:border-pitch-border/80 hover:bg-pitch-cardHover/90' : ''
      } ${glow ? 'hover:border-football-accent/40 hover:shadow-pitch-glow' : ''} ${
        paddingStyles[padding]
      } ${className}`}
    >
      {children}
    </div>
  );
};
