import pb from '../lib/pocketbase';
import type { Job, JobSubmissionFormData, JobApprovalFormData, Settings } from '../types';

// Default settings values (fallback if not configured)
const DEFAULT_ELECTRICITY_RATE = 7.5; // PHP per hour
const DEFAULT_MARKUP_PERCENTAGE = 20; // 20%

// Fetch a setting value
export async function getSetting(key: string): Promise<number | null> {
  try {
    const record = await pb.collection('settings').getFirstListItem<Settings>(`key = "${key}"`);
    return record.value;
  } catch {
    return null;
  }
}

// Fetch all settings
export async function getAllSettings(): Promise<Record<string, number>> {
  try {
    const records = await pb.collection('settings').getFullList<Settings>();
    const settings: Record<string, number> = {};
    records.forEach(r => { settings[r.key] = r.value; });
    return settings;
  } catch {
    return {};
  }
}

// Update a setting
export async function updateSetting(key: string, value: number): Promise<void> {
  try {
    const record = await pb.collection('settings').getFirstListItem<Settings>(`key = "${key}"`);
    await pb.collection('settings').update(record.id, { value });
  } catch {
    // Setting doesn't exist, create it
    await pb.collection('settings').create({ key, value });
  }
}

// Generate receipt number: 3DNTZ-YYYYMMDD-XXXX
export function generateReceiptNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `3DNTZ-${dateStr}-${random}`;
}

// Calculate cost breakdown
export async function calculateCosts(
  filamentCost: number,
  estimatedMinutes: number
): Promise<{ electricityCost: number; markupCost: number; totalCost: number }> {
  const settings = await getAllSettings();
  const electricityRate = settings['electricity_rate_per_hour'] ?? DEFAULT_ELECTRICITY_RATE;
  const markupPercentage = settings['markup_percentage'] ?? DEFAULT_MARKUP_PERCENTAGE;

  const hours = estimatedMinutes / 60;
  const electricityCost = Math.round(hours * electricityRate * 100) / 100;
  const subtotal = filamentCost + electricityCost;
  const markupCost = Math.round(subtotal * (markupPercentage / 100) * 100) / 100;
  const totalCost = Math.round((subtotal + markupCost) * 100) / 100;

  return { electricityCost, markupCost, totalCost };
}

// Create a new job submission
export async function createJob(userId: string, data: JobSubmissionFormData): Promise<Job> {
  const formData = new FormData();
  formData.append('project_name', data.project_name);
  formData.append('user', userId);
  formData.append('status', 'pending_review');
  formData.append('priority_score', '0');

  if (data.stl_file) {
    formData.append('stl_file', data.stl_file);
  }

  if (data.stl_link) {
    formData.append('stl_link', data.stl_link);
  }

  return await pb.collection('jobs').create<Job>(formData);
}

// Admin: Approve a job with pricing and duration
export async function approveJob(jobId: string, data: JobApprovalFormData): Promise<Job> {
  const estimatedMinutes = (data.estimated_duration_hours * 60) + data.estimated_duration_mins;

  // Calculate costs
  const { electricityCost, markupCost, totalCost } = await calculateCosts(
    data.filament_cost,
    estimatedMinutes
  );

  // Generate receipt number
  const receiptNumber = generateReceiptNumber();

  return await pb.collection('jobs').update<Job>(jobId, {
    status: 'queued',
    filament_cost: data.filament_cost,
    electricity_cost: electricityCost,
    markup_cost: markupCost,
    price_pesos: totalCost,
    receipt_number: receiptNumber,
    estimated_duration_min: estimatedMinutes,
    admin_notes: data.admin_notes,
    // Priority score will be calculated by PocketBase hooks
  });
}

// Admin: Reject a job
export async function rejectJob(jobId: string, notes?: string): Promise<Job> {
  return await pb.collection('jobs').update<Job>(jobId, {
    status: 'rejected',
    admin_notes: notes,
  });
}

// Admin: Start printing a job
export async function startPrinting(jobId: string): Promise<Job> {
  return await pb.collection('jobs').update<Job>(jobId, {
    status: 'printing',
  });
}

// Admin: Complete a job
export async function completeJob(
  jobId: string,
  actualDurationHours: number,
  actualDurationMins: number
): Promise<Job> {
  const actualMinutes = (actualDurationHours * 60) + actualDurationMins;

  // Get the job first to access user info
  const job = await pb.collection('jobs').getOne<Job>(jobId, { expand: 'user' });
  const user = job.expand?.user;

  // Update user's total print time (convert minutes to hours)
  if (user) {
    const additionalHours = actualMinutes / 60;
    await pb.collection('users').update(user.id, {
      total_print_time: (user.total_print_time || 0) + additionalHours,
    });
  }

  // Delete the STL file to save space
  const updateData: Record<string, unknown> = {
    status: 'completed',
    actual_duration_min: actualMinutes,
  };

  // Remove the STL file if it exists
  if (job.stl_file) {
    updateData['stl_file'] = null;
  }

  return await pb.collection('jobs').update<Job>(jobId, updateData);
}

// Admin: Mark a job as failed (doesn't penalize user)
export async function failJob(jobId: string, notes?: string): Promise<Job> {
  // Delete the STL file to save space
  const job = await pb.collection('jobs').getOne<Job>(jobId);
  
  const updateData: Record<string, unknown> = {
    status: 'failed',
    admin_notes: notes,
  };

  if (job.stl_file) {
    updateData['stl_file'] = null;
  }

  return await pb.collection('jobs').update<Job>(jobId, updateData);
}

// Get download URL for STL file
export function getSTLFileUrl(job: Job): string | null {
  if (!job.stl_file) return null;
  return pb.files.getURL(job, job.stl_file);
}

// Get queue statistics
export async function getQueueStats(): Promise<{
  totalQueued: number;
  totalPrinting: number;
  totalPendingReview: number;
  estimatedQueueTime: number;
}> {
  const [queued, printing, pending] = await Promise.all([
    pb.collection('jobs').getList<Job>(1, 100, { filter: 'status = "queued"' }),
    pb.collection('jobs').getList<Job>(1, 1, { filter: 'status = "printing"' }),
    pb.collection('jobs').getList<Job>(1, 100, { filter: 'status = "pending_review"' }),
  ]);

  const estimatedQueueTime = queued.items.reduce(
    (acc, job) => acc + (job.estimated_duration_min || 0),
    0
  );

  return {
    totalQueued: queued.totalItems,
    totalPrinting: printing.totalItems,
    totalPendingReview: pending.totalItems,
    estimatedQueueTime,
  };
}
