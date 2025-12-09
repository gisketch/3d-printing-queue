import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const generateOrbs = (count: number): Orb[] => {
  const colors = [
    'rgba(139, 92, 246, 0.4)',   // Purple
    'rgba(59, 130, 246, 0.4)',   // Blue
    'rgba(147, 51, 234, 0.35)',  // Violet
    'rgba(99, 102, 241, 0.35)',  // Indigo
    'rgba(168, 85, 247, 0.3)',   // Purple light
    'rgba(79, 70, 229, 0.35)',   // Indigo deep
    'rgba(124, 58, 237, 0.3)',   // Violet deep
    'rgba(37, 99, 235, 0.35)',   // Blue deep
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 400 + 200,
    color: colors[i % colors.length],
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));
};

export const AnimatedBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const orbs = useRef(generateOrbs(6)).current;

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Animated orbs */}
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [0, 100, -50, 80, 0],
            y: [0, -80, 60, -40, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Noise overlay for texture */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />

      {/* Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
};

// Simplified version for sections
export const GradientSection: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Static gradient orbs for performance */}
      <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute -bottom-1/2 -right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500/15 blur-3xl" />
      
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AnimatedBackground;
