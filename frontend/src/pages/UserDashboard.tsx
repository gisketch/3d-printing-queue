import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  GlassButton,
  GlassModal,
  GlassModalFooter,
  GlassInput,
  GlassFormField,
  GlassFileUpload,
  GlassFilePreview,
  GlassProgress,
  GlassAvatar,
  GlassSeparator,
  GlassTabs,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useHasActiveJob, useJobs } from '../hooks/useJobs';
import { createJob } from '../services/jobService';
import { formatDuration, formatRelativeTime } from '../lib/utils';
import { JOB_STATUS_CONFIG } from '../types';
import {
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Printer,
  Users,
  History,
  Zap,
  Sparkles,
  TrendingUp,
  FileText,
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasActiveJob, activeJob, isLoading: checkingActive } = useHasActiveJob(user?.id);
  const { jobs, isLoading: loadingJobs } = useJobs({ userId: user?.id });

  // Get queue data
  const { jobs: printingJobs } = useJobs({ status: 'printing' });
  const { jobs: queuedJobs } = useJobs({ status: 'queued' });

  const currentPrintingJob = printingJobs[0] || null;
  const totalQueueTime = queuedJobs.reduce((acc, job) => acc + (job.estimated_duration_min || 0), 0);

  // New Job Modal
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [stlFile, setStlFile] = useState<File | null>(null);
  const [stlLink, setStlLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!projectName.trim()) {
      setSubmitError('Please enter a project name');
      return;
    }

    if (!stlFile && !stlLink.trim()) {
      setSubmitError('Please upload an STL file or provide a link');
      return;
    }

    if (!user) return;

    setIsSubmitting(true);

    try {
      await createJob(user.id, {
        project_name: projectName.trim(),
        stl_file: stlFile || undefined,
        stl_link: stlLink.trim() || undefined,
      });
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError('Failed to submit job. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeNewJobModal = () => {
    setShowNewJobModal(false);
    setProjectName('');
    setStlFile(null);
    setStlLink('');
    setSubmitError('');
    setSubmitSuccess(false);
  };

  // Separate jobs by status
  const activeJobs = jobs.filter(j => ['pending_review', 'queued', 'printing'].includes(j.status));
  const completedJobs = jobs.filter(j => ['completed', 'rejected', 'failed'].includes(j.status));

  // Calculate user stats
  const totalPrints = jobs.filter(j => j.status === 'completed').length;
  const totalSpent = jobs.reduce((acc, j) => acc + (j.price_pesos || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]}
            <motion.span
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 2.5, delay: 0.5 }}
              className="inline-block ml-2"
            >
              👋
            </motion.span>
          </h1>
          <p className="text-white/60 mt-1">
            Here's what's happening with your print requests
          </p>
        </div>

        <GlassButton
          variant="success"
          size="lg"
          onClick={() => setShowNewJobModal(true)}
          disabled={hasActiveJob || checkingActive}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          New Print Request
        </GlassButton>
      </motion.div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Prints"
          value={totalPrints}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
          delay={0.1}
        />
        <StatCard
          label="In Queue"
          value={queuedJobs.length}
          icon={<Users className="w-5 h-5" />}
          variant="info"
          delay={0.15}
        />
        <StatCard
          label="Wait Time"
          value={totalQueueTime > 0 ? `${Math.ceil(totalQueueTime / 60)}h` : '-'}
          icon={<Clock className="w-5 h-5" />}
          variant="warning"
          delay={0.2}
        />
        <StatCard
          label="Total Spent"
          value={`₱${totalSpent.toFixed(0)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          delay={0.25}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Printer Status - Large Card */}
        <GlassCard
          delay={0.3}
          variant={currentPrintingJob ? 'glow' : 'default'}
          contentClassName="h-full"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${currentPrintingJob ? 'bg-emerald-500/20' : 'bg-white/[0.08]'}`}>
                <Printer className={`w-6 h-6 ${currentPrintingJob ? 'text-emerald-400' : 'text-white/50'}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Printer Status</h3>
                <p className="text-sm text-white/50">Live monitoring</p>
              </div>
            </div>
            <GlassBadge variant={currentPrintingJob ? 'success' : 'default'} pulse={!!currentPrintingJob}>
              {currentPrintingJob ? 'Printing' : 'Idle'}
            </GlassBadge>
          </div>

          {currentPrintingJob ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <GlassAvatar name={currentPrintingJob.expand?.user?.name || 'Unknown'} size="lg" />
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {currentPrintingJob.project_name}
                    </h4>
                    <p className="text-white/60 text-sm">
                      by {currentPrintingJob.expand?.user?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/50">Estimated</p>
                  <p className="font-semibold text-white">
                    {formatDuration(currentPrintingJob.estimated_duration_min || 0)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Progress</span>
                  <span className="text-white">In Progress</span>
                </div>
                <GlassProgress value={50} variant="success" size="lg" />
                <p className="text-xs text-white/50">
                  Started {formatRelativeTime(currentPrintingJob.updated)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/[0.05] flex items-center justify-center"
              >
                <Printer className="w-10 h-10 text-white/30" />
              </motion.div>
              <p className="text-lg text-white/60">Printer is currently idle</p>
              <p className="text-sm text-white/40 mt-1">
                {queuedJobs.length > 0 ? `${queuedJobs.length} jobs waiting in queue` : 'No jobs in queue'}
              </p>
            </div>
          )}
        </GlassCard>

        {/* Quick Actions Card */}
        <GlassCard delay={0.35}>
          <GlassCardHeader>
            <GlassCardTitle icon={<Zap className="w-5 h-5 text-amber-400" />}>
              Quick Actions
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="space-y-4">
            {hasActiveJob && activeJob ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/20"
              >
                <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Active Request
                </div>
                <p className="text-white font-medium">{activeJob.project_name}</p>
                <GlassBadge
                  variant={
                    activeJob.status === 'printing' ? 'success' :
                    activeJob.status === 'queued' ? 'primary' :
                    'warning'
                  }
                  size="sm"
                  className="mt-2"
                >
                  {JOB_STATUS_CONFIG[activeJob.status].label}
                </GlassBadge>
              </motion.div>
            ) : (
              <GlassButton
                variant="primary"
                className="w-full"
                onClick={() => setShowNewJobModal(true)}
                disabled={checkingActive}
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit New Request
              </GlassButton>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-2xl font-bold text-white">{queuedJobs.length}</span>
                </div>
                <p className="text-xs text-white/50">In Queue</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-2xl font-bold text-white">
                    {totalQueueTime > 0 ? Math.ceil(totalQueueTime / 60) : 0}
                  </span>
                </div>
                <p className="text-xs text-white/50">Hours Wait</p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      <GlassSeparator />

      {/* Jobs Section with Tabs */}
      <div>
        <GlassTabs
          tabs={[
            { id: 'active', label: 'Active Requests', icon: <Zap className="w-4 h-4" /> },
            { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as 'active' | 'history')}
          className="mb-6"
        />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'active' ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {loadingJobs ? (
                <GlassCard>
                  <div className="py-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-8 h-8 mx-auto text-cyan-400" />
                    </motion.div>
                  </div>
                </GlassCard>
              ) : activeJobs.length === 0 ? (
                <GlassCard variant="subtle">
                  <div className="py-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/[0.05] flex items-center justify-center">
                      <FileText className="w-10 h-10 text-white/30" />
                    </div>
                    <p className="text-white/60 text-lg">No active print requests</p>
                    <p className="text-white/40 text-sm mt-1 mb-4">Your submitted requests will appear here</p>
                    <GlassButton
                      variant="primary"
                      className="mt-6"
                      onClick={() => setShowNewJobModal(true)}
                      disabled={hasActiveJob}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Submit Your First Request
                    </GlassButton>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard contentClassName="p-0">
                  <GlassTable>
                    <GlassTableHeader>
                      <tr>
                        <GlassTableHead>Project</GlassTableHead>
                        <GlassTableHead>Status</GlassTableHead>
                        <GlassTableHead>Duration</GlassTableHead>
                        <GlassTableHead>Price</GlassTableHead>
                        <GlassTableHead>Submitted</GlassTableHead>
                      </tr>
                    </GlassTableHeader>
                    <GlassTableBody>
                      {activeJobs.map((job, index) => (
                        <GlassTableRow key={job.id} delay={index * 0.05}>
                          <GlassTableCell className="font-medium text-white">
                            {job.project_name}
                          </GlassTableCell>
                          <GlassTableCell>
                            <GlassBadge
                              variant={
                                job.status === 'printing' ? 'success' :
                                job.status === 'queued' ? 'primary' :
                                'warning'
                              }
                              pulse={job.status === 'printing'}
                            >
                              {JOB_STATUS_CONFIG[job.status].label}
                            </GlassBadge>
                          </GlassTableCell>
                          <GlassTableCell>
                            {job.estimated_duration_min ? formatDuration(job.estimated_duration_min) : '-'}
                          </GlassTableCell>
                          <GlassTableCell>
                            {job.price_pesos ? `₱${job.price_pesos.toFixed(2)}` : '-'}
                          </GlassTableCell>
                          <GlassTableCell className="text-white/50">
                            {formatRelativeTime(job.created)}
                          </GlassTableCell>
                        </GlassTableRow>
                      ))}
                    </GlassTableBody>
                  </GlassTable>
                </GlassCard>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {completedJobs.length === 0 ? (
                <GlassCard variant="subtle">
                  <div className="py-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/[0.05] flex items-center justify-center">
                      <History className="w-10 h-10 text-white/30" />
                    </div>
                    <p className="text-white/60 text-lg">No completed jobs yet</p>
                    <p className="text-white/40 text-sm mt-1">Your print history will appear here</p>
                  </div>
                </GlassCard>
              ) : (
                <GlassTable>
                  <GlassTableHeader>
                    <tr>
                      <GlassTableHead>Project</GlassTableHead>
                      <GlassTableHead>Status</GlassTableHead>
                      <GlassTableHead>Duration</GlassTableHead>
                      <GlassTableHead>Price</GlassTableHead>
                      <GlassTableHead>Completed</GlassTableHead>
                    </tr>
                  </GlassTableHeader>
                  <GlassTableBody>
                    {completedJobs.map((job, index) => (
                      <GlassTableRow key={job.id} delay={index * 0.05}>
                        <GlassTableCell className="font-medium text-white">
                          {job.project_name}
                        </GlassTableCell>
                        <GlassTableCell>
                          <GlassBadge variant={job.status === 'completed' ? 'success' : 'danger'}>
                            {JOB_STATUS_CONFIG[job.status].label}
                          </GlassBadge>
                        </GlassTableCell>
                        <GlassTableCell>
                          {job.actual_duration_min ? formatDuration(job.actual_duration_min) :
                           job.estimated_duration_min ? formatDuration(job.estimated_duration_min) : '-'}
                        </GlassTableCell>
                        <GlassTableCell>
                          {job.price_pesos ? `₱${job.price_pesos.toFixed(2)}` : '-'}
                        </GlassTableCell>
                        <GlassTableCell className="text-white/50">
                          {formatRelativeTime(job.updated)}
                        </GlassTableCell>
                      </GlassTableRow>
                    ))}
                  </GlassTableBody>
                </GlassTable>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Job Modal */}
      <GlassModal
        isOpen={showNewJobModal}
        onClose={closeNewJobModal}
        title={submitSuccess ? 'Request Submitted!' : 'New Print Request'}
        description={submitSuccess ? undefined : 'Submit your 3D model for printing'}
      >
        {submitSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-emerald-500/20 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <p className="text-white mb-2">Your request has been submitted!</p>
            <p className="text-sm text-white/60 mb-6 pb-6">
              An admin will review your file and add it to the queue. You'll see the status update in real-time.
            </p>
            <GlassButton onClick={closeNewJobModal} variant="primary" className="w-full">
              Got it
            </GlassButton>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmitJob} className="space-y-5">
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {submitError}
              </motion.div>
            )}

            <GlassInput
              label="Project Name"
              required
              placeholder="e.g., Headphone Stand"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <GlassFormField
              label="STL File"
              description="Upload your 3D model file (max 50MB)"
            >
              {stlFile ? (
                <GlassFilePreview
                  file={stlFile}
                  onRemove={() => setStlFile(null)}
                />
              ) : (
                <GlassFileUpload
                  onFilesSelected={(files) => setStlFile(files[0] || null)}
                  title="Drop STL file here or click to upload"
                  description="STL files up to 50MB"
                  accept=".stl"
                  maxSize={50 * 1024 * 1024}
                />
              )}
            </GlassFormField>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-3 text-white/40">Or</span>
              </div>
            </div>

            <GlassInput
              label="STL File Link"
              placeholder="https://drive.google.com/..."
              value={stlLink}
              onChange={(e) => setStlLink(e.target.value)}
              disabled={!!stlFile}
            />

            <GlassModalFooter>
              <GlassButton
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={closeNewJobModal}
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                Submit Request
              </GlassButton>
            </GlassModalFooter>
          </form>
        )}
      </GlassModal>

      {/* Floating Action Button (Mobile) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
        className="fixed bottom-6 right-6 z-50 md:hidden"
      >
        <GlassButton
          variant="glow"
          onClick={() => setShowNewJobModal(true)}
          disabled={hasActiveJob || checkingActive}
          className="!rounded-full !p-4 shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </GlassButton>
      </motion.div>
    </div>
  );
};
