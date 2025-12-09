import React from 'react';
import { cn } from '../../glass';

// Table Container
export interface GlassTableProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassTable: React.FC<GlassTableProps> = ({ children, className = '' }) => (
  <div className={cn(
    'glass-card-default',
    'rounded-2xl overflow-hidden',
    className
  )}>
    <div className="overflow-x-auto">
      <table className="w-full">
        {children}
      </table>
    </div>
  </div>
);

// Table Header
export const GlassTableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <thead className={cn(
    'glass-table-header',
    className
  )}>
    {children}
  </thead>
);

// Table Body
export const GlassTableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <tbody className={cn('divide-y divide-white/[0.06]', className)}>
    {children}
  </tbody>
);

// Table Row
export interface GlassTableRowProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  delay?: number;
}

export const GlassTableRow: React.FC<GlassTableRowProps> = ({
  children,
  className = '',
  hover = true,
  onClick,
  delay: _delay = 0,
}) => (
  <tr
    onClick={onClick}
    className={cn(
      'transition-colors duration-200',
      hover && 'hover:bg-white/[0.04] cursor-pointer',
      onClick && 'cursor-pointer',
      className
    )}
  >
    {children}
  </tr>
);

// Table Head Cell
export const GlassTableHead: React.FC<{
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}> = ({ children, className = '', align = 'left' }) => (
  <th className={cn(
    'px-4 py-3',
    'text-xs font-semibold uppercase tracking-wider',
    'text-white/50',
    align === 'left' && 'text-left',
    align === 'center' && 'text-center',
    align === 'right' && 'text-right',
    className
  )}>
    {children}
  </th>
);

// Table Cell
export const GlassTableCell: React.FC<{
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}> = ({ children, className = '', align = 'left' }) => (
  <td className={cn(
    'px-4 py-3',
    'text-sm text-white/80',
    align === 'left' && 'text-left',
    align === 'center' && 'text-center',
    align === 'right' && 'text-right',
    className
  )}>
    {children}
  </td>
);

// Empty State for Tables
export const GlassTableEmpty: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <tr>
    <td colSpan={100} className="py-12">
      <div className="text-center">
        {icon && (
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.05] flex items-center justify-center">
            <span className="text-white/30">{icon}</span>
          </div>
        )}
        <p className="text-white/60 text-lg">{title}</p>
        {description && (
          <p className="text-white/40 text-sm mt-1">{description}</p>
        )}
        {action && (
          <div className="mt-4">{action}</div>
        )}
      </div>
    </td>
  </tr>
);

export default GlassTable;
