import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  FormField,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Separator,
} from 'gisketch-neumorphism';
import { motion } from 'framer-motion';
import { Modal } from '../../components/Modal';
import { PageTransition, AnimatedCard } from '../../components/AnimatedComponents';
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
    setApproveError('');
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedJob) return;

    const price = parseFloat(priceInput);
    const hours = parseInt(hoursInput) || 0;
    const mins = parseInt(minsInput) || 0;

    if (isNaN(price) || price <= 0) {
      setApproveError('Please enter a valid price');
      return;
    }

    if (hours === 0 && mins === 0) {
      setApproveError('Please enter an estimated duration');
      return;
    }

    setIsApproving(true);
    try {
      await approveJob(selectedJob.id, {
        price_pesos: price,
        estimated_duration_hours: hours,
        estimated_duration_mins: mins,
        admin_notes: notesInput || undefined,
      });
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
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Review Jobs</h1>
              <p className="text-muted-foreground">
                Review pending print requests, slice files, and set pricing
              </p>
            </div>
            <Badge variant="warning" className="text-lg px-4 py-2">
              {jobs.length} Pending
            </Badge>
          </div>
        </motion.div>

        {/* Instructions Card */}
        <AnimatedCard delay={0.1}>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">Review Process</h3>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Download or open the STL file</li>
                    <li>Open in your slicer software (Cura/PrusaSlicer)</li>
                    <li>Check for errors and get time estimate</li>
                    <li>Calculate price based on filament usage</li>
                    <li>Approve with the estimated time and price</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <Separator />

        {/* Jobs Table */}
        <AnimatedCard delay={0.2}>
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Loading jobs...</p>
              </CardContent>
            </Card>
          ) : jobs.length === 0 ? (
            <Card variant="pressed">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <FileCheck className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No jobs pending review</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All caught up! Check back later for new submissions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Pending Review
                </CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job, index) => (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-muted/20 last:border-0"
                    >
                      <TableCell>
                        <div className="font-medium text-foreground">{job.project_name}</div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {job.expand?.user?.name || 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {formatRelativeTime(job.created)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {job.stl_file && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadSTL(job)}
                              className="gap-1"
                            >
                              <Download className="w-4 h-4" />
                              STL
                            </Button>
                          )}
                          {job.stl_link && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(job.stl_link, '_blank')}
                              className="gap-1"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Link
                            </Button>
                          )}
                          {!job.stl_file && !job.stl_link && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <FileText className="w-4 h-4" />
                              None
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApprove(job)}
                            className="gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(job)}
                            className="gap-1"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </AnimatedCard>

        {/* Approval Modal */}
        <Modal
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
            {approveError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
              >
                {approveError}
              </motion.div>
            )}

            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-sm font-medium text-foreground">
                {selectedJob?.project_name}
              </p>
              <p className="text-xs text-muted-foreground">
                by {selectedJob?.expand?.user?.name}
              </p>
            </div>

            <FormField label="Price (PHP)" required>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 150.00"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
              />
            </FormField>

            <FormField
              label="Estimated Duration"
              description="From your slicer software"
              required
            >
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Hours"
                    value={hoursInput}
                    onChange={(e) => setHoursInput(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Minutes"
                    value={minsInput}
                    onChange={(e) => setMinsInput(e.target.value)}
                  />
                </div>
              </div>
            </FormField>

            <FormField label="Notes (optional)">
              <Textarea
                placeholder="Any notes for the user..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
              />
            </FormField>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setShowApproveModal(false)}
                disabled={isApproving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                className="flex-1"
                disabled={isApproving}
              >
                {isApproving ? 'Approving...' : 'Approve & Queue'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Rejection Modal */}
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Reject Job"
          hideCloseButton={isRejecting}
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-sm font-medium text-foreground">
                {selectedJob?.project_name}
              </p>
              <p className="text-xs text-muted-foreground">
                by {selectedJob?.expand?.user?.name}
              </p>
            </div>

            <FormField label="Reason for rejection">
              <Textarea
                placeholder="e.g., File is corrupted, model has errors..."
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
              />
            </FormField>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowRejectModal(false)}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={confirmReject}
                disabled={isRejecting}
              >
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
};
