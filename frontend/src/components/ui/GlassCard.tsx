import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn, glass, rounded } from '../../glass';

// Animation variants for card entrance
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'strong' | 'glow' | 'elevated';
  hover?: boolean;
  className?: string;
  contentClassName?: string;
  delay?: number;
  animate?: boolean;
}

const variantStyles = {
  default: cn(
    glass.blur.glass,
    glass.bg.subtle,
    glass.border.light,
    glass.shadow.medium
  ),
  subtle: cn(
    glass.blur.lg,
    glass.bg.subtle,
    glass.border.subtle,
    glass.shadow.subtle
  ),
  strong: cn(
    glass.blur['2xl'],
    glass.bg.medium,
    glass.border.medium,
    glass.shadow.strong
  ),
  glow: cn(
    glass.blur.xl,
    glass.bg.light,
    glass.border.glow,
    glass.shadow.glow
  ),
  elevated: cn(
    glass.blur.glass,
    glass.bg.medium,
    glass.border.light,
    glass.shadow.strong
  ),
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  hover = false,
  className = '',
  contentClassName = '',
  delay = 0,
  animate = true,
  ...props
}) => {
  const cardContent = (
    <>
      {/* Top highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Content */}
      <div className={cn('relative p-6', contentClassName)}>
        {children}
      </div>
    </>
  );

  if (animate) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={delay}
        className={cn(
          'relative overflow-hidden',
          rounded.lg,
          variantStyles[variant],
          hover && glass.cardHover,
          'transition-[background-color,border-color,box-shadow] duration-300',
          className
        )}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        rounded.lg,
        variantStyles[variant],
        hover && glass.cardHover,
        'transition-all duration-300',
        className
      )}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      {cardContent}
    </div>
  );
};

// Card Header
export const GlassCardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={cn('mb-4', className)}>
    {children}
  </div>
);

// Card Title
export const GlassCardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}> = ({ children, className = '', icon }) => (
  <h3 className={cn('flex items-center gap-3 text-lg font-semibold text-white', className)}>
    {icon && (
      <span className={cn('p-2', rounded.md, glass.bg.medium, glass.blur.sm)}>
        {icon}
      </span>
    )}
    {children}
  </h3>
);

// Card Description
export const GlassCardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <p className={cn('text-sm text-white/60 mt-1', className)}>
    {children}
  </p>
);

// Card Content
export const GlassCardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

// Card Footer
export const GlassCardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={cn('mt-4 pt-4 border-t border-white/[0.08]', className)}>
    {children}
  </div>
);

// Stat Card variant
export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  trend?: { value: number; label: string };
  delay?: number;
  className?: string;
}

const statVariantStyles = {
  default: {
    icon: 'text-cyan-400',
    glow: 'rgba(34, 211, 238, 0.5)',
    border: glass.border.glow,
  },
  success: {
    icon: 'text-emerald-400',
    glow: 'rgba(52, 211, 153, 0.5)',
    border: 'border border-emerald-400/30',
  },
  warning: {
    icon: 'text-amber-400',
    glow: 'rgba(251, 191, 36, 0.5)',
    border: 'border border-amber-400/30',
  },
  danger: {
    icon: 'text-red-400',
    glow: 'rgba(248, 113, 113, 0.5)',
    border: 'border border-red-400/30',
  },
  info: {
    icon: 'text-purple-400',
    glow: 'rgba(192, 132, 252, 0.5)',
    border: 'border border-purple-400/30',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  variant = 'default',
  trend,
  delay = 0,
  className = '',
}) => {
  const styles = statVariantStyles[variant];

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
      className="flex-1"
    >
      <div
        className={cn(
          'relative overflow-hidden h-full',
          rounded.lg,
          glass.blur.xl,
          glass.bg.subtle,
          styles.border,
          'transition-all duration-300',
          glass.cardHover,
          className
        )}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, transparent, ${styles.glow}, transparent)`,
          }}
        />

        {/* Top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            {icon && <span className={styles.icon}>{icon}</span>}
            <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
          </div>

          {/* Value */}
          <div className="flex items-baseline gap-1">
            <span className={cn('text-3xl font-bold tracking-tight', styles.icon)}>
              {value}
            </span>
          </div>

          {/* Trend */}
          {trend && (
            <div className="mt-2 pt-2 border-t border-white/[0.06]">
              <span className={cn(
                'text-xs',
                trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GlassCard;
