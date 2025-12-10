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
  Download,
} from 'lucide-react';

const ITEMS_PER_PAGE = 15;

// Helper to get week start (Sunday) and end (Saturday)
const getWeekRange = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

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
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getAllSettings();
      if (settings['electricity_rate_per_hour']) {
        setElectricityRate(settings['electricity_rate_per_hour'].toString());
      }
    };
    loadSettings();
  }, []);

  // Filter jobs by date range
  const filteredJobs = useMemo(() => {
    if (!allJobs.length) return [];
    
    let start: Date;
    let end: Date;
    
    if (activeTab === 'daily') {
      start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
    } else if (activeTab === 'weekly') {
      const weekRange = getWeekRange(selectedDate);
      start = weekRange.start;
      end = weekRange.end;
    } else {
      // monthly
      start = new Date(selectedDate);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end = new Date(selectedDate);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }
    
    return allJobs.filter(job => {
      const jobDate = new Date(job.created);
      return jobDate >= start && jobDate <= end;
    });
  }, [allJobs, selectedDate, activeTab]);

  // Calculate revenue stats (with frontend electricity calculation)
  const revenueStats = useMemo(() => {
    const rate = parseFloat(electricityRate) || 7.5;
    
    const calculateTotal = (job: Job) => {
      const rawCost = job.price_pesos || 0;
      const durationMin = job.status === 'completed' && job.actual_duration_min 
        ? job.actual_duration_min 
        : (job.estimated_duration_min || 0);
      const electricityCost = (durationMin / 60) * rate;
      return rawCost + electricityCost;
    };
    
    const completed = filteredJobs.filter(j => j.status === 'completed');
    const printing = filteredJobs.filter(j => j.status === 'printing');
    const queued = filteredJobs.filter(j => j.status === 'queued');
    
    const completedRevenue = completed.reduce((acc, j) => acc + calculateTotal(j), 0);
    const printingRevenue = printing.reduce((acc, j) => acc + calculateTotal(j), 0);
    const queuedRevenue = queued.reduce((acc, j) => acc + calculateTotal(j), 0);
    
    return {
      completed: completedRevenue,
      printing: printingRevenue,
      queued: queuedRevenue,
      total: completedRevenue + printingRevenue,
      forecast: queuedRevenue,
    };
  }, [filteredJobs, electricityRate]);

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
    } else if (activeTab === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
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
    if (activeTab === 'weekly') {
      const { start, end } = getWeekRange(selectedDate);
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    }
    return selectedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  // Print report handler
  const handlePrintReport = () => {
    const rate = parseFloat(electricityRate) || 7.5;
    const reportTitle = activeTab === 'daily' ? 'Daily Report' : activeTab === 'weekly' ? 'Weekly Report' : 'Monthly Report';
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const jobRows = filteredJobs.map(job => {
      const total = calculateJobTotal(job);
      return `
        <tr>
          <td>${job.receipt_number || job.id.slice(0, 10)}</td>
          <td>${job.project_name}</td>
          <td>${job.expand?.user?.name || 'Unknown'}</td>
          <td>${JOB_STATUS_CONFIG[job.status]?.label || job.status}</td>
          <td style="text-align: right;">₱${total.toFixed(2)}</td>
          <td>${new Date(job.created).toLocaleDateString()}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle} - ${formatDateLabel()}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', system-ui, sans-serif;
              padding: 40px;
              max-width: 900px;
              margin: 0 auto;
              background: white;
              color: #1a1a1a;
            }
            .header {
              text-align: center;
              margin-bottom: 32px;
              padding-bottom: 16px;
              border-bottom: 2px solid #e5e5e5;
            }
            .header h1 {
              font-size: 24px;
              margin-bottom: 8px;
            }
            .header .date {
              font-size: 16px;
              color: #666;
            }
            .stats {
              display: flex;
              gap: 24px;
              margin-bottom: 32px;
              justify-content: center;
            }
            .stat-box {
              padding: 16px 24px;
              background: #f5f5f5;
              border-radius: 8px;
              text-align: center;
            }
            .stat-box .label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .stat-box .value {
              font-size: 20px;
              font-weight: bold;
              color: #0891b2;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            th, td {
              padding: 12px 8px;
              text-align: left;
              border-bottom: 1px solid #e5e5e5;
            }
            th {
              background: #f5f5f5;
              font-weight: 600;
              font-size: 12px;
              text-transform: uppercase;
              color: #666;
            }
            td {
              font-size: 14px;
            }
            .total-row {
              font-weight: bold;
              background: #f0fdf4;
            }
            .total-row td {
              border-top: 2px solid #1a1a1a;
            }
            .footer {
              text-align: center;
              margin-top: 32px;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🖨️ Netzon 3D Print - ${reportTitle}</h1>
            <div class="date">${formatDateLabel()}</div>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <div class="label">Total Revenue</div>
              <div class="value">₱${revenueStats.total.toFixed(2)}</div>
            </div>
            <div class="stat-box">
              <div class="label">Completed</div>
              <div class="value">₱${revenueStats.completed.toFixed(2)}</div>
            </div>
            <div class="stat-box">
              <div class="label">In Progress</div>
              <div class="value">₱${revenueStats.printing.toFixed(2)}</div>
            </div>
            <div class="stat-box">
              <div class="label">Queued (Forecast)</div>
              <div class="value">₱${revenueStats.forecast.toFixed(2)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Project</th>
                <th>User</th>
                <th>Status</th>
                <th style="text-align: right;">Cost</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${jobRows || '<tr><td colspan="6" style="text-align: center; color: #666;">No jobs found</td></tr>'}
              ${filteredJobs.length > 0 ? `
              <tr class="total-row">
                <td colspan="4">TOTAL (${filteredJobs.length} jobs)</td>
                <td style="text-align: right;">₱${filteredJobs.reduce((acc, j) => acc + calculateJobTotal(j), 0).toFixed(2)}</td>
                <td></td>
              </tr>
              ` : ''}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Electricity Rate: ₱${rate.toFixed(2)}/hour</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleViewReceipt = (job: Job) => {
    setSelectedJob(job);
    setShowReceiptModal(true);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateSetting('electricity_rate_per_hour', parseFloat(electricityRate) || 7.5);
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Helper to calculate total cost for a job
  const calculateJobTotal = (job: Job) => {
    const rate = parseFloat(electricityRate) || 7.5;
    const rawCost = job.price_pesos || 0;
    const durationMin = job.status === 'completed' && job.actual_duration_min 
      ? job.actual_duration_min 
      : (job.estimated_duration_min || 0);
    const electricityCost = (durationMin / 60) * rate;
    return Math.round((rawCost + electricityCost) * 100) / 100;
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
                      ₱{calculateJobTotal(job).toFixed(2)}
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
        <div className="flex gap-2">
          <GlassButton
            variant="primary"
            onClick={handlePrintReport}
          >
            <Download className="w-4 h-4 mr-2" />
            Print / PDF
          </GlassButton>
          <GlassButton
            variant="ghost"
            onClick={() => setShowSettingsModal(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </GlassButton>
        </div>
      </motion.div>

      {/* Tabs */}
      <GlassTabs
        tabs={[
          { id: 'daily', label: 'Daily', icon: <Calendar className="w-4 h-4" /> },
          { id: 'weekly', label: 'Weekly', icon: <Calendar className="w-4 h-4" /> },
          { id: 'monthly', label: 'Monthly', icon: <Calendar className="w-4 h-4" /> },
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
      <JobsTable showDateColumn={activeTab !== 'daily'} />

      {/* Receipt Modal */}
      {selectedJob && (
        <Receipt
          job={selectedJob}
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedJob(null);
          }}
          electricityRate={parseFloat(electricityRate) || 7.5}
        />
      )}

      {/* Settings Modal */}
      <GlassModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Pricing Settings"
        description="Configure the electricity rate for cost calculations"
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

          <div className="p-3 rounded-xl glass-sub-card">
            <p className="text-sm text-white/60">
              <strong>Formula:</strong> Total = Raw Cost + Electricity Cost
            </p>
            <p className="text-xs text-white/40 mt-1">
              Electricity = Duration (hours) × ₱{electricityRate}/hr
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
