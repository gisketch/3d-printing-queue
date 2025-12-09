import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, User, Lock, CheckCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassModal } from '../components/ui/GlassModal';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { useAuth } from '../context/AuthContext';
import { useRequestAccess } from '../hooks/useUsers';
import { cn, glass } from '../glass';

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div
            className={cn(
              'inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4',
              glass.blur.xl,
              'bg-gradient-to-br from-cyan-500/20 to-purple-500/20',
              'border border-white/10',
              glass.shadow.glowStrong
            )}
          >
            <Printer className="w-10 h-10 text-cyan-300" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Netzon 3D Print Queue
          </h1>
          <p className="text-white/60">
            Manage your 3D printing requests
          </p>
        </div>

        {/* Login Card */}
        <GlassCard variant="strong" className="p-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">Sign In</h2>
              <p className="text-white/50 text-sm">
                Enter your credentials to access the print queue
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            <GlassInput
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User size={18} />}
              required
            />

            <GlassInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
            />

            <div className="space-y-3 pt-2">
              <GlassButton
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </GlassButton>

              <GlassButton
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowRequestModal(true)}
              >
                Request Access
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>

      {/* Request Access Modal */}
      <GlassModal
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
          <div className="text-center py-4">
            <div className={cn(
              'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
              'bg-emerald-500/20 border border-emerald-400/30'
            )}>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-white mb-2">Your request has been submitted!</p>
            <p className="text-sm text-white/50 mb-6">
              An admin will review your request and send you login credentials. Message Glenn, Stephen, or Julius.
            </p>
            <GlassButton onClick={closeRequestModal} variant="primary" className="w-full">
              Got it
            </GlassButton>
          </div>
        ) : (
          <form onSubmit={handleRequestAccess} className="space-y-4">
            {requestError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 text-sm">
                {requestError}
              </div>
            )}

            <GlassInput
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={requestFullName}
              onChange={(e) => setRequestFullName(e.target.value)}
              icon={<User size={18} />}
              required
            />

            <div>
              <GlassInput
                label="Desired Username"
                type="text"
                placeholder="johndoe"
                value={requestUsername}
                onChange={(e) => setRequestUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                required
              />
              <p className="text-xs text-white/40 mt-4">This will be your login username</p>
            </div>

            <div className="flex gap-3 pt-2">
              <GlassButton
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={closeRequestModal}
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </GlassButton>
            </div>
          </form>
        )}
      </GlassModal>
    </div>
  );
};
