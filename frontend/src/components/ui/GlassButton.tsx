import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../glass';

export interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

// Use CSS component classes from index.css for proper styling
// These classes are defined outside @layer for higher specificity
const variantStyles = {
  default: 'glass-btn-default',
  primary: 'glass-btn-primary',
  success: 'glass-btn-success',
  danger: 'glass-btn-danger',
  warning: 'glass-btn-warning',
  ghost: 'glass-btn-ghost',
  secondary: 'glass-btn-secondary',
};

// Size classes - pure padding/sizing, no color/bg
const sizeStyles = {
  sm: 'px-3 py-1.5 rounded-lg text-sm',
  md: 'px-4 py-2 rounded-xl text-base',
  lg: 'px-6 py-3 rounded-2xl text-lg',
  icon: 'p-2.5 rounded-xl',
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
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={disabled || loading}
      className={cn(
        // Layout & positioning
        'relative overflow-hidden',
        'inline-flex items-center justify-center',
        // Transition
        'transition-all duration-300',
        // Focus ring
        'focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:ring-offset-2 focus:ring-offset-slate-900',
        // Size (padding, rounded, text size)
        sizeStyles[size],
        // Variant (color, bg, border, shadow - from CSS)
        variantStyles[variant],
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed',
        // Custom classes
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
