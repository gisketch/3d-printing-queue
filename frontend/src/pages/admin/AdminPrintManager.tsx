import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  GlassTable,
  GlassTableHeader,
  GlassTableBody,
  GlassTableRow,
  GlassTableHead,
  GlassTableCell,
  GlassBadge,
  GlassButton,
  GlassModal,
  GlassModalFooter,
  GlassInput,
  GlassTextarea,
  GlassFormField,
  GlassSeparator,
  GlassProgress,
  StatCard,
} from '../../components/ui';
import { useJobs } from '../../hooks/useJobs';
import { startPrinting, completeJob, failJob } from '../../services/jobService';
import { formatDuration, formatRelativeTime } from '../../lib/utils';
import type { Job } from '../../types';
import {
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  User,
  Printer,
  ListOrdered,
  History,
  Zap,
} from 'lucide-react';

export const AdminPrintManager: React.FC = () => {
  // Get printing and queued jobs
  const { jobs: printingJobs, isLoading: loadingPrinting } = useJobs({ status: 'printing' });
  const { jobs: queuedJobs, isLoading: loadingQueued } = useJobs({ status: 'queued' });
  const { jobs: completedJobs, isLoading: loadingCompleted } = useJobs({ status: 'completed' });

  const currentJob = printingJobs[0] || null;
  const nextJob = queuedJobs[0] || null;
  const recentCompleted = completedJobs.slice(0, 5);

  // Completion Modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeHours, setCompleteHours] = useState('');
  const [completeMins, setCompleteMins] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  // Fail Modal
  const [showFailModal, setShowFailModal] = useState(false);
  const [failNotes, setFailNotes] = useState('');
  const [isFailing, setIsFailing] = useState(false);

  // Start Modal
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartPrint = (job: Job) => {
    setSelectedJob(job);
    setShowStartModal(true);
  };

  const confirmStart = async () => {
    if (!selectedJob) return;

    setIsStarting(true);
    try {
      await startPrinting(selectedJob.id);
      setShowStartModal(false);
      setSelectedJob(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleComplete = () => {
    if (!currentJob) return;
    const estHours = Math.floor((currentJob.estimated_duration_min || 0) / 60);
    const estMins = (currentJob.estimated_duration_min || 0) % 60;
    setCompleteHours(estHours.toString());
    setCompleteMins(estMins.toString());
    setShowCompleteModal(true);
  };

  const confirmComplete = async () => {
    if (!currentJob) return;

    const hours = parseInt(completeHours) || 0;
    const mins = parseInt(completeMins) || 0;

    if (hours === 0 && mins === 0) {
      return;
    }

    setIsCompleting(true);
    try {
      await completeJob(currentJob.id, hours, mins);
      setShowCompleteModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleFail = () => {
    setFailNotes('');
    setShowFailModal(true);
  };

  const confirmFail = async () => {
    if (!currentJob) return;

    setIsFailing(true);
    try {
      await failJob(currentJob.id, failNotes);
      setShowFailModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFailing(false);
    }
  };

  const isLoading = loadingPrinting || loadingQueued || loadingCompleted;

  // Calculate total queue time
  const totalQueueTime = queuedJobs.reduce((acc, job) => acc + (job.estimated_duration_min || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-white">Print Manager</h1>
        <p className="text-white/60">
          Manage the physical printer and queue execution
        </p>
      </motion.div>

      {isLoading ? (
        <GlassCard>
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-white/40" />
            <p className="text-white/60 mt-2">Loading...</p>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Currently Printing - Takes 2 columns */}
            <GlassCard
              delay={0.1}
              variant={currentJob ? 'glow' : 'default'}
              className="lg:col-span-2"
            >
              <GlassCardHeader>
                <div className="flex items-center justify-between">
                  <GlassCardTitle icon={<Printer className="w-6 h-6 text-cyan-400" />}>
                    Currently Printing
                  </GlassCardTitle>
                  <GlassBadge variant={currentJob ? 'success' : 'default'} pulse={!!currentJob}>
                    {currentJob ? 'Active' : 'Idle'}
                  </GlassBadge>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                {currentJob ? (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {currentJob.project_name}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {currentJob.expand?.user?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Est. {formatDuration(currentJob.estimated_duration_min || 0)}
                          </span>
                          <span className="text-cyan-400">₱{currentJob.price_pesos?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Progress</span>
                        <span className="text-white">In Progress</span>
                      </div>
                      <GlassProgress value={50} variant="glow" />
                      <p className="text-xs text-white/40">
                        Started {formatRelativeTime(currentJob.updated)}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <GlassButton
                        variant="success"
                        className="flex-1"
                        onClick={handleComplete}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Complete
                      </GlassButton>
                      <GlassButton
                        variant="danger"
                        className="flex-1"
                        onClick={handleFail}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Mark Failed
                      </GlassButton>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.06] flex items-center justify-center">
                      <Printer className="w-8 h-8 text-white/40" />
                    </div>
                    <p className="text-white/60 mb-4">No job currently printing</p>
                    {nextJob && (
                      <GlassButton
                        variant="primary"
                        onClick={() => handleStartPrint(nextJob)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Next Job
                      </GlassButton>
                    )}
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>

            {/* Queue Stats Card */}
            <GlassCard delay={0.2}>
              <GlassCardHeader>
                <GlassCardTitle icon={<ListOrdered className="w-5 h-5 text-purple-400" />}>
                  Queue Stats
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-white/[0.06] border border-white/[0.08]">
                    <span className="text-3xl font-bold text-purple-400">{queuedJobs.length}</span>
                    <p className="text-xs text-white/50 mt-1">In Queue</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/[0.06] border border-white/[0.08]">
                    <span className="text-3xl font-bold text-cyan-400">
                      {totalQueueTime > 0 ? formatDuration(totalQueueTime) : '-'}
                    </span>
                    <p className="text-xs text-white/50 mt-1">Total Time</p>
                  </div>
                </div>

                {nextJob && !currentJob && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/20">
                    <p className="text-sm font-medium text-white mb-1">Up Next</p>
                    <p className="text-sm text-white/60">{nextJob.project_name}</p>
                    <p className="text-xs text-white/40 mt-1 pb-6">
                      by {nextJob.expand?.user?.name}
                    </p>
                    <GlassButton
                      variant="primary"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => handleStartPrint(nextJob)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Print
                    </GlassButton>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </div>

          <GlassSeparator />

          {/* Queue Table */}
          <GlassCard delay={0.3}>
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <GlassCardTitle icon={<ListOrdered className="w-5 h-5 text-cyan-400" />}>
                  Print Queue
                </GlassCardTitle>
                {queuedJobs.length > 0 && (
                  <GlassBadge variant="primary">{queuedJobs.length}</GlassBadge>
                )}
              </div>
            </GlassCardHeader>
            {queuedJobs.length === 0 ? (
              <GlassCardContent className="py-8 text-center">
                <p className="text-white/60">Queue is empty</p>
              </GlassCardContent>
            ) : (
              <GlassTable>
                <GlassTableHeader>
                  <GlassTableRow>
                    <GlassTableHead className="w-16">#</GlassTableHead>
                    <GlassTableHead>Project</GlassTableHead>
                    <GlassTableHead>User</GlassTableHead>
                    <GlassTableHead>Duration</GlassTableHead>
                    <GlassTableHead>Price</GlassTableHead>
                    <GlassTableHead className="text-right">Actions</GlassTableHead>
                  </GlassTableRow>
                </GlassTableHeader>
                <GlassTableBody>
                  {queuedJobs.map((job, index) => (
                    <GlassTableRow key={job.id} delay={index * 0.05}>
                      <GlassTableCell className="font-bold text-white/40">
                        {index + 1}
                      </GlassTableCell>
                      <GlassTableCell className="font-medium text-white">
                        {job.project_name}
                      </GlassTableCell>
                      <GlassTableCell className="text-white/60">
                        {job.expand?.user?.name}
                      </GlassTableCell>
                      <GlassTableCell className="text-white/60">
                        {formatDuration(job.estimated_duration_min || 0)}
                      </GlassTableCell>
                      <GlassTableCell className="text-cyan-400">
                        ₱{job.price_pesos?.toFixed(2)}
                      </GlassTableCell>
                      <GlassTableCell className="text-right">
                        {index === 0 && !currentJob && (
                          <GlassButton
                            size="sm"
                            variant="primary"
                            onClick={() => handleStartPrint(job)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </GlassButton>
                        )}
                      </GlassTableCell>
                    </GlassTableRow>
                  ))}
                </GlassTableBody>
              </GlassTable>
            )}
          </GlassCard>

          {/* Recent Completed */}
          <GlassCard delay={0.4}>
            <GlassCardHeader>
              <GlassCardTitle icon={<History className="w-5 h-5 text-emerald-400" />}>
                Recently Completed
              </GlassCardTitle>
            </GlassCardHeader>
            {recentCompleted.length === 0 ? (
              <GlassCardContent className="py-8 text-center">
                <p className="text-white/60">No completed jobs yet</p>
              </GlassCardContent>
            ) : (
              <GlassTable>
                <GlassTableHeader>
                  <GlassTableRow>
                    <GlassTableHead>Project</GlassTableHead>
                    <GlassTableHead>User</GlassTableHead>
                    <GlassTableHead>Duration</GlassTableHead>
                    <GlassTableHead>Completed</GlassTableHead>
                  </GlassTableRow>
                </GlassTableHeader>
                <GlassTableBody>
                  {recentCompleted.map((job, index) => (
                    <GlassTableRow key={job.id} delay={index * 0.05}>
                      <GlassTableCell className="font-medium text-white">
                        {job.project_name}
                      </GlassTableCell>
                      <GlassTableCell className="text-white/60">
                        {job.expand?.user?.name}
                      </GlassTableCell>
                      <GlassTableCell className="text-white/60">
                        {formatDuration(job.actual_duration_min || job.estimated_duration_min || 0)}
                      </GlassTableCell>
                      <GlassTableCell className="text-white/40">
                        {formatRelativeTime(job.updated)}
                      </GlassTableCell>
                    </GlassTableRow>
                  ))}
                </GlassTableBody>
              </GlassTable>
            )}
          </GlassCard>
        </>
      )}

      {/* Start Print Modal */}
      <GlassModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        title="Start Print Job"
        hideCloseButton={isStarting}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.06] border border-white/[0.08]">
            <p className="font-medium text-white">{selectedJob?.project_name}</p>
            <p className="text-sm text-white/60 mt-1">
              by {selectedJob?.expand?.user?.name}
            </p>
            <div className="flex gap-4 mt-2 text-sm text-white/60">
              <span>Est. {formatDuration(selectedJob?.estimated_duration_min || 0)}</span>
              <span className="text-cyan-400">₱{selectedJob?.price_pesos?.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-sm text-white/60">
            Confirm that the printer is ready and the file has been loaded.
          </p>

          <GlassModalFooter>
            <GlassButton
              variant="ghost"
              className="flex-1"
              onClick={() => setShowStartModal(false)}
              disabled={isStarting}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              className="flex-1"
              onClick={confirmStart}
              disabled={isStarting}
            >
              {isStarting ? 'Starting...' : 'Start Print'}
            </GlassButton>
          </GlassModalFooter>
        </div>
      </GlassModal>

      {/* Complete Modal */}
      <GlassModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Job Finished"
        description="Confirm the actual print duration"
        hideCloseButton={isCompleting}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirmComplete();
          }}
          className="space-y-4"
        >
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-sm">
            The estimated time was {formatDuration(currentJob?.estimated_duration_min || 0)}.
            Adjust if needed.
          </div>

          <GlassFormField label="Actual Duration" required>
            <div className="flex gap-2">
              <div className="flex-1">
                <GlassInput
                  type="number"
                  min="0"
                  placeholder="Hours"
                  value={completeHours}
                  onChange={(e) => setCompleteHours(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <GlassInput
                  type="number"
                  min="0"
                  max="59"
                  placeholder="Minutes"
                  value={completeMins}
                  onChange={(e) => setCompleteMins(e.target.value)}
                />
              </div>
            </div>
          </GlassFormField>

          <p className="text-xs text-white/40">
            This updates the user's Karma score for queue fairness.
          </p>

          <GlassModalFooter>
            <GlassButton
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setShowCompleteModal(false)}
              disabled={isCompleting}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="success"
              className="flex-1"
              disabled={isCompleting}
            >
              {isCompleting ? 'Completing...' : 'Confirm Complete'}
            </GlassButton>
          </GlassModalFooter>
        </form>
      </GlassModal>

      {/* Fail Modal */}
      <GlassModal
        isOpen={showFailModal}
        onClose={() => setShowFailModal(false)}
        title="Mark as Failed"
        hideCloseButton={isFailing}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-300 text-sm">
            Failed prints don't penalize the user's Karma. They get a free retry.
          </div>

          <GlassFormField label="Failure Notes">
            <GlassTextarea
              placeholder="What went wrong? (e.g., bed adhesion failure)"
              value={failNotes}
              onChange={(e) => setFailNotes(e.target.value)}
            />
          </GlassFormField>

          <GlassModalFooter>
            <GlassButton
              variant="ghost"
              className="flex-1"
              onClick={() => setShowFailModal(false)}
              disabled={isFailing}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="danger"
              className="flex-1"
              onClick={confirmFail}
              disabled={isFailing}
            >
              {isFailing ? 'Processing...' : 'Mark Failed'}
            </GlassButton>
          </GlassModalFooter>
        </div>
      </GlassModal>
    </div>
  );
};

