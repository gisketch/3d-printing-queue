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
  Progress,
} from 'gisketch-neumorphism';
import { Modal } from '../../components/Modal';
import { useJobs } from '../../hooks/useJobs';
import { startPrinting, completeJob, failJob } from '../../services/jobService';
import { formatDuration, formatRelativeTime } from '../../lib/utils';
import type { Job } from '../../types';
import { Play, CheckCircle2, XCircle, Loader2, Clock, User } from 'lucide-react';

export const AdminPrintManager: React.FC = () => {
  // Get printing and queued jobs
  const { jobs: printingJobs, isLoading: loadingPrinting } = useJobs({ status: 'printing' });
  const { jobs: queuedJobs, isLoading: loadingQueued } = useJobs({ status: 'queued' });

  const currentJob = printingJobs[0] || null;
  const nextJob = queuedJobs[0] || null;

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
    // Pre-fill with estimated duration
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

  const isLoading = loadingPrinting || loadingQueued;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Print Manager</h1>
        <p className="text-muted-foreground">
          Manage the physical printer and queue execution
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Currently Printing */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-success animate-pulse" />
              Currently Printing
            </h2>

            {currentJob ? (
              <Card className="border-l-4 border-l-success">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{currentJob.project_name}</CardTitle>
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
                    <Badge variant="success">Printing</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">In Progress</span>
                    </div>
                    <Progress value={50} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Started {formatRelativeTime(currentJob.updated)}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="gap-2">
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
                </CardFooter>
              </Card>
            ) : (
              <Card variant="pressed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No job currently printing</p>
                  {nextJob && (
                    <Button
                      variant="primary"
                      className="mt-4 gap-2"
                      onClick={() => handleStartPrint(nextJob)}
                    >
                      <Play className="w-4 h-4" />
                      Start Next Job
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Up Next */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-warning" />
              Up Next
            </h2>

            {nextJob && !currentJob ? (
              <Card className="border-l-4 border-l-warning">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{nextJob.project_name}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {nextJob.expand?.user?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Est. {formatDuration(nextJob.estimated_duration_min || 0)}
                        </span>
                      </div>
                    </div>
                    <Badge variant="warning">Ready</Badge>
                  </div>
                </CardHeader>
                <CardFooter>
                  <Button
                    variant="primary"
                    className="gap-2"
                    onClick={() => handleStartPrint(nextJob)}
                  >
                    <Play className="w-4 h-4" />
                    Start Print
                  </Button>
                </CardFooter>
              </Card>
            ) : nextJob ? (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{nextJob.project_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {nextJob.expand?.user?.name} • Est. {formatDuration(nextJob.estimated_duration_min || 0)}
                      </p>
                    </div>
                    <Badge variant="primary">Queued</Badge>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card variant="pressed">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No jobs in queue</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Queue Preview */}
          {queuedJobs.length > 1 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Queue ({queuedJobs.length - 1} more)
              </h2>
              <div className="space-y-2">
                {queuedJobs.slice(1, 6).map((job, index) => (
                  <Card key={job.id}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-6">
                            #{index + 2}
                          </span>
                          <div>
                            <p className="font-medium text-foreground">{job.project_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {job.expand?.user?.name}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(job.estimated_duration_min || 0)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
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
  );
};
