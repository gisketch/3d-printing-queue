import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../glass';

// Progress Bar
export interface GlassProgressProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'glow';
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

const progressVariants = {
  default: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  success: 'bg-gradient-to-r from-emerald-500 to-green-500',
  warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
  danger: 'bg-gradient-to-r from-red-500 to-rose-500',
  glow: 'bg-gradient-to-r from-purple-500 to-pink-500',
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const GlassProgress: React.FC<GlassProgressProps> = ({
  value,
  size = 'md',
  variant = 'default',
  showValue = false,
  animated = true,
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'relative w-full overflow-hidden rounded-full',
        'bg-white/[0.08]',
        sizeStyles[size]
      )}>
        <motion.div
          initial={animated ? { width: 0 } : { width: `${clampedValue}%` }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full',
            progressVariants[variant],
            'shadow-[0_0_10px_rgba(34,211,238,0.3)]'
          )}
        />
      </div>
      {showValue && (
        <p className="text-sm text-white/60 mt-1 text-right">
          {Math.round(clampedValue)}%
        </p>
      )}
    </div>
  );
};

// Separator/Divider
export interface GlassSeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const GlassSeparator: React.FC<GlassSeparatorProps> = ({
  orientation = 'horizontal',
  className = '',
}) => (
  <div
    className={cn(
      'bg-white/[0.08]',
      orientation === 'horizontal' ? 'h-px w-full my-4' : 'w-px h-full mx-4',
      className
    )}
  />
);

// Avatar
export interface GlassAvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const avatarSizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export const GlassAvatar: React.FC<GlassAvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn(
      'rounded-xl overflow-hidden',
      'bg-gradient-to-br from-cyan-400/20 to-purple-400/20',
      'border border-white/[0.10]',
      'flex items-center justify-center',
      'font-semibold text-white/80',
      avatarSizes[size],
      className
    )}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
};

// Skeleton Loader
export interface GlassSkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const GlassSkeleton: React.FC<GlassSkeletonProps> = ({
  width,
  height,
  className = '',
  variant = 'rectangular',
}) => (
  <motion.div
    animate={{ opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 1.5, repeat: Infinity }}
    className={cn(
      'bg-white/[0.08]',
      variant === 'circular' && 'rounded-full',
      variant === 'rectangular' && 'rounded-xl',
      variant === 'text' && 'rounded-md h-4',
      className
    )}
    style={{ width, height }}
  />
);

// Tabs
export interface GlassTabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const GlassTabs: React.FC<GlassTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => (
  <div className={cn(
    'inline-flex p-1.5 gap-1',
    'backdrop-blur-glass bg-white/[0.03]',
    'border border-white/[0.08]',
    'rounded-2xl',
    className
  )}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          'px-5 py-2.5 rounded-xl',
          'text-sm font-medium',
          'transition-all duration-200',
          'flex items-center gap-2',
          activeTab === tab.id
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
            : 'text-white/50 hover:text-white hover:bg-white/[0.04] border border-transparent'
        )}
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </div>
);

// Tooltip wrapper (simple CSS-based)
export interface GlassTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const GlassTooltip: React.FC<GlassTooltipProps> = ({
  content,
  children,
  position = 'top',
}) => (
  <div className="relative group inline-block">
    {children}
    <div className={cn(
      'absolute z-50 px-2 py-1',
      'backdrop-blur-xl bg-slate-800/90',
      'border border-white/[0.10]',
      'rounded-lg text-xs text-white',
      'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
      'transition-all duration-200',
      'whitespace-nowrap',
      position === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      position === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-2',
      position === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-2',
      position === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-2',
    )}>
      {content}
    </div>
  </div>
);

export default GlassProgress;
