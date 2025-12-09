import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  FormField,
} from 'gisketch-neumorphism';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useRequestAccess } from '../hooks/useUsers';
import { Printer } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { submitRequest, isSubmitting } = useRequestAccess();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Request Access Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestFullName, setRequestFullName] = useState('');
  const [requestUsername, setRequestUsername] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError('');

    if (!requestFullName.trim() || !requestUsername.trim()) {
      setRequestError('Please fill in all fields');
      return;
    }

    const success = await submitRequest(requestFullName.trim(), requestUsername.trim());
    if (success) {
      setRequestSuccess(true);
    } else {
      setRequestError('Failed to submit request. Username may already be taken.');
    }
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestFullName('');
    setRequestUsername('');
    setRequestError('');
    setRequestSuccess(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4
            shadow-[-4px_-4px_8px_rgba(var(--shadow-light)),4px_4px_8px_rgba(var(--shadow-dark)),inset_2px_2px_4px_hsl(var(--primary-light)),inset_-2px_-2px_4px_hsl(var(--primary-dark)/0.5)]">
            <Printer className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Netzon 3D Print Queue</h1>
          <p className="text-muted-foreground mt-1">Manage your 3D printing requests</p>
        </div>

        {/* Login Card */}
        <Card>
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access the print queue
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <FormField label="Username">
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Password">
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormField>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowRequestModal(true)}
              >
                Request Access
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Request Access Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={closeRequestModal}
        title={requestSuccess ? 'Request Submitted!' : 'Request Access'}
        description={
          requestSuccess
            ? undefined
            : 'Fill in your details to request an account'
        }
      >
        {requestSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-foreground mb-2">Your request has been submitted!</p>
            <p className="text-sm text-muted-foreground mb-6">
              An admin will review your request and send you login credentials via Slack/Teams.
            </p>
            <Button onClick={closeRequestModal} className="w-full">
              Got it
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRequestAccess} className="space-y-4">
            {requestError && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                {requestError}
              </div>
            )}

            <FormField label="Full Name" required>
              <Input
                type="text"
                placeholder="John Doe"
                value={requestFullName}
                onChange={(e) => setRequestFullName(e.target.value)}
              />
            </FormField>

            <FormField
              label="Desired Username"
              description="This will be your login username"
              required
            >
              <Input
                type="text"
                placeholder="johndoe"
                value={requestUsername}
                onChange={(e) => setRequestUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
              />
            </FormField>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={closeRequestModal}
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
