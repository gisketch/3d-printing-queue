import React, { useState } from 'react';
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
  GlassBadge,
  GlassButton,
  GlassModal,
  GlassModalFooter,
  GlassTextarea,
  GlassFormField,
  StatCard,
} from '../../components/ui';
import { useUserRequests } from '../../hooks/useUsers';
import { Check, X, Copy, Loader2, Users, UserPlus, Shield } from 'lucide-react';
import type { UserRequest } from '../../types';

export const AdminUserRequests: React.FC = () => {
  const { requests, isLoading, approveRequest, rejectRequest } = useUserRequests();

  // Approval Modal State
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
  const [approvalResult, setApprovalResult] = useState<{ username: string; password: string } | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = (request: UserRequest) => {
    setSelectedRequest(request);
    setApprovalResult(null);
    setShowApprovalModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;

    setIsApproving(true);
    try {
      const result = await approveRequest(selectedRequest);
      setApprovalResult({
        username: result.user.username,
        password: result.tempPassword,
      });
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = (request: UserRequest) => {
    setSelectedRequest(request);
    setRejectNotes('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;

    setIsRejecting(true);
    try {
      await rejectRequest(selectedRequest.id, rejectNotes);
      setShowRejectModal(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setIsRejecting(false);
    }
  };

  const copyCredentials = () => {
    if (!approvalResult) return;
    const text = `Username: ${approvalResult.username}\nTemporary Password: ${approvalResult.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedRequest(null);
    setApprovalResult(null);
    setCopied(false);
  };

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
          <h1 className="text-2xl font-bold text-white">Account Requests</h1>
          <p className="text-white/60">
            Review and approve new user account requests
          </p>
        </div>
        {requests.length > 0 && (
          <GlassBadge variant="warning" className="text-lg px-4 py-2">
            {requests.length} Pending
          </GlassBadge>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Pending Requests"
          value={requests.length}
          icon={<UserPlus className="w-5 h-5" />}
          variant="warning"
          delay={0.1}
        />
        <StatCard
          label="Active Users"
          value="24"
          icon={<Users className="w-5 h-5" />}
          variant="success"
          delay={0.15}
        />
        <StatCard
          label="Admin Users"
          value="2"
          icon={<Shield className="w-5 h-5" />}
          variant="info"
          delay={0.2}
        />
      </div>

      {/* Requests Table */}
      {isLoading ? (
        <GlassCard>
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-white/40" />
            <p className="text-white/60 mt-2">Loading requests...</p>
          </div>
        </GlassCard>
      ) : requests.length === 0 ? (
        <GlassCard variant="subtle">
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.06] flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white/60">No pending account requests</p>
            <p className="text-sm text-white/40 mt-1">
              New user requests will appear here
            </p>
          </div>
        </GlassCard>
      ) : (
        <GlassCard delay={0.25}>
          <GlassCardHeader>
            <GlassCardTitle icon={<Users className="w-5 h-5 text-cyan-400" />}>
              Pending Requests
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassTable>
            <GlassTableHeader>
              <GlassTableRow>
                <GlassTableHead>Full Name</GlassTableHead>
                <GlassTableHead>Username</GlassTableHead>
                <GlassTableHead>Requested</GlassTableHead>
                <GlassTableHead className="text-right">Actions</GlassTableHead>
              </GlassTableRow>
            </GlassTableHeader>
            <GlassTableBody>
              {requests.map((request, index) => (
                <GlassTableRow key={request.id} delay={index * 0.05}>
                  <GlassTableCell className="font-medium text-white">
                    {request.full_name}
                  </GlassTableCell>
                  <GlassTableCell className="text-white/60">
                    {request.desired_username}
                  </GlassTableCell>
                  <GlassTableCell className="text-white/40">
                    {new Date(request.created).toLocaleDateString()}
                  </GlassTableCell>
                  <GlassTableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <GlassButton
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(request)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </GlassButton>
                      <GlassButton
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(request)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </GlassButton>
                    </div>
                  </GlassTableCell>
                </GlassTableRow>
              ))}
            </GlassTableBody>
          </GlassTable>
        </GlassCard>
      )}

      {/* Approval Modal */}
      <GlassModal
        isOpen={showApprovalModal}
        onClose={closeApprovalModal}
        title={approvalResult ? 'Account Created!' : 'Approve Request'}
        hideCloseButton={isApproving}
      >
        {approvalResult ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
              <p className="text-sm text-emerald-300 mb-3">
                Account created successfully! Send these credentials to the user.
              </p>
              <div className="space-y-2 font-mono text-sm">
                <div>
                  <span className="text-white/50">Username: </span>
                  <span className="text-white">{approvalResult.username}</span>
                </div>
                <div>
                  <span className="text-white/50">Password: </span>
                  <span className="text-white">{approvalResult.password}</span>
                </div>
              </div>
            </div>

            <GlassButton
              onClick={copyCredentials}
              variant={copied ? 'success' : 'default'}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Credentials'}
            </GlassButton>

            <GlassButton
              onClick={closeApprovalModal}
              variant="primary"
              className="w-full"
            >
              Done
            </GlassButton>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/60">
              Create an account for <strong className="text-white">{selectedRequest?.full_name}</strong> with
              username <strong className="text-cyan-400">{selectedRequest?.desired_username}</strong>?
            </p>
            <p className="text-sm text-white/40">
              A temporary password will be generated. You'll need to send it to the user manually.
            </p>

            <GlassModalFooter>
              <GlassButton
                variant="ghost"
                className="flex-1"
                onClick={closeApprovalModal}
                disabled={isApproving}
              >
                Cancel
              </GlassButton>
              <GlassButton
                variant="success"
                className="flex-1"
                onClick={confirmApprove}
                disabled={isApproving}
              >
                {isApproving ? 'Creating...' : 'Approve'}
              </GlassButton>
            </GlassModalFooter>
          </div>
        )}
      </GlassModal>

      {/* Rejection Modal */}
      <GlassModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Request"
        hideCloseButton={isRejecting}
      >
        <div className="space-y-4">
          <p className="text-white/60">
            Reject request from <strong className="text-white">{selectedRequest?.full_name}</strong>?
          </p>

          <GlassFormField label="Reason (optional)">
            <GlassTextarea
              placeholder="Enter reason for rejection..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
            />
          </GlassFormField>

          <GlassModalFooter>
            <GlassButton
              variant="ghost"
              className="flex-1"
              onClick={() => setShowRejectModal(false)}
              disabled={isRejecting}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="danger"
              className="flex-1"
              onClick={confirmReject}
              disabled={isRejecting}
            >
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </GlassButton>
          </GlassModalFooter>
        </div>
      </GlassModal>
    </div>
  );
};
