import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  Input,
  FormField,
  FileUpload,
  FilePreview,
  Badge,
} from 'gisketch-neumorphism';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useHasActiveJob, useJobs } from '../hooks/useJobs';
import { createJob } from '../services/jobService';
import { formatDuration, formatRelativeTime } from '../lib/utils';
import { JOB_STATUS_CONFIG } from '../types';
import type { Job } from '../types';
import { Plus, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasActiveJob, activeJob, isLoading: checkingActive } = useHasActiveJob(user?.id);
  const { jobs, isLoading: loadingJobs } = useJobs({ userId: user?.id });

  // New Job Modal
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [stlFile, setStlFile] = useState<File | null>(null);
  const [stlLink, setStlLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Print Jobs</h1>
          <p className="text-muted-foreground">
            Submit and track your 3D print requests
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowNewJobModal(true)}
          disabled={hasActiveJob || checkingActive}
          className="gap-2"
        >
          <Plus className="w-5 h-5" />
          New Print Request
        </Button>
      </div>

      {/* Active Job Warning */}
      {hasActiveJob && activeJob && (
        <Card className="border-l-4 border-l-warning">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">
                  You have an active print request
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your job "{activeJob.project_name}" is currently{' '}
                  <span className={JOB_STATUS_CONFIG[activeJob.status].color}>
                    {JOB_STATUS_CONFIG[activeJob.status].label}
                  </span>
                  . You can submit a new request once it's completed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Jobs */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Requests</h2>
        {loadingJobs ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            </CardContent>
          </Card>
        ) : activeJobs.length === 0 ? (
          <Card variant="pressed">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No active print requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Jobs */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">History</h2>
        {completedJobs.length === 0 ? (
          <Card variant="pressed">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No completed jobs yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {completedJobs.slice(0, 5).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      {/* New Job Modal */}
      <Modal
        isOpen={showNewJobModal}
        onClose={closeNewJobModal}
        title={submitSuccess ? 'Request Submitted!' : 'New Print Request'}
        description={
          submitSuccess
            ? undefined
            : 'Submit your 3D model for printing'
        }
      >
        {submitSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <p className="text-foreground mb-2">Your request has been submitted!</p>
            <p className="text-sm text-muted-foreground mb-6">
              An admin will review your file and add it to the queue. You'll see the status update in real-time.
            </p>
            <Button onClick={closeNewJobModal} className="w-full">
              Got it
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitJob} className="space-y-4">
            {submitError && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                {submitError}
              </div>
            )}

            <FormField label="Project Name" required>
              <Input
                type="text"
                placeholder="e.g., Headphone Stand"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </FormField>

            <FormField
              label="STL File"
              description="Upload your 3D model file (max 50MB)"
            >
              {stlFile ? (
                <FilePreview
                  file={stlFile}
                  onRemove={() => setStlFile(null)}
                />
              ) : (
                <FileUpload
                  onFilesSelected={(files) => setStlFile(files[0] || null)}
                  title="Drop STL file here or click to upload"
                  description="STL files up to 50MB"
                  accept=".stl"
                  maxSize={50 * 1024 * 1024}
                />
              )}
            </FormField>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <FormField
              label="STL File Link"
              description="Google Drive, Dropbox, or other file sharing link"
            >
              <Input
                type="url"
                placeholder="https://drive.google.com/..."
                value={stlLink}
                onChange={(e) => setStlLink(e.target.value)}
                disabled={!!stlFile}
              />
            </FormField>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={closeNewJobModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

// Job Card Component
const JobCard: React.FC<{ job: Job }> = ({ job }) => {
  const statusConfig = JOB_STATUS_CONFIG[job.status];

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">
                {job.project_name}
              </h3>
              <Badge variant={
                job.status === 'printing' ? 'success' :
                job.status === 'queued' ? 'primary' :
                job.status === 'pending_review' ? 'warning' :
                job.status === 'completed' ? 'success' :
                'destructive'
              }>
                {statusConfig.label}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>{formatRelativeTime(job.created)}</span>

              {job.estimated_duration_min && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Est. {formatDuration(job.estimated_duration_min)}
                </span>
              )}

              {job.price_pesos && (
                <span>₱{job.price_pesos.toFixed(2)}</span>
              )}
            </div>

            {job.admin_notes && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                Note: {job.admin_notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
