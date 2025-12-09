import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Avatar,
} from 'gisketch-neumorphism';
import { motion } from 'framer-motion';
import { 
  PageTransition, 
  AnimatedCard, 
  PulsingDot,
  AnimatedProgress,
} from '../components/AnimatedComponents';
import { useJobs } from '../hooks/useJobs';
import { formatDuration, formatRelativeTime } from '../lib/utils';
import type { Job } from '../types';
import { Printer, Clock, Users, Loader2, CheckCircle2, History } from 'lucide-react';

export const QueueBoard: React.FC = () => {
  // Get all active jobs
  const { jobs: printingJobs, isLoading: loadingPrinting } = useJobs({ status: 'printing' });
  const { jobs: queuedJobs, isLoading: loadingQueued } = useJobs({ status: 'queued' });
  const { jobs: completedJobs, isLoading: loadingCompleted } = useJobs({ status: 'completed' });

  const currentJob = printingJobs[0] || null;
  const recentCompleted = completedJobs.slice(0, 5);

  const isLoading = loadingPrinting || loadingQueued || loadingCompleted;

  // Calculate total queue time
  const totalQueueTime = queuedJobs.reduce(
    (acc, job) => acc + (job.estimated_duration_min || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Print Queue</h1>
          <p className="text-muted-foreground">
            Live view of all print jobs
          </p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AnimatedCard delay={0.1}>
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${currentJob ? 'bg-success/10' : 'bg-muted/50'}`}>
                    <Printer className={`w-6 h-6 ${currentJob ? 'text-success' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={`text-xl font-bold ${currentJob ? 'text-success' : 'text-foreground'}`}>
                      {currentJob ? 'Printing' : 'Idle'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.15}>
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">In Queue</p>
                    <p className="text-xl font-bold text-foreground">{queuedJobs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-warning/10">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Wait</p>
                    <p className="text-xl font-bold text-foreground">
                      {totalQueueTime > 0 ? formatDuration(totalQueueTime) : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Currently Printing - Takes 2 columns */}
          <AnimatedCard delay={0.25} className="lg:col-span-2">
            <Card className={currentJob ? 'border-l-4 border-l-green-500' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-muted/50">
                      <Printer className="w-6 h-6 text-foreground" />
                    </div>
                    Printing Now
                  </span>
                  {currentJob && (
                    <Badge variant="success">
                      <span className="flex items-center gap-2">
                        <PulsingDot color="success" size="sm" />
                        Active
                      </span>
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentJob ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <JobAvatar job={currentJob} size="lg" />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground">
                          {currentJob.project_name}
                        </h3>
                        <p className="text-muted-foreground">
                          by {currentJob.expand?.user?.name || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Est. {formatDuration(currentJob.estimated_duration_min || 0)}
                          </span>
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
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <Printer className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg text-muted-foreground">Printer is idle</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {queuedJobs.length > 0 ? 'Next job will start soon' : 'No jobs in queue'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Up Next */}
          <AnimatedCard delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-warning" />
                  Up Next
                </CardTitle>
              </CardHeader>
              <CardContent>
                {queuedJobs.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Queue is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {queuedJobs.slice(0, 3).map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-xl ${index === 0 ? 'bg-warning/10 border border-warning/20' : 'bg-muted/30'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-muted-foreground">
                            #{index + 1}
                          </span>
                          <JobAvatar job={job} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {job.project_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDuration(job.estimated_duration_min || 0)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {queuedJobs.length > 3 && (
                      <p className="text-center text-sm text-muted-foreground">
                        +{queuedJobs.length - 3} more in queue
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        <Separator />

        {/* Queue Table */}
        <AnimatedCard delay={0.35}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Full Queue
                {queuedJobs.length > 0 && (
                  <Badge variant="primary" className="ml-2">{queuedJobs.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            {queuedJobs.length === 0 ? (
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No jobs waiting</p>
              </CardContent>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Est. Duration</TableHead>
                    <TableHead>Queued</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queuedJobs.map((job, index) => (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-muted/20 last:border-0"
                    >
                      <TableCell className="font-bold text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <JobAvatar job={job} size="sm" />
                          <span className="font-medium">{job.project_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {job.expand?.user?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{formatDuration(job.estimated_duration_min || 0)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatRelativeTime(job.created)}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </AnimatedCard>

        {/* Recently Completed */}
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
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-muted/20 last:border-0"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          <span className="font-medium">{job.project_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {job.expand?.user?.name || 'Unknown'}
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
      </div>
    </PageTransition>
  );
};

// Job Avatar Component
interface JobAvatarProps {
  job: Job;
  size?: 'sm' | 'md' | 'lg';
}

const JobAvatar: React.FC<JobAvatarProps> = ({ job, size = 'md' }) => {
  const userName = job.expand?.user?.name || 'Unknown';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <div className={`w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium ${sizeClasses[size]}`}>
        {initials}
      </div>
    </Avatar>
  );
};
