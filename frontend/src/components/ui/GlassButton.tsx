import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn, glass, glassButtonClasses } from '../../glass';

export interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const variantStyles = {
  default: cn(
    glass.blur.xl,
    glass.button,
    'text-white',
    'hover:bg-white/[0.12] hover:border-white/[0.20]',
    'active:bg-white/[0.15]'
  ),
  primary: cn(
    glass.blur.xl,
    'bg-cyan-500/20',
    'border border-cyan-400/30',
    'text-cyan-300',
    'hover:bg-cyan-500/30 hover:border-cyan-400/50',
    'active:bg-cyan-500/40',
    glass.shadow.glow,
    'hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]'
  ),
  success: cn(
    glass.blur.xl,
    'bg-emerald-500/20',
    'border border-emerald-400/30',
    'text-emerald-300',
    'hover:bg-emerald-500/30 hover:border-emerald-400/50',
    'active:bg-emerald-500/40',
    'shadow-[0_0_20px_rgba(52,211,153,0.25)]',
    'hover:shadow-[0_0_30px_rgba(52,211,153,0.35)]'
  ),
  danger: cn(
    glass.blur.xl,
    'bg-red-500/20',
    'border border-red-400/30',
    'text-red-300',
    'hover:bg-red-500/30 hover:border-red-400/50',
    'active:bg-red-500/40',
    'shadow-[0_0_20px_rgba(248,113,113,0.15)]'
  ),
  ghost: cn(
    'bg-transparent',
    'border border-transparent',
    'text-white/70',
    'hover:bg-white/[0.06] hover:text-white',
    'active:bg-white/[0.10]'
  ),
  glow: cn(
    glass.blur.xl,
    'bg-gradient-to-r from-purple-500/20 to-cyan-500/20',
    'border border-purple-400/30',
    'text-white',
    'hover:from-purple-500/30 hover:to-cyan-500/30 hover:border-purple-400/50',
    'animate-pulse-glow'
  ),
};

const sizeStyles = {
  sm: glassButtonClasses.sm,
  md: glassButtonClasses.md,
  lg: glassButtonClasses.lg,
  icon: glassButtonClasses.icon,
};

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={disabled || loading}
      className={cn(
        'relative overflow-hidden',
        'inline-flex items-center justify-center',
        'font-medium',
        'transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:ring-offset-2 focus:ring-offset-slate-900',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  );
};

// Icon Button variant
export const GlassIconButton: React.FC<Omit<GlassButtonProps, 'size'> & { size?: 'sm' | 'md' | 'lg' }> = ({
  children,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}) => {
  const iconSizeStyles = {
    sm: 'p-1.5 rounded-lg',
    md: 'p-2.5 rounded-xl',
    lg: 'p-3 rounded-2xl',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'inline-flex items-center justify-center',
        'transition-all duration-300',
        variantStyles[variant],
        iconSizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default GlassButton;
