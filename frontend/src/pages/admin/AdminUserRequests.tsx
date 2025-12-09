import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  Textarea,
  FormField,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from 'gisketch-neumorphism';
import { Modal } from '../../components/Modal';
import { useUserRequests } from '../../hooks/useUsers';
import { Check, X, Copy, Loader2 } from 'lucide-react';
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account Requests</h1>
        <p className="text-muted-foreground">
          Review and approve new user account requests
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card variant="pressed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No pending account requests</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.full_name}</TableCell>
                  <TableCell>{request.desired_username}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(request.created).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(request)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(request)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={closeApprovalModal}
        title={approvalResult ? 'Account Created!' : 'Approve Request'}
        hideCloseButton={isApproving}
      >
        {approvalResult ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <p className="text-sm text-success mb-3">
                Account created successfully! Send these credentials to the user via Slack/Teams.
              </p>
              <div className="space-y-2 font-mono text-sm">
                <div>
                  <span className="text-muted-foreground">Username: </span>
                  <span className="text-foreground">{approvalResult.username}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Password: </span>
                  <span className="text-foreground">{approvalResult.password}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={copyCredentials}
              variant={copied ? 'success' : 'default'}
              className="w-full gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Credentials'}
            </Button>

            <Button
              onClick={closeApprovalModal}
              variant="primary"
              className="w-full"
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Create an account for <strong>{selectedRequest?.full_name}</strong> with
              username <strong>{selectedRequest?.desired_username}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              A temporary password will be generated. You'll need to send it to the user manually.
            </p>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={closeApprovalModal}
                disabled={isApproving}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                className="flex-1"
                onClick={confirmApprove}
                disabled={isApproving}
              >
                {isApproving ? 'Creating...' : 'Approve'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Request"
        hideCloseButton={isRejecting}
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Reject request from <strong>{selectedRequest?.full_name}</strong>?
          </p>

          <FormField label="Reason (optional)">
            <Textarea
              placeholder="Enter reason for rejection..."
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
