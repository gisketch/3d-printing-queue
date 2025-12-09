import React from 'react';
import {
  Card,
  CardContent,
  Progress,
  Avatar,
} from 'gisketch-neumorphism';
import { useJobs } from '../hooks/useJobs';
import { formatDuration, formatRelativeTime } from '../lib/utils';
import type { Job } from '../types';
import { Printer, Clock, Users, Loader2 } from 'lucide-react';

export const QueueBoard: React.FC = () => {
  // Get all active jobs
  const { jobs: printingJobs, isLoading: loadingPrinting } = useJobs({ status: 'printing' });
  const { jobs: queuedJobs, isLoading: loadingQueued } = useJobs({ status: 'queued' });
  const { jobs: completedJobs, isLoading: loadingCompleted } = useJobs({ status: 'completed' });

  const currentJob = printingJobs[0] || null;
  const nextJob = queuedJobs[0] || null;
  const remainingQueue = queuedJobs.slice(1);
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
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Printer className="w-5 h-5" />}
          label="Status"
          value={currentJob ? 'Printing' : 'Idle'}
          variant={currentJob ? 'success' : 'default'}
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="In Queue"
          value={queuedJobs.length.toString()}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Est. Wait Time"
          value={totalQueueTime > 0 ? formatDuration(totalQueueTime) : '-'}
        />
      </div>

      {/* Queue Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Printing Now */}
        <QueueColumn
          title="Printing Now"
          color="success"
          isEmpty={!currentJob}
          emptyText="Printer is idle"
        >
          {currentJob && <JobCard job={currentJob} isPrinting />}
        </QueueColumn>

        {/* Up Next */}
        <QueueColumn
          title="Up Next"
          color="warning"
          isEmpty={!nextJob}
          emptyText="Queue is empty"
        >
          {nextJob && <JobCard job={nextJob} />}
        </QueueColumn>

        {/* The Queue */}
        <QueueColumn
          title="The Queue"
          color="primary"
          isEmpty={remainingQueue.length === 0}
          emptyText="No jobs waiting"
        >
          {remainingQueue.map((job, index) => (
            <JobCard key={job.id} job={job} position={index + 2} />
          ))}
        </QueueColumn>

        {/* Completed */}
        <QueueColumn
          title="Completed"
          color="default"
          isEmpty={recentCompleted.length === 0}
          emptyText="No completed jobs"
        >
          {recentCompleted.map((job) => (
            <JobCard key={job.id} job={job} isCompleted />
          ))}
        </QueueColumn>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'warning' | 'primary';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, variant = 'default' }) => {
  const colorClasses = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning',
    primary: 'text-primary',
  };

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-muted/50 ${colorClasses[variant]}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-xl font-semibold ${colorClasses[variant]}`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Queue Column Component
interface QueueColumnProps {
  title: string;
  color: 'success' | 'warning' | 'primary' | 'default';
  isEmpty: boolean;
  emptyText: string;
  children: React.ReactNode;
}

const QueueColumn: React.FC<QueueColumnProps> = ({
  title,
  color,
  isEmpty,
  emptyText,
  children,
}) => {
  const colorClasses = {
    success: 'bg-success',
    warning: 'bg-warning',
    primary: 'bg-primary',
    default: 'bg-muted-foreground',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${colorClasses[color]}`} />
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>

      <div className="space-y-3 min-h-[200px]">
        {isEmpty ? (
          <Card variant="pressed">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">{emptyText}</p>
            </CardContent>
          </Card>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

// Job Card Component
interface JobCardProps {
  job: Job;
  isPrinting?: boolean;
  isCompleted?: boolean;
  position?: number;
}

const JobCard: React.FC<JobCardProps> = ({ job, isPrinting, isCompleted, position }) => {
  const userName = job.expand?.user?.name || 'Unknown';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className={isPrinting ? 'border-l-4 border-l-success' : ''}>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          {position && (
            <span className="text-lg font-bold text-muted-foreground">#{position}</span>
          )}

          <Avatar size="sm">
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs font-medium">
              {initials}
            </div>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{job.project_name}</p>
            <p className="text-xs text-muted-foreground">{userName}</p>

            {!isCompleted && job.estimated_duration_min && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDuration(job.estimated_duration_min)}
              </div>
            )}

            {isCompleted && job.actual_duration_min && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatDuration(job.actual_duration_min)} • {formatRelativeTime(job.updated)}
              </p>
            )}
          </div>
        </div>

        {isPrinting && (
          <div className="mt-3">
            <Progress value={50} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">
              Started {formatRelativeTime(job.updated)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
