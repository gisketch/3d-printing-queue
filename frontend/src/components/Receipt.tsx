import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  GlassModal,
  GlassButton,
} from './ui';
import { formatDuration } from '../lib/utils';
import type { Job } from '../types';
import {
  Printer,
  Calendar,
  Clock,
  User,
  FileText,
  Download,
} from 'lucide-react';

// Default electricity rate (PHP per hour)
const DEFAULT_ELECTRICITY_RATE = 7.5;

interface ReceiptProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  electricityRate?: number;
}

export const Receipt: React.FC<ReceiptProps> = ({ job, isOpen, onClose, electricityRate = DEFAULT_ELECTRICITY_RATE }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Calculate costs in frontend
  const durationMin = job.status === 'completed' && job.actual_duration_min 
    ? job.actual_duration_min 
    : (job.estimated_duration_min || 0);
  const durationHours = durationMin / 60;
  const rawCost = job.price_pesos || 0;
  const electricityCost = Math.round(durationHours * electricityRate * 100) / 100;
  const totalCost = Math.round((rawCost + electricityCost) * 100) / 100;

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${job.receipt_number || job.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', system-ui, sans-serif;
              padding: 40px;
              max-width: 400px;
              margin: 0 auto;
              background: white;
              color: #1a1a1a;
            }
            .receipt {
              border: 2px solid #e5e5e5;
              border-radius: 12px;
              padding: 32px;
            }
            .header {
              text-align: center;
              margin-bottom: 24px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #0891b2;
              margin-bottom: 4px;
            }
            .subtitle {
              font-size: 12px;
              color: #666;
            }
            .receipt-number {
              background: #f5f5f5;
              padding: 8px 16px;
              border-radius: 8px;
              font-family: monospace;
              font-size: 14px;
              margin: 16px 0;
              text-align: center;
            }
            .section {
              margin: 20px 0;
            }
            .section-title {
              font-size: 12px;
              text-transform: uppercase;
              color: #666;
              margin-bottom: 8px;
              letter-spacing: 0.5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              font-size: 14px;
            }
            .info-label {
              color: #666;
            }
            .info-value {
              font-weight: 500;
            }
            .divider {
              height: 1px;
              background: #e5e5e5;
              margin: 16px 0;
            }
            .cost-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }
            .cost-label {
              color: #666;
            }
            .cost-value {
              font-weight: 500;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              font-size: 18px;
              font-weight: bold;
              border-top: 2px solid #1a1a1a;
              margin-top: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 24px;
              font-size: 12px;
              color: #666;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
              background: ${job.status === 'completed' ? '#dcfce7' : '#fef9c3'};
              color: ${job.status === 'completed' ? '#166534' : '#854d0e'};
            }
            @media print {
              body { padding: 20px; }
              .receipt { border: 1px solid #ccc; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="logo">🖨️ Netzon 3D Print</div>
              <div class="subtitle">Print Queue System</div>
            </div>
            
            <div class="receipt-number">${job.receipt_number || job.id}</div>
            
            <div class="section">
              <div class="section-title">Project Details</div>
              <div class="info-row">
                <span class="info-label">Project Name</span>
                <span class="info-value">${job.project_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Requested By</span>
                <span class="info-value">${job.expand?.user?.name || 'Unknown'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date</span>
                <span class="info-value">${new Date(job.created).toLocaleDateString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status</span>
                <span class="status-badge">${job.status.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="section">
              <div class="section-title">Print Details</div>
              <div class="info-row">
                <span class="info-label">Estimated Duration</span>
                <span class="info-value">${job.estimated_duration_min ? formatDuration(job.estimated_duration_min) : '-'}</span>
              </div>
              ${job.actual_duration_min ? `
              <div class="info-row">
                <span class="info-label">Actual Duration</span>
                <span class="info-value">${formatDuration(job.actual_duration_min)}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="divider"></div>
            
            <div class="section">
              <div class="section-title">Cost Breakdown</div>
              <div class="cost-row">
                <span class="cost-label">Raw Cost</span>
                <span class="cost-value">₱${rawCost.toFixed(2)}</span>
              </div>
              <div class="cost-row">
                <span class="cost-label">Electricity Cost</span>
                <span class="cost-value">₱${electricityCost.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>TOTAL</span>
                <span>₱${totalCost.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for using Netzon 3D Print!</p>
              <p style="margin-top: 4px;">Generated on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Receipt"
      size="md"
    >
      <div className="space-y-4">
        {/* Receipt Preview */}
        <div
          ref={receiptRef}
          className="p-6 rounded-2xl glass-receipt"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 mb-3"
            >
              <Printer className="w-7 h-7 text-cyan-400" />
            </motion.div>
            <h3 className="text-lg font-bold text-white">Netzon 3D Print</h3>
            <p className="text-sm text-white/50">Print Queue System</p>
          </div>

          {/* Receipt Number */}
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 rounded-xl glass-receipt-number">
              <p className="text-xs text-white/50 mb-1">Receipt Number</p>
              <p className="font-mono text-lg text-cyan-400 font-semibold">
                {job.receipt_number || job.id.slice(0, 15)}
              </p>
            </div>
          </div>

          <div className="glass-receipt-separator" />

          {/* Project Details */}
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
              <FileText className="w-4 h-4" />
              Project Details
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Project Name</span>
              <span className="text-white font-medium">{job.project_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60 flex items-center gap-1">
                <User className="w-3 h-3" /> Requested By
              </span>
              <span className="text-white">{job.expand?.user?.name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </span>
              <span className="text-white">{new Date(job.created).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Duration
              </span>
              <span className="text-white">
                {job.actual_duration_min
                  ? formatDuration(job.actual_duration_min)
                  : job.estimated_duration_min
                  ? `~${formatDuration(job.estimated_duration_min)}`
                  : '-'}
              </span>
            </div>
          </div>

          <div className="glass-receipt-separator" />

          {/* Cost Breakdown */}
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
              Cost Breakdown
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Raw Cost</span>
              <span className="text-white">₱{rawCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Electricity Cost</span>
              <span className="text-white">₱{electricityCost.toFixed(2)}</span>
            </div>
            {job.status !== 'completed' && job.estimated_duration_min && (
              <p className="text-xs text-white/40 italic">
                * Electricity based on estimated duration
              </p>
            )}
          </div>

          {/* Total */}
          <div className="pt-4 glass-receipt-total">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-white">TOTAL</span>
              <span className="text-2xl font-bold text-emerald-400">
                ₱{totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <GlassButton
            variant="ghost"
            className="flex-1"
            onClick={onClose}
          >
            Close
          </GlassButton>
          <GlassButton
            variant="primary"
            className="flex-1"
            onClick={handlePrint}
          >
            <Download className="w-4 h-4 mr-2" />
            Print / Save
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};

export default Receipt;
