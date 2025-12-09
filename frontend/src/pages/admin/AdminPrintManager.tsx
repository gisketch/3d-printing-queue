import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Textarea,
  FormField,
  Badge,
  Separator,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from 'gisketch-neumorphism';
import { motion } from 'framer-motion';
import { Modal } from '../../components/Modal';
import { 
  PageTransition, 
  AnimatedCard, 
  PulsingDot,
  AnimatedProgress,
} from '../../components/AnimatedComponents';
import { useJobs } from '../../hooks/useJobs';
import { startPrinting, completeJob, failJob } from '../../services/jobService';
import { formatDuration, formatRelativeTime } from '../../lib/utils';
import type { Job } from '../../types';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock, 
  User, 
  Printer,
  ListOrdered,
  History,
} from 'lucide-react';

export const AdminPrintManager: React.FC = () => {
  // Get printing and queued jobs
  const { jobs: printingJobs, isLoading: loadingPrinting } = useJobs({ status: 'printing' });
  const { jobs: queuedJobs, isLoading: loadingQueued } = useJobs({ status: 'queued' });
  const { jobs: completedJobs, isLoading: loadingCompleted } = useJobs({ status: 'completed' });

  const currentJob = printingJobs[0] || null;
  const nextJob = queuedJobs[0] || null;
  const recentCompleted = completedJobs.slice(0, 5);

  // Completion Modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeHours, setCompleteHours] = useState('');
  const [completeMins, setCompleteMins] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  // Fail Modal
  const [showFailModal, setShowFailModal] = useState(false);
  const [failNotes, setFailNotes] = useState('');
  const [isFailing, setIsFailing] = useState(false);

  // Start Modal
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartPrint = (job: Job) => {
    setSelectedJob(job);
    setShowStartModal(true);
  };

  const confirmStart = async () => {
    if (!selectedJob) return;

    setIsStarting(true);
    try {
      await startPrinting(selectedJob.id);
      setShowStartModal(false);
      setSelectedJob(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleComplete = () => {
    if (!currentJob) return;
    const estHours = Math.floor((currentJob.estimated_duration_min || 0) / 60);
    const estMins = (currentJob.estimated_duration_min || 0) % 60;
    setCompleteHours(estHours.toString());
    setCompleteMins(estMins.toString());
    setShowCompleteModal(true);
  };

  const confirmComplete = async () => {
    if (!currentJob) return;

    const hours = parseInt(completeHours) || 0;
    const mins = parseInt(completeMins) || 0;

    if (hours === 0 && mins === 0) {
      return;
    }

    setIsCompleting(true);
    try {
      await completeJob(currentJob.id, hours, mins);
      setShowCompleteModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleFail = () => {
    setFailNotes('');
    setShowFailModal(true);
  };

  const confirmFail = async () => {
    if (!currentJob) return;

    setIsFailing(true);
    try {
      await failJob(currentJob.id, failNotes);
      setShowFailModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFailing(false);
    }
  };

  const isLoading = loadingPrinting || loadingQueued || loadingCompleted;

  // Calculate total queue time
  const totalQueueTime = queuedJobs.reduce((acc, job) => acc + (job.estimated_duration_min || 0), 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Print Manager</h1>
          <p className="text-muted-foreground">
            Manage the physical printer and queue execution
          </p>
        </motion.div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Loading...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Currently Printing - Takes 2 columns */}
              <AnimatedCard delay={0.1} className="lg:col-span-2">
                <Card className={currentJob ? 'border-l-4 border-l-success' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-muted/50">
                          <Printer className="w-6 h-6 text-foreground" />
                        </div>
                        Currently Printing
                      </span>
                      <Badge variant={currentJob ? 'success' : 'default'}>
                        <span className="flex items-center gap-2">
                          {currentJob && <PulsingDot color="success" size="sm" />}
                          {currentJob ? 'Active' : 'Idle'}
                        </span>
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentJob ? (
                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              {currentJob.project_name}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {currentJob.expand?.user?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Est. {formatDuration(currentJob.estimated_duration_min || 0)}
                              </span>
                              <span>₱{currentJob.price_pesos?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground">In Progress</span>
                          </div>
                          <AnimatedProgress value={50} />
                          <p className="text-xs text-muted-foreground">
                            Started {formatRelativeTime(currentJob.updated)}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            variant="success"
                            className="flex-1 gap-2"
                            onClick={handleComplete}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Complete
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1 gap-2"
                            onClick={handleFail}
                          >
                            <XCircle className="w-4 h-4" />
                            Mark Failed
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                          <Printer className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground mb-4">No job currently printing</p>
                        {nextJob && (
                          <Button
                            variant="primary"
                            className="gap-2"
                            onClick={() => handleStartPrint(nextJob)}
                          >
                            <Play className="w-4 h-4" />
                            Start Next Job
                          </Button>
                        )}
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
                        <ListOrdered className="w-5 h-5 text-primary" />
                      </div>
                      Queue Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-xl bg-muted/30">
                        <span className="text-3xl font-bold text-foreground">{queuedJobs.length}</span>
                        <p className="text-xs text-muted-foreground mt-1">In Queue</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-muted/30">
                        <span className="text-3xl font-bold text-foreground">
                          {totalQueueTime > 0 ? formatDuration(totalQueueTime) : '-'}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">Total Time</p>
                      </div>
                    </div>

                    {nextJob && !currentJob && (
                      <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                        <p className="text-sm font-medium text-foreground mb-1">Up Next</p>
                        <p className="text-sm text-muted-foreground">{nextJob.project_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {nextJob.expand?.user?.name}
                        </p>
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full mt-3 gap-2"
                          onClick={() => handleStartPrint(nextJob)}
                        >
                          <Play className="w-4 h-4" />
                          Start Print
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>

            <Separator />

            {/* Queue Table */}
            <AnimatedCard delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListOrdered className="w-5 h-5" />
                    Print Queue
                    {queuedJobs.length > 0 && (
                      <Badge variant="primary" className="ml-2">{queuedJobs.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                {queuedJobs.length === 0 ? (
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Queue is empty</p>
                  </CardContent>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queuedJobs.map((job, index) => (
                        <motion.tr
                          key={job.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-muted/20 last:border-0"
                        >
                          <TableCell className="font-bold text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium">{job.project_name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {job.expand?.user?.name}
                          </TableCell>
                          <TableCell>{formatDuration(job.estimated_duration_min || 0)}</TableCell>
                          <TableCell>₱{job.price_pesos?.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            {index === 0 && !currentJob && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleStartPrint(job)}
                                className="gap-1"
                              >
                                <Play className="w-4 h-4" />
                                Start
                              </Button>
                            )}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </AnimatedCard>

            {/* Recent Completed */}
            <AnimatedCard delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recently Completed
                  </CardTitle>
                </CardHeader>
                {recentCompleted.length === 0 ? (
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No completed jobs yet</p>
                  </CardContent>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Completed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentCompleted.map((job, index) => (
                        <motion.tr
                          key={job.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-muted/20 last:border-0"
                        >
                          <TableCell className="font-medium">{job.project_name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {job.expand?.user?.name}
                          </TableCell>
                          <TableCell>
                            {formatDuration(job.actual_duration_min || job.estimated_duration_min || 0)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatRelativeTime(job.updated)}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </AnimatedCard>
          </>
        )}

        {/* Start Print Modal */}
        <Modal
          isOpen={showStartModal}
          onClose={() => setShowStartModal(false)}
          title="Start Print Job"
          hideCloseButton={isStarting}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="font-medium text-foreground">{selectedJob?.project_name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                by {selectedJob?.expand?.user?.name}
              </p>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>Est. {formatDuration(selectedJob?.estimated_duration_min || 0)}</span>
                <span>₱{selectedJob?.price_pesos?.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Confirm that the printer is ready and the file has been loaded.
            </p>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowStartModal(false)}
                disabled={isStarting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={confirmStart}
                disabled={isStarting}
              >
                {isStarting ? 'Starting...' : 'Start Print'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Complete Modal */}
        <Modal
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          title="Job Finished"
          description="Confirm the actual print duration"
          hideCloseButton={isCompleting}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirmComplete();
            }}
            className="space-y-4"
          >
            <div className="p-3 rounded-xl bg-success/10 text-success text-sm">
              The estimated time was {formatDuration(currentJob?.estimated_duration_min || 0)}.
              Adjust if needed.
            </div>

            <FormField label="Actual Duration" required>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Hours"
                    value={completeHours}
                    onChange={(e) => setCompleteHours(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Minutes"
                    value={completeMins}
                    onChange={(e) => setCompleteMins(e.target.value)}
                  />
                </div>
              </div>
            </FormField>

            <p className="text-xs text-muted-foreground">
              This updates the user's Karma score for queue fairness.
            </p>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setShowCompleteModal(false)}
                disabled={isCompleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                className="flex-1"
                disabled={isCompleting}
              >
                {isCompleting ? 'Completing...' : 'Confirm Complete'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Fail Modal */}
        <Modal
          isOpen={showFailModal}
          onClose={() => setShowFailModal(false)}
          title="Mark as Failed"
          hideCloseButton={isFailing}
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-warning/10 text-warning text-sm">
              Failed prints don't penalize the user's Karma. They get a free retry.
            </div>

            <FormField label="Failure Notes">
              <Textarea
                placeholder="What went wrong? (e.g., bed adhesion failure)"
                value={failNotes}
                onChange={(e) => setFailNotes(e.target.value)}
              />
            </FormField>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowFailModal(false)}
                disabled={isFailing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={confirmFail}
                disabled={isFailing}
              >
                {isFailing ? 'Processing...' : 'Mark Failed'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
};
