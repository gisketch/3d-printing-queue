import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  StatCard,
  GlassTable,
  GlassTableHeader,
  GlassTableBody,
  GlassTableRow,
  GlassTableHead,
  GlassTableCell,
  GlassTableEmpty,
  GlassBadge,
  GlassProgress,
  GlassAvatar,
  GlassSeparator,

} from '../components/ui';
import { useJobs } from '../hooks/useJobs';
import { formatDuration, formatRelativeTime, getPrintingProgress } from '../lib/utils';

import { Printer, Clock, Users, Loader2, CheckCircle2, History, Zap, TrendingUp } from 'lucide-react';

export const QueueBoard: React.FC = () => {
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  // Get all active jobs
  const { jobs: printingJobs, isLoading: loadingPrinting } = useJobs({ status: 'printing' });
  const { jobs: queuedJobs, isLoading: loadingQueued } = useJobs({ status: 'queued' });
  const { jobs: completedJobs, isLoading: loadingCompleted } = useJobs({ status: 'completed' });

  const currentJob = printingJobs[0] || null;
  const currentProgress = currentJob
    ? getPrintingProgress(currentJob.estimated_duration_min, currentJob.updated, nowMs)
    : null;
  const recentCompleted = completedJobs.slice(0, 5);

  const isLoading = loadingPrinting || loadingQueued || loadingCompleted;

  // Calculate total queue time
  const queuedTime = queuedJobs.reduce(
    (acc, job) => acc + (job.estimated_duration_min || 0),
    0
  );
  const printingTimeLeft = currentProgress?.remainingMinutes || 0;
  const totalQueueTime = queuedTime + printingTimeLeft;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white">Print Queue</h1>
        <p className="text-white/60 mt-1">
          Live view of all print jobs
        </p>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Printer Status - Large Card */}
        <GlassCard 
          delay={0.1} 
          variant={currentJob ? 'glow' : 'default'}
          className="lg:col-span-2 lg:row-span-2"
          contentClassName="h-full"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${currentJob ? 'bg-emerald-500/20' : 'bg-white/[0.08]'}`}>
                  <Printer className={`w-6 h-6 ${currentJob ? 'text-emerald-400' : 'text-white/50'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Printer Status</h3>
                  <p className="text-sm text-white/50">Real-time monitoring</p>
                </div>
              </div>
              <GlassBadge variant={currentJob ? 'success' : 'default'} pulse={!!currentJob}>
                {currentJob ? 'Printing' : 'Idle'}
              </GlassBadge>
            </div>

            {currentJob ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-start gap-4 mb-6">
                  <GlassAvatar name={currentJob.expand?.user?.name || 'Unknown'} size="lg" />
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-white">
                      {currentJob.project_name}
                    </h4>
                    <p className="text-white/60">
                      by {currentJob.expand?.user?.name || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-white/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Est. {formatDuration(currentJob.estimated_duration_min || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Progress</span>
                    <span className="text-white">
                      {currentProgress ? formatDuration(currentProgress.remainingMinutes) + ' left' : 'In Progress'}
                    </span>
                  </div>
                  <GlassProgress value={currentProgress?.progress ?? 0} variant="success" size="lg" />
                  <p className="text-xs text-white/50">
                    Started {formatRelativeTime(currentJob.updated)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-4"
                >
                  <Printer className="w-10 h-10 text-white/30" />
                </motion.div>
                <p className="text-lg text-white/60">Printer is idle</p>
                <p className="text-sm text-white/40 mt-1">
                  {queuedJobs.length > 0 ? 'Next job will start soon' : 'No jobs in queue'}
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Stats Cards */}
        <StatCard
          label="Jobs in Queue"
          value={queuedJobs.length}
          icon={<Users className="w-5 h-5" />}
          variant="info"
          delay={0.15}
        />

        <StatCard
          label="Estimated Wait"
          value={totalQueueTime > 0 ? formatDuration(totalQueueTime) : '-'}
          icon={<Clock className="w-5 h-5" />}
          variant="warning"
          delay={0.2}
        />

        <StatCard
          label="Completed Today"
          value={completedJobs.length}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
          delay={0.25}
        />

        <StatCard
          label="Avg. Print Time"
          value={completedJobs.length > 0 
            ? formatDuration(Math.round(completedJobs.reduce((acc, j) => acc + (j.actual_duration_min || 0), 0) / completedJobs.length))
            : '-'}
          icon={<TrendingUp className="w-5 h-5" />}
          delay={0.3}
        />
      </div>

      {/* Up Next Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard delay={0.35} className="lg:col-span-1">
          <GlassCardHeader>
            <GlassCardTitle icon={<Zap className="w-5 h-5 text-amber-400" />}>
              Up Next
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            {queuedJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/50">Queue is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queuedJobs.slice(0, 4).map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={`p-3 rounded-xl ${
                      index === 0 
                        ? 'glass-alert-warning' 
                        : 'glass-sub-card'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${
                        index === 0 ? 'text-amber-400' : 'text-white/40'
                      }`}>
                        #{index + 1}
                      </span>
                      <GlassAvatar name={job.expand?.user?.name || 'Unknown'} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">
                          {job.project_name}
                        </p>
                        <p className="text-xs text-white/50">
                          {formatDuration(job.estimated_duration_min || 0)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {queuedJobs.length > 4 && (
                  <p className="text-center text-sm text-white/40 pt-2">
                    +{queuedJobs.length - 4} more in queue
                  </p>
                )}
              </div>
            )}
          </GlassCardContent>
        </GlassCard>

        {/* Full Queue Table */}
        <GlassCard delay={0.4} className="lg:col-span-2">
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle icon={<Users className="w-5 h-5 text-cyan-400" />}>
                Full Queue
              </GlassCardTitle>
              {queuedJobs.length > 0 && (
                <GlassBadge variant="primary">{queuedJobs.length} jobs</GlassBadge>
              )}
            </div>
          </GlassCardHeader>
          <GlassCardContent className="-mx-6 -mb-6">
            <GlassTable>
              <GlassTableHeader>
                <tr>
                  <GlassTableHead className="w-16">#</GlassTableHead>
                  <GlassTableHead>Project</GlassTableHead>
                  <GlassTableHead>User</GlassTableHead>
                  <GlassTableHead>Est. Duration</GlassTableHead>
                  <GlassTableHead>Queued</GlassTableHead>
                </tr>
              </GlassTableHeader>
              <GlassTableBody>
                {queuedJobs.length === 0 ? (
                  <GlassTableEmpty
                    icon={<Users className="w-8 h-8" />}
                    title="No jobs waiting"
                    description="The queue is empty"
                  />
                ) : (
                  queuedJobs.map((job, index) => (
                    <GlassTableRow key={job.id} delay={index * 0.03}>
                      <GlassTableCell className="font-bold text-white/40">
                        {index + 1}
                      </GlassTableCell>
                      <GlassTableCell>
                        <div className="flex items-center gap-3">
                          <GlassAvatar name={job.expand?.user?.name || 'Unknown'} size="sm" />
                          <span className="font-medium text-white">{job.project_name}</span>
                        </div>
                      </GlassTableCell>
                      <GlassTableCell className="text-white/60">
                        {job.expand?.user?.name || 'Unknown'}
                      </GlassTableCell>
                      <GlassTableCell>{formatDuration(job.estimated_duration_min || 0)}</GlassTableCell>
                      <GlassTableCell className="text-white/50">
                        {formatRelativeTime(job.created)}
                      </GlassTableCell>
                    </GlassTableRow>
                  ))
                )}
              </GlassTableBody>
            </GlassTable>
          </GlassCardContent>
        </GlassCard>
      </div>

      <GlassSeparator />

      {/* Recently Completed */}
      <GlassCard delay={0.45}>
        <GlassCardHeader>
          <GlassCardTitle icon={<History className="w-5 h-5 text-emerald-400" />}>
            Recently Completed
          </GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="-mx-6 -mb-6">
          <GlassTable>
            <GlassTableHeader>
              <tr>
                <GlassTableHead>Project</GlassTableHead>
                <GlassTableHead>User</GlassTableHead>
                <GlassTableHead>Duration</GlassTableHead>
                <GlassTableHead>Completed</GlassTableHead>
              </tr>
            </GlassTableHeader>
            <GlassTableBody>
              {recentCompleted.length === 0 ? (
                <GlassTableEmpty
                  icon={<History className="w-8 h-8" />}
                  title="No completed jobs yet"
                  description="Completed prints will appear here"
                />
              ) : (
                recentCompleted.map((job, index) => (
                  <GlassTableRow key={job.id} delay={index * 0.03}>
                    <GlassTableCell>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-medium text-white">{job.project_name}</span>
                      </div>
                    </GlassTableCell>
                    <GlassTableCell className="text-white/60">
                      {job.expand?.user?.name || 'Unknown'}
                    </GlassTableCell>
                    <GlassTableCell>
                      {formatDuration(job.actual_duration_min || job.estimated_duration_min || 0)}
                    </GlassTableCell>
                    <GlassTableCell className="text-white/50">
                      {formatRelativeTime(job.updated)}
                    </GlassTableCell>
                  </GlassTableRow>
                ))
              )}
            </GlassTableBody>
          </GlassTable>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
};