import * as React from "react";
import { X } from "lucide-react";
import { Button } from "gisketch-neumorphism";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hideCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "",
  hideCloseButton = false,
}) => {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !hideCloseButton) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, hideCloseButton]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center top-0 left-0 right-0 bottom-0 w-screen h-screen">
      {/* Backdrop */}
      <div
        className="fixed inset-0 top-0 left-0 w-screen h-screen bg-black/60 backdrop-blur-md animate-fade-in"
        onClick={hideCloseButton ? undefined : onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative z-10 w-full max-w-lg mx-4 rounded-2xl bg-background p-6
          shadow-[-8px_-8px_16px_rgba(var(--shadow-light)),8px_8px_16px_rgba(var(--shadow-dark))]
          animate-slide-up ${className}`}
      >
        {/* Close Button */}
        {!hideCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Header */}
        {(title || description) && (
          <div className="mb-6 pr-8">
            {title && (
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        {/* Body */}
        {children}
      </div>
    </div>
  );
};
