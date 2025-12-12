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
export async function approveJob(jobId: string, data: JobApprovalFormData, isPaid: boolean = false): Promise<Job> {
  const estimatedMinutes = (data.estimated_duration_hours * 60) + data.estimated_duration_mins;

  // Generate receipt number
  const receiptNumber = generateReceiptNumber();

  // 1. Build update payload - only include defined values
  const updatePayload: Record<string, unknown> = {
    status: 'queued',
    price_pesos: data.filament_cost,
    receipt_number: receiptNumber,
    estimated_duration_min: estimatedMinutes,
    is_paid: isPaid,
  };

  // Only include admin_notes if it has a value
  if (data.admin_notes) {
    updatePayload.admin_notes = data.admin_notes;
  }

  // 2. Update job to queued
  const result = await pb.collection('jobs').update<Job>(jobId, updatePayload);

  // 3. Trigger global priority recalculation (don't fail if this errors)
  try {
    await recalculateAllQueuePriorities();
  } catch (priorityErr) {
    console.error('[ApproveJob] Priority recalculation failed (non-fatal):', priorityErr);
  }

  return result;
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
    started_on: new Date().toISOString(), // Set timestamp when print starts
  });
}

// Admin: Complete a job
export async function completeJob(
  jobId: string,
  actualDurationHours: number,
  actualDurationMins: number,
  isPaid: boolean = false
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
    is_paid: isPaid,
    completed_on: new Date().toISOString(),
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
    // Set duration and cost to 0 for failed jobs
    estimated_duration_min: 0,
    actual_duration_min: 0,
    price_pesos: 0,
    is_paid: false,
  };

  if (job.stl_file) {
    updateData['stl_file'] = null;
  }

  return await pb.collection('jobs').update<Job>(jobId, updateData);
}

// Admin: Toggle payment status for a job
export async function togglePaid(jobId: string, isPaid: boolean): Promise<Job> {
  return await pb.collection('jobs').update<Job>(jobId, { is_paid: isPaid });
}



// Calculate priority score (Pure logic)
function calculatePriorityScore(totalPrintTimeHours: number, estimatedDurationMins: number): number {
  // 1. Karma Score
  // Formula: Higher usage = Lower score
  // Adding +1 to avoid division by zero
  let score = 100 / (totalPrintTimeHours + 1);

  // 2. Gap Filler Logic
  // Small jobs (< 45 minutes) get a priority boost
  if (estimatedDurationMins > 0 && estimatedDurationMins < 45) {
    score = score + 50;
  }

  return Math.round(score * 100) / 100;
}

// Global: Recalculate priority for ALL queued jobs
// This mimics the previous hook logic but runs in the frontend for all jobs at once
export async function recalculateAllQueuePriorities(): Promise<void> {
  try {
    // 1. Fetch all queued jobs (expanded with user to get total_print_time)
    const queuedJobs = await pb.collection('jobs').getFullList<Job>({
      filter: 'status = "queued"',
      expand: 'user',
    });

    console.log(`[Frontend Priority] Recalculating for ${queuedJobs.length} jobs...`);

    // 2. Update each job
    // We execute these in parallel for speed
    const updatePromises = queuedJobs.map(async (job) => {
      const user = job.expand?.user;
      if (!user) return;

      const totalPrintTime = user.total_print_time || 0;
      const estimatedDuration = job.estimated_duration_min || 0;
      const newScore = calculatePriorityScore(totalPrintTime, estimatedDuration);

      // Only update if score changed
      if (job.priority_score !== newScore) {
        await pb.collection('jobs').update(job.id, {
          priority_score: newScore,
        });
        console.log(`[Frontend Priority] Job ${job.project_name}: ${job.priority_score} -> ${newScore}`);
      }
    });

    await Promise.all(updatePromises);
    console.log(`[Frontend Priority] Recalculation complete.`);
  } catch (err) {
    console.error("[Frontend Priority] Failed to recalculate queue:", err);
    throw err;
  }
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
