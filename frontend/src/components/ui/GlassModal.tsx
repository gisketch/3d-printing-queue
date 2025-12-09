import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn, rounded } from '../../glass';
import { GlassIconButton } from './GlassButton';

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hideCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[90vw]',
};

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = '',
  hideCloseButton = false,
  size = 'md',
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !hideCloseButton) onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, hideCloseButton]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={hideCloseButton ? undefined : onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={cn(
              'relative z-10 w-full overflow-hidden',
              sizeClasses[size],
              rounded.lg,
              'glass-modal shadow-[0_12px_48px_rgba(0,0,0,0.4)]',
              className
            )}
          >
            {/* Top highlight line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />

            {/* Content wrapper */}
            <div className="relative p-6">
              {/* Close Button */}
              {!hideCloseButton && (
                <GlassIconButton
                  onClick={onClose}
                  className="absolute right-4 top-4"
                  variant="ghost"
                >
                  <X className="h-4 w-4 text-white/60" />
                </GlassIconButton>
              )}

              {/* Header */}
              {(title || description) && (
                <div className="mb-6 pr-8">
                  {title && (
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-white/60">{description}</p>
                  )}
                </div>
              )}

              {/* Body */}
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Modal Footer
export const GlassModalFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={cn(
    'flex gap-3 pt-4 mt-4',
    className
  )}>
    {children}
  </div>
);

export default GlassModal;
