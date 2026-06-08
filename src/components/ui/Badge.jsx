import React from 'react';

const Badge = ({ children, variant = 'pending', className = '' }) => {
  const variants = {
    pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    completed: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    failed: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary-foreground border-secondary/20',
  };

  const variantStyles = variants[variant] || variants.pending;

  return (
    <span className={`
      px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
      inline-flex items-center gap-1.5
      ${variantStyles}
      ${className}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
      {children}
    </span>
  );
};

export default Badge;
