import React, { useEffect, useState } from 'react';
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

} from '../../components/ui';
import { JobDetailsModal } from '../../components/JobDetailsModal';
import { useJobs } from '../../hooks/useJobs';
import { startPrinting, completeJob, failJob, getSetting, recalculateAllQueuePriorities, togglePaid } from '../../services/jobService';
import { formatDuration, formatRelativeTime, getPrintingProgress } from '../../lib/utils';
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
  RefreshCw,

} from 'lucide-react';

export const AdminPrintManager: React.FC = () => {
  const [nowMs, setNowMs] = useState(Date.now());
  const [electricityRate, setElectricityRate] = useState(7.5);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  // Load electricity rate setting
  useEffect(() => {
    const loadRate = async () => {
      const rate = await getSetting('electricity_rate_per_hour');
      if (rate !== null) setElectricityRate(rate);
    };
    loadRate();
  }, []);

  // Helper to calculate total cost for a job
  const calculateJobTotal = (job: Job) => {
    // Failed and rejected jobs should have 0 cost
    if (job.status === 'failed' || job.status === 'rejected') {
      return 0;
    }
    const rawCost = job.price_pesos || 0;
    const durationMin = job.status === 'completed' && job.actual_duration_min
      ? job.actual_duration_min
      : (job.estimated_duration_min || 0);
    const electricityCost = (durationMin / 60) * electricityRate;
    return Math.round((rawCost + electricityCost) * 100) / 100;
  };

  // Get printing and queued jobs
  const { jobs: printingJobs, isLoading: loadingPrinting } = useJobs({ status: 'printing' });
  const { jobs: queuedJobs, isLoading: loadingQueued } = useJobs({ status: 'queued' });
  const { jobs: completedJobs, isLoading: loadingCompleted } = useJobs({ status: 'completed' });

  const currentJob = printingJobs[0] || null;
  const currentProgress = currentJob
    ? getPrintingProgress(currentJob.estimated_duration_min, currentJob.approved_on, nowMs)
    : null;
  const nextJob = queuedJobs[0] || null;
  const recentCompleted = completedJobs.slice(0, 5);

  // Completion Modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeHours, setCompleteHours] = useState('');
  const [completeMins, setCompleteMins] = useState('');
  const [isCompletePaid, setIsCompletePaid] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Fail Modal
  const [showFailModal, setShowFailModal] = useState(false);
  const [failNotes, setFailNotes] = useState('');
  const [isFailing, setIsFailing] = useState(false);

  // Start Modal
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Paid Status Modal
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [paidModalJob, setPaidModalJob] = useState<Job | null>(null);
  const [isUpdatingPaid, setIsUpdatingPaid] = useState(false);

  // Local state for optimistic paid status updates
  const [localPaidStatus, setLocalPaidStatus] = useState<Record<string, boolean>>({});

  // Job Details Modal
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [selectedDetailsJob, setSelectedDetailsJob] = useState<Job | null>(null);

  const handleViewJobDetails = (job: Job) => {
    setSelectedDetailsJob(job);
    setShowJobDetailsModal(true);
  };

  // Handle opening paid modal
  const handleOpenPaidModal = (job: Job) => {
    setPaidModalJob(job);
    setShowPaidModal(true);
  };

  // Handle paid status change from modal
  const handleConfirmPaidChange = async (newPaidStatus: boolean) => {
    if (!paidModalJob) return;
    
    setIsUpdatingPaid(true);
    // Optimistically update local state
    setLocalPaidStatus(prev => ({ ...prev, [paidModalJob.id]: newPaidStatus }));
    try {
      await togglePaid(paidModalJob.id, newPaidStatus);
      setShowPaidModal(false);
      setPaidModalJob(null);
    } catch (err) {
      // Revert on error
      setLocalPaidStatus(prev => ({ ...prev, [paidModalJob.id]: !newPaidStatus }));
      console.error('Failed to update paid status:', err);
    } finally {
      setIsUpdatingPaid(false);
    }
  };

  // Helper to get paid status (local override or from job)
  const getIsPaid = (job: Job) => {
    if (localPaidStatus[job.id] !== undefined) {
      return localPaidStatus[job.id];
    }
    return job.is_paid || false;
  };

  const handleRefreshQueue = async () => {
    setIsRefreshing(true);
    try {
      await recalculateAllQueuePriorities();
    } catch (error) {
      console.error("Failed to refresh queue:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
    setIsCompletePaid(currentJob.is_paid || false);
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
      await completeJob(currentJob.id, hours, mins, isCompletePaid);
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
  const queuedTime = queuedJobs.reduce((acc, job) => acc + (job.estimated_duration_min || 0), 0);
  const printingTimeLeft = currentProgress?.remainingMinutes || 0;
  const totalQueueTime = queuedTime + printingTimeLeft;

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Currently Printing - Takes 2 columns */}
            <GlassCard
              delay={0.1}
              variant={currentJob ? 'glow' : 'default'}
              className="lg:col-span-2 h-full"
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
                          <span className="text-cyan-400">₱{calculateJobTotal(currentJob).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Progress</span>
                        <span className="text-white">
                          {currentProgress ? `${formatDuration(currentProgress.remainingMinutes)} left` : 'In Progress'}
                        </span>
                      </div>
                      <GlassProgress value={currentProgress?.progress ?? 0} variant="glow" />
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
            <GlassCard delay={0.2} className="h-full">
              <GlassCardHeader>
                <GlassCardTitle icon={<ListOrdered className="w-5 h-5 text-purple-400" />}>
                  Queue Stats
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl glass-sub-card">
                    <span className="text-3xl font-bold text-purple-400">{queuedJobs.length}</span>
                    <p className="text-xs text-white/50 mt-1">In Queue</p>
                  </div>
                  <div className="text-center p-4 rounded-xl glass-sub-card">
                    <span className="text-3xl font-bold text-cyan-400">
                      {totalQueueTime > 0 ? formatDuration(totalQueueTime) : '-'}
                    </span>
                    <p className="text-xs text-white/50 mt-1">Total Time</p>
                  </div>
                </div>

                {nextJob && !currentJob && (
                  <div className="p-4 rounded-xl glass-alert-warning">
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
                <div className="flex items-center gap-2">
                  <GlassButton
                    size="sm"
                    variant="ghost"
                    onClick={handleRefreshQueue}
                    disabled={isRefreshing}
                    title="Recalculate all priorities"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </GlassButton>
                  {queuedJobs.length > 0 && (
                    <GlassBadge variant="primary">{queuedJobs.length}</GlassBadge>
                  )}
                </div>
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
                    <GlassTableHead>Paid</GlassTableHead>
                    <GlassTableHead className="text-right">Actions</GlassTableHead>
                  </GlassTableRow>
                </GlassTableHeader>
                <GlassTableBody>
                  {queuedJobs.map((job, index) => (
                    <GlassTableRow key={job.id} delay={index * 0.05} onClick={() => handleViewJobDetails(job)}>
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
                        ₱{calculateJobTotal(job).toFixed(2)}
                      </GlassTableCell>
                      <GlassTableCell>
                        <span
                          className={`pill-clickable ${getIsPaid(job) ? 'pill-paid' : 'pill-unpaid'}`}
                          onClick={(e) => { e.stopPropagation(); handleOpenPaidModal(job); }}
                        >
                          {getIsPaid(job) ? 'Paid' : 'Unpaid'}
                        </span>
                      </GlassTableCell>
                      <GlassTableCell className="text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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
                        </div>
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
                    <GlassTableHead>Paid</GlassTableHead>
                    <GlassTableHead>Completed</GlassTableHead>
                  </GlassTableRow>
                </GlassTableHeader>
                <GlassTableBody>
                  {recentCompleted.map((job, index) => (
                    <GlassTableRow key={job.id} delay={index * 0.05} onClick={() => handleViewJobDetails(job)}>
                      <GlassTableCell className="font-medium text-white">
                        {job.project_name}
                      </GlassTableCell>
                      <GlassTableCell className="text-white/60">
                        {job.expand?.user?.name}
                      </GlassTableCell>
                      <GlassTableCell className="text-white/60">
                        {formatDuration(job.actual_duration_min || job.estimated_duration_min || 0)}
                      </GlassTableCell>
                      <GlassTableCell>
                        <span
                          className={`pill-clickable ${getIsPaid(job) ? 'pill-paid' : 'pill-unpaid'}`}
                          onClick={(e) => { e.stopPropagation(); handleOpenPaidModal(job); }}
                        >
                          {getIsPaid(job) ? 'Paid' : 'Unpaid'}
                        </span>
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
          <div className="p-4 rounded-xl glass-sub-card">
            <p className="font-medium text-white">{selectedJob?.project_name}</p>
            <p className="text-sm text-white/60 mt-1">
              by {selectedJob?.expand?.user?.name}
            </p>
            <div className="flex gap-4 mt-2 text-sm text-white/60">
              <span>Est. {formatDuration(selectedJob?.estimated_duration_min || 0)}</span>
              <span className="text-cyan-400">₱{selectedJob ? calculateJobTotal(selectedJob).toFixed(2) : '0.00'}</span>
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
          <div className="p-3 rounded-xl glass-alert-success text-emerald-300 text-sm">
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

          {/* Mark as Paid checkbox */}
          <div 
            className="flex items-center justify-between p-3 rounded-xl glass-sub-card cursor-pointer"
            onClick={() => setIsCompletePaid(!isCompletePaid)}
          >
            <span className="text-sm text-white/80">Mark as Paid</span>
            <span className={`${isCompletePaid ? 'pill-paid' : 'pill-unpaid'}`}>
              {isCompletePaid ? 'Paid' : 'Unpaid'}
            </span>
          </div>

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
          <div className="p-3 rounded-xl glass-alert-warning text-amber-300 text-sm">
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

      {/* Paid Status Modal */}
      <GlassModal
        isOpen={showPaidModal}
        onClose={() => setShowPaidModal(false)}
        title="Update Payment Status"
        hideCloseButton={isUpdatingPaid}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl glass-sub-card">
            <p className="font-medium text-white">{paidModalJob?.project_name}</p>
            <p className="text-sm text-white/60 mt-1">
              by {paidModalJob?.expand?.user?.name}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-cyan-400 font-semibold">
                ₱{paidModalJob ? calculateJobTotal(paidModalJob).toFixed(2) : '0.00'}
              </span>
              <span className={`${paidModalJob && getIsPaid(paidModalJob) ? 'pill-paid' : 'pill-unpaid'}`}>
                {paidModalJob && getIsPaid(paidModalJob) ? 'Paid' : 'Unpaid'}
              </span>
            </div>
          </div>

          <p className="text-sm text-white/60">
            {paidModalJob && getIsPaid(paidModalJob)
              ? 'Mark this job as unpaid?'
              : 'Mark this job as paid?'}
          </p>

          <GlassModalFooter>
            <GlassButton
              variant="ghost"
              className="flex-1"
              onClick={() => setShowPaidModal(false)}
              disabled={isUpdatingPaid}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant={paidModalJob && getIsPaid(paidModalJob) ? 'danger' : 'success'}
              className="flex-1"
              onClick={() => handleConfirmPaidChange(!(paidModalJob && getIsPaid(paidModalJob)))}
              disabled={isUpdatingPaid}
            >
              {isUpdatingPaid 
                ? 'Updating...' 
                : (paidModalJob && getIsPaid(paidModalJob) ? 'Mark Unpaid' : 'Mark Paid')}
            </GlassButton>
          </GlassModalFooter>
        </div>
      </GlassModal>

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedDetailsJob}
        isOpen={showJobDetailsModal}
        onClose={() => {
          setShowJobDetailsModal(false);
          setSelectedDetailsJob(null);
        }}
      />
    </div >
  );
};

