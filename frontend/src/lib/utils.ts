import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format minutes into a human-readable duration string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format a date to a relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

/**
 * Calculate Karma score based on total print time
 * Higher usage = Lower score
 */
export function calculateKarmaScore(totalPrintTimeHours: number): number {
  return 100 / (totalPrintTimeHours + 1);
}

/**
 * Generate a random temporary password
 */
export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
}

/**
 * Check if file is a valid STL file
 */
export function isValidSTLFile(file: File): boolean {
  const extension = getFileExtension(file.name);
  return extension === 'stl' || extension === 'gcode';
}

/**
 * Calculate live print progress and remaining time
 */
export function getPrintingProgress(
  estimatedMinutes: number | undefined,
  startedAt: Date | string | undefined,
  nowMs: number = Date.now()
): { progress: number; remainingMinutes: number } {
  if (!estimatedMinutes || estimatedMinutes <= 0 || !startedAt) {
    return { progress: 0, remainingMinutes: 0 };
  }

  const startMs = new Date(startedAt).getTime();
  const elapsedMs = Math.max(0, nowMs - startMs);
  const totalMs = estimatedMinutes * 60 * 1000;
  const progress = Math.min(100, (elapsedMs / totalMs) * 100);
  const remainingMs = Math.max(0, totalMs - elapsedMs);

  return {
    progress,
    remainingMinutes: Math.ceil(remainingMs / 60000),
  };
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
