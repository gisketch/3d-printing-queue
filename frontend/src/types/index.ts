import type { RecordModel } from 'pocketbase';

// User roles
export type UserRole = 'user' | 'admin';

// Job statuses
export type JobStatus = 
  | 'pending_review' 
  | 'queued' 
  | 'printing' 
  | 'completed' 
  | 'rejected' 
  | 'failed';

// User record type
export interface User extends RecordModel {
  username: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  total_print_time: number; // in hours
  must_change_password: boolean;
  is_finance?: boolean; // Can access reports page
}

// Job record type
export interface Job extends RecordModel {
  project_name: string;
  stl_file?: string; // File field
  stl_link?: string; // Optional external link
  status: JobStatus;
  admin_notes?: string;
  price_pesos?: number; // Total cost (calculated)
  filament_cost?: number; // Raw filament cost from slicer
  electricity_cost?: number; // Calculated from duration * rate
  markup_cost?: number; // Calculated markup
  receipt_number?: string; // Auto-generated receipt ID (3DNTZ-YYYYMMDD-XXXX)
  estimated_duration_min?: number;
  actual_duration_min?: number;
  priority_score: number;
  is_paid?: boolean; // Payment status
  started_on?: string; // Timestamp when print started (used for print progress)
  completed_on?: string; // Timestamp when job was completed (used for reports)
  electricity_rate?: number; // Electricity rate at time of approval
  user: string; // Relation to users
  expand?: {
    user?: User;
  };
}

// Settings record type
export interface Settings extends RecordModel {
  key: string;
  value: number;
  description?: string;
}

// User request for account (pending approval)
export interface UserRequest extends RecordModel {
  full_name: string;
  desired_username: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

// Form types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface RequestAccessFormData {
  full_name: string;
  desired_username: string;
}

export interface JobSubmissionFormData {
  project_name: string;
  stl_file?: File;
  stl_link?: string;
}

export interface JobApprovalFormData {
  filament_cost: number;
  estimated_duration_hours: number;
  estimated_duration_mins: number;
  admin_notes?: string;
}

export interface JobCompletionFormData {
  actual_duration_hours: number;
  actual_duration_mins: number;
}

export interface PasswordChangeFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Status display config
export const JOB_STATUS_CONFIG: Record<JobStatus, { label: string; color: string; bgClass: string }> = {
  pending_review: { 
    label: 'Pending Review', 
    color: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30'
  },
  queued: { 
    label: 'In Queue', 
    color: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30'
  },
  printing: { 
    label: 'Printing Now', 
    color: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-100 dark:bg-green-900/30'
  },
  completed: { 
    label: 'Completed', 
    color: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30'
  },
  rejected: { 
    label: 'Rejected', 
    color: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-100 dark:bg-red-900/30'
  },
  failed: { 
    label: 'Failed', 
    color: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-100 dark:bg-red-900/30'
  },
};
