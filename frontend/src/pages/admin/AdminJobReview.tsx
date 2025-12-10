import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,

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
  StatCard,
} from '../../components/ui';
import { useJobs } from '../../hooks/useJobs';
import { approveJob, rejectJob, getSTLFileUrl } from '../../services/jobService';
import { formatRelativeTime } from '../../lib/utils';
import type { Job } from '../../types';
import {
  Check,
  X,
  Download,
  ExternalLink,
  Loader2,
  FileText,
  FileCheck,
  Info,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const AdminJobReview: React.FC = () => {
  const { jobs, isLoading } = useJobs({ status: 'pending_review' });

  // Approval Modal
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [hoursInput, setHoursInput] = useState('');
  const [minsInput, setMinsInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState('');

  // Rejection Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = (job: Job) => {
    setSelectedJob(job);
    setPriceInput('');
    setHoursInput('');
    setMinsInput('');
    setNotesInput('');
    setIsPaid(false);
    setApproveError('');
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedJob) return;

    const filamentCost = parseFloat(priceInput);
    const hours = parseInt(hoursInput) || 0;
    const mins = parseInt(minsInput) || 0;

    if (isNaN(filamentCost) || filamentCost <= 0) {
      setApproveError('Please enter a valid raw cost');
      return;
    }

    if (hours === 0 && mins === 0) {
      setApproveError('Please enter an estimated duration');
      return;
    }

    setIsApproving(true);
    try {
      await approveJob(selectedJob.id, {
        filament_cost: filamentCost,
        estimated_duration_hours: hours,
        estimated_duration_mins: mins,
        admin_notes: notesInput || undefined,
      }, isPaid);
      setShowApproveModal(false);
      setSelectedJob(null);
    } catch (err) {
      setApproveError('Failed to approve job');
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = (job: Job) => {
    setSelectedJob(job);
    setRejectNotes('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedJob) return;

    setIsRejecting(true);
    try {
      await rejectJob(selectedJob.id, rejectNotes);
      setShowRejectModal(false);
      setSelectedJob(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRejecting(false);
    }
  };

  const downloadSTL = (job: Job) => {
    const url = getSTLFileUrl(job);
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Review Jobs</h1>
          <p className="text-white/60">
            Review pending print requests, slice files, and set pricing
          </p>
        </div>
        <GlassBadge variant="warning" className="text-lg px-4 py-2">
          {jobs.length} Pending
        </GlassBadge>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Pending Review"
          value={jobs.length}
          icon={<Clock className="w-5 h-5" />}
          variant="warning"
          delay={0.1}
        />
        <StatCard
          label="Review Time"
          value="~5 min"
          icon={<FileCheck className="w-5 h-5" />}
          variant="info"
          delay={0.15}
        />
        <StatCard
          label="Approval Rate"
          value="98%"
          icon={<Check className="w-5 h-5" />}
          variant="success"
          delay={0.2}
        />
      </div>

      {/* Instructions Card */}
      <GlassCard delay={0.25} variant="glow">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Info className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-medium text-white mb-4">Review Process</h3>
            <ol className="text-sm text-white/60 space-y-1 list-decimal list-inside">
              <li>Download or open the STL/G-code file</li>
              <li>Open in your slicer software (Cura/PrusaSlicer)</li>
              <li>Check for errors and get time estimate</li>
              <li>Calculate price based on filament usage</li>
              <li>Approve with the estimated time and price</li>
            </ol>
          </div>
        </div>
      </GlassCard>

      <GlassSeparator />

      {/* Jobs Table */}
      {isLoading ? (
        <GlassCard>
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-white/40" />
            <p className="text-white/60 mt-2">Loading jobs...</p>
          </div>
        </GlassCard>
      ) : jobs.length === 0 ? (
        <GlassCard variant="subtle">
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.06] flex items-center justify-center">
              <FileCheck className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60">No jobs pending review</p>
            <p className="text-sm text-white/40 mt-1">
              All caught up! Check back later for new submissions.
            </p>
          </div>
        </GlassCard>
      ) : (
        <GlassCard delay={0.3}>
          <GlassCardHeader>
            <GlassCardTitle icon={<FileCheck className="w-5 h-5 text-cyan-400" />}>
              Pending Review
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassTable>
            <GlassTableHeader>
              <GlassTableRow>
                <GlassTableHead>Project</GlassTableHead>
                <GlassTableHead>Submitted By</GlassTableHead>
                <GlassTableHead>Submitted</GlassTableHead>
                <GlassTableHead>File</GlassTableHead>
                <GlassTableHead className="text-right">Actions</GlassTableHead>
              </GlassTableRow>
            </GlassTableHeader>
            <GlassTableBody>
              {jobs.map((job, index) => (
                <GlassTableRow key={job.id} delay={index * 0.05}>
                  <GlassTableCell>
                    <span className="font-medium text-white">{job.project_name}</span>
                  </GlassTableCell>
                  <GlassTableCell>
                    <span className="text-white/60">
                      {job.expand?.user?.name || 'Unknown'}
                    </span>
                  </GlassTableCell>
                  <GlassTableCell>
                    <span className="text-white/60">
                      {formatRelativeTime(job.created)}
                    </span>
                  </GlassTableCell>
                  <GlassTableCell>
                    <div className="flex gap-2">
                      {job.stl_file && (
                        <GlassButton
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadSTL(job)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          File
                        </GlassButton>
                      )}
                      {job.stl_link && (
                        <GlassButton
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(job.stl_link, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Link
                        </GlassButton>
                      )}
                      {!job.stl_file && !job.stl_link && (
                        <span className="flex items-center gap-1 text-sm text-white/40">
                          <FileText className="w-4 h-4" />
                          None
                        </span>
                      )}
                    </div>
                  </GlassTableCell>
                  <GlassTableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <GlassButton
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(job)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </GlassButton>
                      <GlassButton
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(job)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </GlassButton>
                    </div>
                  </GlassTableCell>
                </GlassTableRow>
              ))}
            </GlassTableBody>
          </GlassTable>
        </GlassCard>
      )}

      {/* Approval Modal */}
      <GlassModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Job"
        description="Enter the price and estimated duration from your slicer"
        hideCloseButton={isApproving}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirmApprove();
          }}
          className="space-y-4"
        >
          <AnimatePresence>
            {approveError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-xl glass-alert-danger text-red-300 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {approveError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-3 rounded-xl glass-sub-card">
            <p className="text-sm font-medium text-white">
              {selectedJob?.project_name}
            </p>
            <p className="text-xs text-white/50">
              by {selectedJob?.expand?.user?.name}
            </p>
          </div>

          <GlassFormField label="Raw Cost (PHP)" description="Total material and consumables cost" required>
            <GlassInput
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 50.00"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
            />
          </GlassFormField>

          <GlassFormField
            label="Estimated Duration"
            description="From your slicer software"
            required
          >
            <div className="flex gap-2">
              <div className="flex-1">
                <GlassInput
                  type="number"
                  min="0"
                  placeholder="Hours"
                  value={hoursInput}
                  onChange={(e) => setHoursInput(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <GlassInput
                  type="number"
                  min="0"
                  max="59"
                  placeholder="Minutes"
                  value={minsInput}
                  onChange={(e) => setMinsInput(e.target.value)}
                />
              </div>
            </div>
          </GlassFormField>

          <GlassFormField label="Notes (optional)">
            <GlassTextarea
              placeholder="Any notes for the user..."
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
            />
          </GlassFormField>

          {/* Mark as Paid toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl glass-sub-card">
            <span className="text-sm text-white/80">Mark as Paid</span>
            <label className="glass-toggle">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
              />
              <span className="glass-toggle-track">
                <span className="glass-toggle-thumb"></span>
              </span>
            </label>
          </div>

          <GlassModalFooter>
            <GlassButton
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setShowApproveModal(false)}
              disabled={isApproving}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="success"
              className="flex-1"
              disabled={isApproving}
            >
              {isApproving ? 'Approving...' : 'Approve & Queue'}
            </GlassButton>
          </GlassModalFooter>
        </form>
      </GlassModal>

      {/* Rejection Modal */}
      <GlassModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Job"
        hideCloseButton={isRejecting}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl glass-sub-card">
            <p className="text-sm font-medium text-white">
              {selectedJob?.project_name}
            </p>
            <p className="text-xs text-white/50">
              by {selectedJob?.expand?.user?.name}
            </p>
          </div>

          <GlassFormField label="Reason for rejection">
            <GlassTextarea
              placeholder="e.g., File is corrupted, model has errors..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
            />
          </GlassFormField>

          <GlassModalFooter>
            <GlassButton
              variant="ghost"
              className="flex-1"
              onClick={() => setShowRejectModal(false)}
              disabled={isRejecting}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="danger"
              className="flex-1"
              onClick={confirmReject}
              disabled={isRejecting}
            >
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </GlassButton>
          </GlassModalFooter>
        </div>
      </GlassModal>
    </div>
  );
};
