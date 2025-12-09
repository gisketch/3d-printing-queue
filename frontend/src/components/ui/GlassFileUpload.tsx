import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../glass';
import { GlassIconButton } from './GlassButton';

export interface GlassFileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  title?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export const GlassFileUpload: React.FC<GlassFileUploadProps> = ({
  onFilesSelected,
  accept = '*',
  maxSize = 50 * 1024 * 1024, // 50MB default
  multiple = false,
  title = 'Drop files here or click to upload',
  description,
  className = '',
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFiles = useCallback((files: FileList): File[] => {
    const validFiles: File[] = [];
    setError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`);
        continue;
      }
      
      validFiles.push(file);
    }

    return validFiles;
  }, [maxSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = validateFiles(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(multiple ? files : [files[0]]);
    }
  }, [disabled, validateFiles, onFilesSelected, multiple]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = validateFiles(e.target.files);
      if (files.length > 0) {
        onFilesSelected(multiple ? files : [files[0]]);
      }
    }
  }, [validateFiles, onFilesSelected, multiple]);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div className={className}>
      <motion.div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? 'rgba(34, 211, 238, 0.5)' : 'rgba(255, 255, 255, 0.1)',
        }}
        className={cn(
          'relative cursor-pointer',
          'backdrop-blur-xl bg-white/[0.03]',
          'border-2 border-dashed border-white/[0.10]',
          'rounded-2xl p-8',
          'transition-all duration-200',
          'hover:bg-white/[0.05] hover:border-white/[0.15]',
          isDragging && 'bg-cyan-500/10 border-cyan-400/50',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="text-center">
          <motion.div
            animate={{ y: isDragging ? -5 : 0 }}
            className={cn(
              'w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center',
              isDragging ? 'bg-cyan-500/20' : 'bg-white/[0.05]'
            )}
          >
            <Upload className={cn(
              'w-6 h-6',
              isDragging ? 'text-cyan-400' : 'text-white/50'
            )} />
          </motion.div>

          <p className="text-white/80 font-medium">{title}</p>
          {description && (
            <p className="text-white/50 text-sm mt-1">{description}</p>
          )}
        </div>

        {/* Glow effect when dragging */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center gap-2 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// File Preview Component
export interface GlassFilePreviewProps {
  file: File;
  onRemove?: () => void;
  className?: string;
}

export const GlassFilePreview: React.FC<GlassFilePreviewProps> = ({
  file,
  onRemove,
  className = '',
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'flex items-center gap-3 p-3',
        'backdrop-blur-xl bg-white/[0.05]',
        'border border-white/[0.10]',
        'rounded-xl',
        className
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
        <File className="w-5 h-5 text-cyan-400" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-white/90 font-medium truncate">{file.name}</p>
        <p className="text-white/50 text-sm">{formatFileSize(file.size)}</p>
      </div>

      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        {onRemove && (
          <GlassIconButton onClick={onRemove} variant="ghost" size="sm">
            <X className="w-4 h-4 text-white/60" />
          </GlassIconButton>
        )}
      </div>
    </motion.div>
  );
};

export default GlassFileUpload;
