import { useState, useEffect, useCallback } from 'react';
import pb from '../lib/pocketbase';
import type { Job } from '../types';

interface UseJobsOptions {
  status?: string | string[];
  userId?: string;
  realtime?: boolean;
}

export function useJobs(options: UseJobsOptions = {}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { status, userId, realtime = true } = options;

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let filter = '';
      const filters: string[] = [];

      // Build status filter
      if (status) {
        if (Array.isArray(status)) {
          const statusFilters = status.map(s => `status = "${s}"`).join(' || ');
          filters.push(`(${statusFilters})`);
        } else {
          filters.push(`status = "${status}"`);
        }
      }

      // Build user filter
      if (userId) {
        filters.push(`user = "${userId}"`);
      }

      filter = filters.join(' && ');

      const records = await pb.collection('jobs').getFullList<Job>({
        sort: '-priority_score,created',
        expand: 'user',
        filter: filter || undefined,
      });

      setJobs(records);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch jobs'));
    } finally {
      setIsLoading(false);
    }
  }, [status, userId]);

  useEffect(() => {
    fetchJobs();

    // Set up realtime subscription
    if (realtime) {
      pb.collection('jobs').subscribe('*', () => {
        fetchJobs();
      });

      return () => {
        pb.collection('jobs').unsubscribe('*');
      };
    }
  }, [fetchJobs, realtime]);

  return { jobs, isLoading, error, refetch: fetchJobs };
}

export function useJob(jobId: string | undefined) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) {
      setJob(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const record = await pb.collection('jobs').getOne<Job>(jobId, {
        expand: 'user',
      });
      setJob(record);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch job'));
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();

    // Set up realtime subscription for this specific job
    if (jobId) {
      pb.collection('jobs').subscribe(jobId, () => {
        fetchJob();
      });

      return () => {
        pb.collection('jobs').unsubscribe(jobId);
      };
    }
  }, [jobId, fetchJob]);

  return { job, isLoading, error, refetch: fetchJob };
}

// Check if user has an active job (for the "one job" rule)
export function useHasActiveJob(userId: string | undefined) {
  const [hasActiveJob, setHasActiveJob] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkActiveJob = async () => {
      if (!userId) {
        setHasActiveJob(false);
        setActiveJob(null);
        setIsLoading(false);
        return;
      }

      try {
        const activeStatuses = ['pending_review', 'queued', 'printing'];
        const statusFilter = activeStatuses.map(s => `status = "${s}"`).join(' || ');
        
        const records = await pb.collection('jobs').getList<Job>(1, 1, {
          filter: `user = "${userId}" && (${statusFilter})`,
          sort: '-created',
        });

        setHasActiveJob(records.totalItems > 0);
        setActiveJob(records.items[0] || null);
      } catch {
        setHasActiveJob(false);
        setActiveJob(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkActiveJob();

    // Subscribe to changes
    pb.collection('jobs').subscribe('*', () => {
      checkActiveJob();
    });

    return () => {
      pb.collection('jobs').unsubscribe('*');
    };
  }, [userId]);

  return { hasActiveJob, activeJob, isLoading };
}
