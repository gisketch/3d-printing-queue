import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  FormField,
  FileUpload,
  FilePreview,
  Badge,
  Separator,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from 'gisketch-neumorphism';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../components/Modal';
import {
  PageTransition,
  AnimatedCard,
  PulsingDot,
  AnimatedProgress,
} from '../components/AnimatedComponents';
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

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </motion.div>

        {/* Main Grid - Printer Status & Queue Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Printer Status Card - Takes 2 columns */}
          <AnimatedCard delay={0.1} className="lg:col-span-2">
            <Card className={currentPrintingJob ? 'border-l-4 border-l-green-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-muted/50">
                      <Printer className="w-6 h-6 text-foreground" />
                    </div>
                    Printer Status
                  </CardTitle>
                  <Badge variant={currentPrintingJob ? 'success' : 'default'}>
                    <span className="flex items-center gap-2">
                      {currentPrintingJob && <PulsingDot color="success" size="sm" />}
                      {currentPrintingJob ? 'Printing' : 'Idle'}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {currentPrintingJob ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {currentPrintingJob.project_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          by {currentPrintingJob.expand?.user?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Estimated</p>
                        <p className="font-semibold text-foreground">
                          {formatDuration(currentPrintingJob.estimated_duration_min || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground">In Progress</span>
                      </div>
                      <AnimatedProgress value={50} />
                      <p className="text-xs text-muted-foreground">
                        Started {formatRelativeTime(currentPrintingJob.updated)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <Printer className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Printer is currently idle</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {queuedJobs.length > 0 ? `${queuedJobs.length} jobs waiting in queue` : 'No jobs in queue'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Queue Stats Card */}
          <AnimatedCard delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-muted/50">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  Queue Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-2xl font-bold text-foreground">{queuedJobs.length}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">In Queue</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-warning" />
                      <span className="text-2xl font-bold text-foreground">
                        {totalQueueTime > 0 ? Math.ceil(totalQueueTime / 60) : 0}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Hours Wait</p>
                  </div>
                </div>

                {!hasActiveJob && (
                  <Button
                    variant="primary"
                    className="w-full gap-2"
                    onClick={() => setShowNewJobModal(true)}
                    disabled={checkingActive}
                  >
                    <Plus className="w-4 h-4" />
                    Submit Request
                  </Button>
                )}

                {hasActiveJob && activeJob && (
                  <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                    <div className="flex items-center gap-2 text-warning text-sm font-medium">
                      <AlertCircle className="w-4 h-4" />
                      Active Request
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      "{activeJob.project_name}" is {JOB_STATUS_CONFIG[activeJob.status].label.toLowerCase()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        <Separator />

        {/* Jobs Section with Tabs */}
        <div>
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'active' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('active')}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              Active Requests
              {activeJobs.length > 0 && (
                <Badge variant="primary" className="ml-1">{activeJobs.length}</Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'history' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('history')}
              className="gap-2"
            >
              <History className="w-4 h-4" />
              History
            </Button>
          </div>

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
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                    </CardContent>
                  </Card>
                ) : activeJobs.length === 0 ? (
                  <Card variant="pressed">
                    <CardContent className="py-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <Printer className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No active print requests</p>
                      <Button
                        variant="primary"
                        className="mt-4 gap-2"
                        onClick={() => setShowNewJobModal(true)}
                        disabled={hasActiveJob}
                      >
                        <Plus className="w-4 h-4" />
                        Submit Your First Request
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Submitted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeJobs.map((job, index) => (
                          <motion.tr
                            key={job.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-muted/20 last:border-0"
                          >
                            <TableCell className="font-medium">{job.project_name}</TableCell>
                            <TableCell>
                              <Badge variant={
                                job.status === 'printing' ? 'success' :
                                job.status === 'queued' ? 'primary' :
                                'warning'
                              }>
                                {job.status === 'printing' && <PulsingDot color="success" size="sm" />}
                                {JOB_STATUS_CONFIG[job.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {job.estimated_duration_min ? formatDuration(job.estimated_duration_min) : '-'}
                            </TableCell>
                            <TableCell>
                              {job.price_pesos ? `₱${job.price_pesos.toFixed(2)}` : '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatRelativeTime(job.created)}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
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
                  <Card variant="pressed">
                    <CardContent className="py-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <History className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No completed jobs yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Completed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completedJobs.map((job, index) => (
                          <motion.tr
                            key={job.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-muted/20 last:border-0"
                          >
                            <TableCell className="font-medium">{job.project_name}</TableCell>
                            <TableCell>
                              <Badge variant={job.status === 'completed' ? 'success' : 'destructive'}>
                                {JOB_STATUS_CONFIG[job.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {job.actual_duration_min ? formatDuration(job.actual_duration_min) :
                               job.estimated_duration_min ? formatDuration(job.estimated_duration_min) : '-'}
                            </TableCell>
                            <TableCell>
                              {job.price_pesos ? `₱${job.price_pesos.toFixed(2)}` : '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatRelativeTime(job.updated)}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
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
            </motion.div>
          ) : (
            <form onSubmit={handleSubmitJob} className="space-y-4">
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
                >
                  {submitError}
                </motion.div>
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

        {/* Floating Action Button */}
        {!showNewJobModal && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 group"
          >
            {hasActiveJob && (
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-foreground text-background text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
                You already have an active print request
                <div className="absolute bottom-0 right-4 translate-y-1/2 rotate-45 w-2 h-2 bg-foreground" />
              </div>
            )}
            <Button
              variant="success"
              size="lg"
              onClick={() => setShowNewJobModal(true)}
              disabled={hasActiveJob || checkingActive}
              className="!rounded-full !p-4 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="w-6 h-6 mr-2" /> New Printing Request
            </Button>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};
