/**
 * Glassmorphism Design System
 * Reusable styles and utilities for the frosted glass aesthetic
 */

// Base glass background styles (use with cn() or template literals)
export const glass = {
  // Backgrounds
  bg: {
    subtle: 'bg-white/[0.03]',
    light: 'bg-white/[0.06]',
    medium: 'bg-white/[0.10]',
    strong: 'bg-white/[0.15]',
  },

  // Borders
  border: {
    subtle: 'border border-white/[0.05]',
    light: 'border border-white/[0.08]',
    medium: 'border border-white/[0.12]',
    strong: 'border border-white/[0.20]',
    glow: 'border border-cyan-400/30',
  },

  // Blur effects
  blur: {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-glass', // 36px
    '2xl': 'backdrop-blur-2xl',
    glass: 'backdrop-blur-glass', // 36px
  },

  // Shadows
  shadow: {
    subtle: 'shadow-[0_4px_16px_rgba(0,0,0,0.2)]',
    medium: 'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
    strong: 'shadow-[0_12px_48px_rgba(0,0,0,0.4)]',
    glow: 'shadow-[0_0_30px_rgba(34,211,238,0.2)]',
    glowStrong: 'shadow-[0_0_40px_rgba(34,211,238,0.3)]',
  },

  // Combined presets for common use cases
  card: 'backdrop-blur-xl bg-white/[0.03] border border-white/[0.08]',
  cardHover: 'hover:bg-white/[0.06] hover:border-white/[0.12]',
  button: 'backdrop-blur-xl bg-white/[0.08] border border-white/[0.15]',
  buttonActive: 'bg-white/[0.12] border-cyan-400/30',
  modal: 'backdrop-blur-2xl bg-white/[0.05] border border-white/[0.10]',
  surface: 'backdrop-blur-xl bg-white/[0.02] border border-white/[0.05]',
};

// Common rounded corners
export const rounded = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  full: 'rounded-full',
};

// CSS-in-JS style objects for dynamic styling
export const glassStyles = {
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(36px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  button: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(36px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  modal: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(40px)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
  },
};


// Utility to combine class names (robust version with tailwind-merge)
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// Reusable Glass Button Classes
// ============================================
export const glassButtonClasses = {
  base: cn(
    'relative overflow-hidden',
    'backdrop-blur-xl bg-white/[0.08]',
    'border border-white/[0.15]',
    'transition-all duration-300',
    'hover:bg-white/[0.12] hover:border-white/[0.20]',
    'active:scale-95'
  ),
  sm: 'px-3 py-1.5 rounded-lg text-sm',
  md: 'px-4 py-2 rounded-xl text-base',
  lg: 'px-6 py-3 rounded-2xl text-lg',
  icon: 'p-2.5 rounded-xl',
  iconLg: 'p-3 rounded-2xl',
  circle: 'rounded-full',
  active: 'border-cyan-400/50 bg-white/[0.12] shadow-[0_0_20px_rgba(34,211,238,0.2)]',
  glow: 'shadow-[0_0_20px_rgba(34,211,238,0.15)]',
};

