import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../glass';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled';
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(({
  label,
  error,
  icon,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white/70 mb-2">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* {icon && ( */}
        {/*   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"> */}
        {/*     {icon} */}
        {/*   </div> */}
        {/* )} */}

        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5',
            'glass-input',
            'rounded-xl',
            'transition-all duration-200',
            error && 'glass-input-error',
            icon ? 'pl-10' : '',
            props.disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          {...props}
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

// Textarea variant
export interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white/70 mb-2">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-3',
          'glass-input',
          'rounded-xl',
          'transition-all duration-200',
          'resize-none',
          error && 'glass-input-error',
          props.disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      />

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

GlassTextarea.displayName = 'GlassTextarea';

// Select variant
export interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(({
  label,
  error,
  options,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white/70 mb-2">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <select
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5',
          'glass-input',
          'rounded-xl',
          'transition-all duration-200',
          'cursor-pointer',
          // Style the dropdown
          '[&>option]:bg-slate-900 [&>option]:text-white',
          error && 'glass-input-error',
          props.disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

GlassSelect.displayName = 'GlassSelect';

// Form Field wrapper
export interface FormFieldProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const GlassFormField: React.FC<FormFieldProps> = ({
  label,
  description,
  error,
  required,
  children,
  className = '',
}) => (
  <div className={cn('w-full', className)}>
    {label && (
      <label className="block text-sm font-medium text-white/70 mb-1">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    )}
    {description && (
      <p className="text-xs text-white/50 mb-2">{description}</p>
    )}
    {children}
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1.5 text-sm text-red-400"
      >
        {error}
      </motion.p>
    )}
  </div>
);

export default GlassInput;
