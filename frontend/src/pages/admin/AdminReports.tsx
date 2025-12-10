import React, { useState, useEffect, useMemo } from 'react';
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
  GlassTableEmpty,
  GlassBadge,
  GlassButton,
  GlassTabs,
  GlassInput,
  GlassFormField,
  GlassModal,
  GlassModalFooter,
  StatCard,
} from '../../components/ui';
import { Receipt } from '../../components/Receipt';
import { useJobs } from '../../hooks/useJobs';
import { getAllSettings, updateSetting } from '../../services/jobService';
import { formatRelativeTime } from '../../lib/utils';
import type { Job } from '../../types';
import { JOB_STATUS_CONFIG } from '../../types';
import {
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Loader2,
  Settings,
  Receipt as ReceiptIcon,
  Printer,
} from 'lucide-react';

const ITEMS_PER_PAGE = 15;

export const AdminReports: React.FC = () => {
  // Fetch all jobs
  const { jobs: allJobs, isLoading: loadingJobs } = useJobs({});
  
  // State
  const [activeTab, setActiveTab] = useState<string>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Settings state
  const [electricityRate, setElectricityRate] = useState('7.5');
  const [markupPercentage, setMarkupPercentage] = useState('20');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getAllSettings();
      if (settings['electricity_rate_per_hour']) {
        setElectricityRate(settings['electricity_rate_per_hour'].toString());
      }
      if (settings['markup_percentage']) {
        setMarkupPercentage(settings['markup_percentage'].toString());
      }
    };
    loadSettings();
  }, []);

  // Filter jobs by date range
  const filteredJobs = useMemo(() => {
    if (!allJobs.length) return [];
    
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);
    
    if (activeTab === 'daily') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }
    
    return allJobs.filter(job => {
      const jobDate = new Date(job.created);
      return jobDate >= start && jobDate <= end;
    });
  }, [allJobs, selectedDate, activeTab]);

  // Calculate revenue stats
  const revenueStats = useMemo(() => {
    const completed = filteredJobs.filter(j => j.status === 'completed');
    const printing = filteredJobs.filter(j => j.status === 'printing');
    const queued = filteredJobs.filter(j => j.status === 'queued');
    
    const completedRevenue = completed.reduce((acc, j) => acc + (j.price_pesos || 0), 0);
    const printingRevenue = printing.reduce((acc, j) => acc + (j.price_pesos || 0), 0);
    const queuedRevenue = queued.reduce((acc, j) => acc + (j.price_pesos || 0), 0);
    
    return {
      completed: completedRevenue,
      printing: printingRevenue,
      queued: queuedRevenue,
      total: completedRevenue + printingRevenue,
      forecast: queuedRevenue,
    };
  }, [filteredJobs]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, activeTab]);

  // Navigation helpers
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (activeTab === 'daily') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const formatDateLabel = () => {
    if (activeTab === 'daily') {
      return selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return selectedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const handleViewReceipt = (job: Job) => {
    setSelectedJob(job);
    setShowReceiptModal(true);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateSetting('electricity_rate_per_hour', parseFloat(electricityRate) || 7.5);
      await updateSetting('markup_percentage', parseFloat(markupPercentage) || 20);
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (loadingJobs) {
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

  // Table component to avoid duplication
  const JobsTable = ({ showDateColumn = false }: { showDateColumn?: boolean }) => (
    <GlassCard delay={0.3}>
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <GlassCardTitle icon={<FileText className="w-5 h-5 text-cyan-400" />}>
            Jobs
          </GlassCardTitle>
          <GlassBadge variant="default">{filteredJobs.length} jobs</GlassBadge>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="-mx-6 -mb-6">
        <GlassTable>
          <GlassTableHeader>
            <tr>
              <GlassTableHead>Receipt #</GlassTableHead>
              <GlassTableHead>Project</GlassTableHead>
              <GlassTableHead>User</GlassTableHead>
              <GlassTableHead>Status</GlassTableHead>
              <GlassTableHead>Cost</GlassTableHead>
              <GlassTableHead>{showDateColumn ? 'Date' : 'Time'}</GlassTableHead>
              <GlassTableHead className="text-right">Receipt</GlassTableHead>
            </tr>
          </GlassTableHeader>
          <GlassTableBody>
            {paginatedJobs.length === 0 ? (
              <GlassTableEmpty
                icon={<FileText className="w-8 h-8" />}
                title="No jobs found"
                description="No jobs for this period"
              />
            ) : (
              paginatedJobs.map((job, index) => (
                <GlassTableRow key={job.id} delay={index * 0.03}>
                  <GlassTableCell>
                    <span className="font-mono text-xs text-cyan-400">
                      {job.receipt_number || job.id.slice(0, 10)}
                    </span>
                  </GlassTableCell>
                  <GlassTableCell>
                    <span className="font-medium text-white">{job.project_name}</span>
                  </GlassTableCell>
                  <GlassTableCell className="text-white/60">
                    {job.expand?.user?.name || 'Unknown'}
                  </GlassTableCell>
                  <GlassTableCell>
                    <GlassBadge
                      variant={
                        job.status === 'completed' ? 'success' :
                        job.status === 'printing' ? 'warning' :
                        job.status === 'queued' ? 'primary' :
                        'default'
                      }
                      size="sm"
                    >
                      {JOB_STATUS_CONFIG[job.status]?.label || job.status}
                    </GlassBadge>
                  </GlassTableCell>
                  <GlassTableCell>
                    <span className="text-emerald-400 font-medium">
                      ₱{(job.price_pesos || 0).toFixed(2)}
                    </span>
                  </GlassTableCell>
                  <GlassTableCell className="text-white/60">
                    {showDateColumn 
                      ? new Date(job.created).toLocaleDateString()
                      : formatRelativeTime(job.created)
                    }
                  </GlassTableCell>
                  <GlassTableCell className="text-right">
                    {job.status !== 'pending_review' && job.status !== 'rejected' && (
                      <GlassButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewReceipt(job)}
                      >
                        <ReceiptIcon className="w-4 h-4 mr-1" />
                        View
                      </GlassButton>
                    )}
                  </GlassTableCell>
                </GlassTableRow>
              ))
            )}
          </GlassTableBody>
        </GlassTable>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08]">
            <p className="text-sm text-white/50">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredJobs.length)} of{' '}
              {filteredJobs.length} jobs
            </p>
            <div className="flex items-center gap-2">
              <GlassButton
                size="sm"
                variant="ghost"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </GlassButton>
              <span className="text-sm text-white/60">
                Page {currentPage} of {totalPages}
              </span>
              <GlassButton
                size="sm"
                variant="ghost"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </GlassButton>
            </div>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );

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
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-white/60 mt-1">
            Revenue tracking and job history
          </p>
        </div>
        <GlassButton
          variant="ghost"
          onClick={() => setShowSettingsModal(true)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Pricing Settings
        </GlassButton>
      </motion.div>

      {/* Tabs */}
      <GlassTabs
        tabs={[
          { id: 'daily', label: 'Daily Report', icon: <Calendar className="w-4 h-4" /> },
          { id: 'monthly', label: 'Monthly Report', icon: <Calendar className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Date Navigation */}
      <GlassCard delay={0.1}>
        <div className="flex items-center justify-between">
          <GlassButton variant="ghost" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="w-5 h-5" />
          </GlassButton>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span className="text-lg font-medium text-white">{formatDateLabel()}</span>
          </div>
          <GlassButton variant="ghost" onClick={() => navigateDate('next')}>
            <ChevronRight className="w-5 h-5" />
          </GlassButton>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Revenue"
          value={`₱${revenueStats.total.toFixed(2)}`}
          subValue={revenueStats.forecast > 0 ? `+₱${revenueStats.forecast.toFixed(2)} queued` : undefined}
          icon={<DollarSign className="w-5 h-5" />}
          variant="success"
          delay={0.15}
        />
        <StatCard
          label="Completed"
          value={`₱${revenueStats.completed.toFixed(2)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="info"
          delay={0.2}
        />
        <StatCard
          label="In Progress"
          value={`₱${revenueStats.printing.toFixed(2)}`}
          subValue={revenueStats.forecast > 0 ? `+₱${revenueStats.forecast.toFixed(2)} forecast` : undefined}
          icon={<Printer className="w-5 h-5" />}
          variant="warning"
          delay={0.25}
        />
      </div>

      {/* Jobs Table */}
      <JobsTable showDateColumn={activeTab === 'monthly'} />

      {/* Receipt Modal */}
      {selectedJob && (
        <Receipt
          job={selectedJob}
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedJob(null);
          }}
        />
      )}

      {/* Settings Modal */}
      <GlassModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Pricing Settings"
        description="Configure the rates used for cost calculations"
        hideCloseButton={isSavingSettings}
      >
        <div className="space-y-4">
          <GlassFormField
            label="Electricity Rate (₱ per hour)"
            description="Cost of electricity per hour of printing"
          >
            <GlassInput
              type="number"
              step="0.01"
              min="0"
              value={electricityRate}
              onChange={(e) => setElectricityRate(e.target.value)}
            />
          </GlassFormField>

          <GlassFormField
            label="Markup Percentage (%)"
            description="Profit margin added to base costs"
          >
            <GlassInput
              type="number"
              step="1"
              min="0"
              max="100"
              value={markupPercentage}
              onChange={(e) => setMarkupPercentage(e.target.value)}
            />
          </GlassFormField>

          <div className="p-3 rounded-xl glass-sub-card">
            <p className="text-sm text-white/60">
              <strong>Formula:</strong> Total = (Filament + Electricity) × (1 + Markup%)
            </p>
            <p className="text-xs text-white/40 mt-1">
              Electricity = Duration (hours) × Rate per hour
            </p>
          </div>

          <GlassModalFooter>
            <GlassButton
              variant="ghost"
              className="flex-1"
              onClick={() => setShowSettingsModal(false)}
              disabled={isSavingSettings}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              className="flex-1"
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
            >
              {isSavingSettings ? 'Saving...' : 'Save Settings'}
            </GlassButton>
          </GlassModalFooter>
        </div>
      </GlassModal>
    </div>
  );
};

export default AdminReports;
