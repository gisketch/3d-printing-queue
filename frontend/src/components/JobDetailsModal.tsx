import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Job } from '../types';
import {
  GlassModal,
  GlassBadge,
} from './ui';
import {
  Package,
  Clock,
  DollarSign,
  User,
  Calendar,
  FileText,
  Link2,
  FileDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  Zap,
} from 'lucide-react';
import pb from '../lib/pocketbase';
import { getSetting } from '../services/jobService';

// Default electricity rate (PHP per hour)
const DEFAULT_ELECTRICITY_RATE = 7.5;

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

// Format duration from minutes
const formatDuration = (minutes?: number): string => {
  if (!minutes) return '--';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return '--';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Status badge variant
const getStatusVariant = (status: string): 'warning' | 'info' | 'success' | 'danger' | 'default' => {
  switch (status) {
    case 'pending_review':
      return 'warning';
    case 'queued':
      return 'info';
    case 'printing':
      return 'info';
    case 'completed':
      return 'success';
    case 'rejected':
    case 'failed':
      return 'danger';
    default:
      return 'default';
  }
};

// Status display name
const getStatusDisplay = (status: string): string => {
  switch (status) {
    case 'pending_review':
      return 'Pending Review';
    case 'queued':
      return 'Queued';
    case 'printing':
      return 'Printing';
    case 'completed':
      return 'Completed';
    case 'rejected':
      return 'Rejected';
    case 'failed':
      return 'Failed';
    default:
      return status;
  }
};

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
}) => {
  const [electricityRate, setElectricityRate] = useState(DEFAULT_ELECTRICITY_RATE);

  // Load electricity rate setting
  useEffect(() => {
    const loadRate = async () => {
      const rate = await getSetting('electricity_rate_per_hour');
      if (rate !== null) setElectricityRate(rate);
    };
    loadRate();
  }, []);

  if (!job) return null;

  // Calculate costs like Receipt.tsx does
  const durationMin = job.status === 'completed' && job.actual_duration_min
    ? job.actual_duration_min
    : (job.estimated_duration_min || 0);
  const durationHours = durationMin / 60;
  const rawCost = job.price_pesos || 0;
  const electricityCost = Math.round(durationHours * electricityRate * 100) / 100;

  // Failed or rejected jobs cost 0
  const totalCost = (job.status === 'failed' || job.status === 'rejected')
    ? 0
    : Math.round((rawCost + electricityCost) * 100) / 100;

  const hasFile = !!job.stl_file;
  const hasLink = !!job.stl_link;

  const handleDownload = () => {
    if (hasFile) {
      const url = pb.files.getUrl(job, job.stl_file!);
      window.open(url, '_blank');
    }
  };

  const handleOpenLink = () => {
    if (hasLink) {
      window.open(job.stl_link, '_blank');
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Job Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-white truncate flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              {job.project_name}
            </h3>
            {job.expand?.user && (
              <p className="text-sm text-white/60 flex items-center gap-2 mt-1">
                <User className="w-4 h-4" />
                {job.expand.user.name}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <GlassBadge variant={getStatusVariant(job.status)}>
              {getStatusDisplay(job.status)}
            </GlassBadge>
            {job.is_paid !== undefined && (
              <GlassBadge variant={job.is_paid ? 'success' : 'warning'}>
                {job.is_paid ? 'Paid' : 'Unpaid'}
              </GlassBadge>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column - Timing Info */}
          <div className="glass-input p-4 rounded-xl space-y-3">
            <h4 className="text-sm font-medium text-white/70 uppercase tracking-wide">Timing</h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  Est. Duration
                </span>
                <span className="text-white font-medium">
                  {formatDuration(job.estimated_duration_min)}
                </span>
              </div>

              {job.actual_duration_min !== undefined && job.actual_duration_min > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-white/60 flex items-center gap-2 text-sm">
                    <Timer className="w-4 h-4" />
                    Actual Duration
                  </span>
                  <span className="text-white font-medium">
                    {formatDuration(job.actual_duration_min)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-white/60 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  Submitted
                </span>
                <span className="text-white font-medium text-xs">
                  {formatDate(job.created)}
                </span>
              </div>

              {job.approved_on && (
                <div className="flex items-center justify-between">
                  <span className="text-white/60 flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Approved
                  </span>
                  <span className="text-white font-medium text-xs">
                    {formatDate(job.approved_on)}
                  </span>
                </div>
              )}

              {job.completed_on && (
                <div className="flex items-center justify-between">
                  <span className="text-white/60 flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Completed
                  </span>
                  <span className="text-white font-medium text-xs">
                    {formatDate(job.completed_on)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Cost Info */}
          <div className="glass-input p-4 rounded-xl space-y-3">
            <h4 className="text-sm font-medium text-white/70 uppercase tracking-wide">Cost Breakdown</h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60 flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4" />
                  Raw Cost
                </span>
                <span className="text-white font-medium">
                  ₱{rawCost.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/60 flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4" />
                  Electricity
                </span>
                <span className="text-white font-medium">
                  ₱{electricityCost.toFixed(2)}
                </span>
              </div>

              {job.status !== 'completed' && job.estimated_duration_min && (
                <p className="text-xs text-white/40 italic">
                  * Based on estimated duration
                </p>
              )}

              <div className="border-t border-white/10 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-cyan-400" />
                    Total
                  </span>
                  <span className="text-lg font-bold text-cyan-400">
                    {totalCost > 0 ? `₱${totalCost.toFixed(2)}` : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Score */}
        {job.priority_score !== undefined && job.status !== 'completed' && job.status !== 'rejected' && job.status !== 'failed' && (
          <div className="glass-input p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-white/60 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Priority Score
              </span>
              <span className="text-white font-bold text-lg">{job.priority_score.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Receipt Number */}
        {job.receipt_number && (
          <div className="glass-input p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-white/60 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Receipt Number
              </span>
              <span className="text-white font-mono">{job.receipt_number}</span>
            </div>
          </div>
        )}

        {/* Admin Notes */}
        {job.admin_notes && (
          <div className="glass-input p-4 rounded-xl">
            <h4 className="text-sm font-medium text-white/70 uppercase tracking-wide mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Admin Notes
            </h4>
            <p className="text-white/80 text-sm whitespace-pre-wrap">{job.admin_notes}</p>
          </div>
        )}

        {/* File/Link Actions */}
        {(hasFile || hasLink) && (
          <div className="flex gap-3">
            {hasFile && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass-button text-cyan-300 hover:text-cyan-100 transition-colors"
                style={{
                  color: "white"
                }}
              >
                <FileDown className="w-4 h-4" />
                Download STL
              </motion.button>
            )}
            {hasLink && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenLink}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass-button text-cyan-300 hover:text-cyan-100 transition-colors"
                style={{
                  color: "white"
                }}
              >
                <Link2 className="w-4 h-4" />
                Open Link
              </motion.button>
            )}
          </div>
        )}

        {/* Status-specific messages */}
        {job.status === 'rejected' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">
              This job was rejected. {job.admin_notes ? 'See admin notes above for details.' : 'Contact admin for more details.'}
            </p>
          </div>
        )}

        {job.status === 'failed' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">
              This job failed during printing. {job.admin_notes ? 'See admin notes above for details.' : 'The print was unsuccessful and no payment is required.'}
            </p>
          </div>
        )}
      </div>
    </GlassModal>
  );
};

export default JobDetailsModal;
