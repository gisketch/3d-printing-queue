import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Input,
  Textarea,
  FormField,
  Badge,
} from 'gisketch-neumorphism';
import { Modal } from '../../components/Modal';
import { useJobs } from '../../hooks/useJobs';
import { approveJob, rejectJob, getSTLFileUrl } from '../../services/jobService';
import { formatRelativeTime } from '../../lib/utils';
import type { Job } from '../../types';
import { Check, X, Download, ExternalLink, Loader2, FileText } from 'lucide-react';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Review Jobs</h1>
        <p className="text-muted-foreground">
          Review pending print requests, slice files, and set pricing
        </p>
      </div>

      {/* Instructions */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="py-4">
          <h3 className="font-medium text-foreground mb-2">Review Process:</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Download or open the STL file</li>
            <li>Open in your slicer software (Cura/PrusaSlicer)</li>
            <li>Check for errors and get time estimate</li>
            <li>Calculate price based on filament usage</li>
            <li>Approve with the estimated time and price</li>
          </ol>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          </CardContent>
        </Card>
      ) : jobs.length === 0 ? (
        <Card variant="pressed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No jobs pending review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{job.project_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {job.expand?.user?.name || 'Unknown'} • {formatRelativeTime(job.created)}
                    </p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
              </CardHeader>

              <CardContent>
                {/* File Access */}
                <div className="flex flex-wrap gap-2">
                  {job.stl_file && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => downloadSTL(job)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download STL
                    </Button>
                  )}
                  {job.stl_link && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => window.open(job.stl_link, '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Link
                    </Button>
                  )}
                  {!job.stl_file && !job.stl_link && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      No file provided
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="gap-2">
                <Button
                  variant="success"
                  className="flex-1 gap-2"
                  onClick={() => handleApprove(job)}
                >
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => handleReject(job)}
                >
                  <X className="w-4 h-4" />
                  Reject
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

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
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
              {approveError}
            </div>
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
  );
};
