import React from 'react';
import { cn } from '../../glass';

export interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

// Use CSS component classes from index.css for proper border color handling
const variantStyles = {
  default: 'glass-badge-default',
  primary: 'glass-badge-primary',
  success: 'glass-badge-success',
  warning: 'glass-badge-warning',
  danger: 'glass-badge-danger',
  info: 'glass-badge-info',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs rounded-md',
  md: 'px-2.5 py-1 text-sm rounded-lg',
  lg: 'px-3 py-1.5 text-base rounded-xl',
};

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  className = '',
}) => (
  <span className={cn(
    'inline-flex items-center gap-1.5',
    'font-medium backdrop-blur-sm',
    variantStyles[variant],
    sizeStyles[size],
    className
  )}>
    {pulse && (
      <span className="relative flex h-2 w-2">
        <span className={cn(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          variant === 'success' && 'bg-emerald-400',
          variant === 'warning' && 'bg-amber-400',
          variant === 'danger' && 'bg-red-400',
          variant === 'primary' && 'bg-cyan-400',
          variant === 'info' && 'bg-blue-400',
          variant === 'default' && 'bg-white/60',
        )} />
        <span className={cn(
          'relative inline-flex rounded-full h-2 w-2',
          variant === 'success' && 'bg-emerald-400',
          variant === 'warning' && 'bg-amber-400',
          variant === 'danger' && 'bg-red-400',
          variant === 'primary' && 'bg-cyan-400',
          variant === 'info' && 'bg-blue-400',
          variant === 'default' && 'bg-white/60',
        )} />
      </span>
    )}
    {children}
  </span>
);

// Pill variant (more rounded)
export const GlassPill: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  className = '',
}) => (
  <GlassBadge
    variant={variant}
    size={size}
    pulse={pulse}
    className={cn('rounded-full', className)}
  >
    {children}
  </GlassBadge>
);

// Status indicator dot
export interface StatusDotProps {
  status: 'online' | 'offline' | 'busy' | 'away' | 'idle';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const statusColors = {
  online: 'bg-emerald-400',
  offline: 'bg-gray-400',
  busy: 'bg-red-400',
  away: 'bg-amber-400',
  idle: 'bg-blue-400',
};

const dotSizes = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 'md',
  pulse = false,
  className = '',
}) => (
  <span className={cn('relative flex', dotSizes[size], className)}>
    {pulse && status === 'online' && (
      <span className={cn(
        'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
        statusColors[status]
      )} />
    )}
    <span className={cn(
      'relative inline-flex rounded-full',
      dotSizes[size],
      statusColors[status]
    )} />
  </span>
);

export default GlassBadge;
