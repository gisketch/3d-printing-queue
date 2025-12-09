import React from 'react';
import { GlassModal, GlassButton } from './ui';
import { Scale, Clock, Zap, ShieldCheck } from 'lucide-react';

interface KarmaSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KarmaSystemModal: React.FC<KarmaSystemModalProps> = ({ isOpen, onClose }) => {
  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Welcome to the Netzon Print Queue!"
      size="lg"
    >
      <div className="space-y-6">
        {/* Introduction */}
        <p className="text-white/80 text-base leading-relaxed">
          To keep things fair for everyone, we use a <span className="text-purple-400 font-semibold">Karma System</span> instead of a simple line.
        </p>

        {/* Rules */}
        <div className="space-y-4">
          {/* Karma Rule */}
          <div className="flex gap-4 p-4 rounded-xl glass-sub-card">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 glass-icon-border flex items-center justify-center">
              <Scale className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">The Karma Rule</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Your priority is based on your recent usage. If you haven't printed in a while, you jump to the front! If you just finished a 20-hour print, you'll wait a bit longer to give others a turn.
              </p>
            </div>
          </div>

          {/* One Job at a Time */}
          <div className="flex gap-4 p-4 rounded-xl glass-sub-card">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 glass-icon-border flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">One Job at a Time</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                You can only have one active job in the queue. Please wait for your current print to finish before submitting another.
              </p>
            </div>
          </div>

          {/* Small Job Fast-Pass */}
          <div className="flex gap-4 p-4 rounded-xl glass-sub-card">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 glass-icon-border flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Small Job Fast-Pass</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Printing something tiny (&lt; 45 mins)? The system might squeeze you in between big jobs to save time.
              </p>
            </div>
          </div>

          {/* Admin Review */}
          <div className="flex gap-4 p-4 rounded-xl glass-sub-card">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 glass-icon-border flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Admin Review</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                All files are manually sliced and approved by an Admin before they enter the queue.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <GlassButton
            onClick={onClose}
            variant="primary"
            size="lg"
            className="min-w-[200px]"
          >
            Understood, Let's Print!
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};

export default KarmaSystemModal;
