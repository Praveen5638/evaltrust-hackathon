import React from 'react';

const Card = ({ children, className = '', hover = true }) => {
  return (
    <div className={`
      bg-card text-card-foreground rounded-2xl border border-border p-6 
      transition-all duration-300 shadow-sm
      ${hover ? 'hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;