import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, rounded } from '../../glass';

// Animation variants for sidebar entrance
const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Animation variants for sidebar items
export const sidebarItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  },
};

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassSidebar: React.FC<SidebarProps> = ({ children, className = '' }) => {
  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'w-64 h-screen flex flex-col overflow-hidden',
        'glass-sidebar',
        className
      )}
    >
      {children}
    </motion.aside>
  );
};

// Sidebar Header
export const GlassSidebarHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    variants={sidebarItemVariants}
    className={cn(
      'p-5 border-b glass-separator',
      className
    )}
  >
    {children}
  </motion.div>
);

// Sidebar Content (scrollable area)
export const GlassSidebarContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    variants={sidebarItemVariants}
    className={cn(
      'flex-1 overflow-y-auto overflow-x-hidden p-4',
      'scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent',
      className
    )}
  >
    {children}
  </motion.div>
);

// Sidebar Footer
export const GlassSidebarFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    variants={sidebarItemVariants}
    className={cn(
      'p-4 border-t glass-separator',
      className
    )}
  >
    {children}
  </motion.div>
);

// Sidebar Group
export const GlassSidebarGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={cn('mb-6', className)}>
    {children}
  </div>
);

// Sidebar Group Label
export const GlassSidebarGroupLabel: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <h3 className={cn(
    'px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-white/40',
    className
  )}>
    {children}
  </h3>
);

// Sidebar Item
export interface SidebarItemProps {
  children: React.ReactNode;
  active?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const GlassSidebarItem: React.FC<SidebarItemProps> = ({
  children,
  active = false,
  icon,
  onClick,
  className = '',
}) => (
  <motion.button
    whileHover={{ x: 2 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.05 }}
    onClick={onClick}
    className={cn(
      'w-full flex items-center gap-3 px-3 py-2.5',
      rounded.md,
      'text-sm',
      'transition-all duration-200',
      active
        ? 'glass-sidebar-item-active'
        : 'text-white/70 hover:glass-sidebar-item-hover border border-transparent',
      className
    )}
  >
    {icon && (
      <span className={cn(
        'w-5 h-5',
        active ? 'text-purple-300' : 'text-white/50'
      )}>
        {icon}
      </span>
    )}
    {children}
  </motion.button>
);

// Sidebar NavLink (for React Router)
export interface SidebarNavLinkProps {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: number;
  className?: string;
}

export const GlassSidebarNavLink: React.FC<SidebarNavLinkProps> = ({
  to,
  children,
  icon,
  badge,
  className = '',
}) => (
  <NavLink to={to} className="block">
    {({ isActive }) => (
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
          'text-sm',
          'transition-all duration-200',
          isActive
            ? 'glass-sidebar-item-active'
            : 'text-white/70 border border-transparent hover:text-white hover:bg-gradient-to-r hover:from-white/[0.08] hover:to-white/[0.04] hover:border-white/[0.12]',
          className
        )}
      >
        {icon && (
          <span className={cn(
            'w-5 h-5 flex items-center justify-center',
            isActive ? 'text-purple-300' : 'text-white/50'
          )}>
            {icon}
          </span>
        )}
        <span className="flex-1">{children}</span>
        {badge !== undefined && badge > 0 && (
          <span className="sidebar-badge">{badge}</span>
        )}
      </motion.div>
    )}
  </NavLink>
);

// User Profile Section
export interface SidebarUserProps {
  name: string;
  role?: string;
  avatar?: string;
  className?: string;
}

export const GlassSidebarUser: React.FC<SidebarUserProps> = ({
  name,
  role,
  avatar,
  className = '',
}) => (
  <div className={cn('flex items-center gap-3', className)}>
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-400/20 border border-white/[0.1] flex items-center justify-center">
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full rounded-xl object-cover" />
      ) : (
        <span className="text-sm font-semibold text-white">
          {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </span>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white truncate">{name}</p>
      {role && (
        <p className="text-xs text-white/50 capitalize">{role}</p>
      )}
    </div>
  </div>
);

export default GlassSidebar;
