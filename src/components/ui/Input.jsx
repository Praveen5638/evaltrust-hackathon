import React from 'react';

const Input = ({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  id,
  name,
  required = false,
  disabled = false,
  error = '',
  className = '',
  icon: Icon,
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-semibold text-foreground/80 ml-1"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          name={name}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
            bg-background text-foreground placeholder:text-muted-foreground/50
            focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary
            disabled:opacity-50 disabled:bg-muted/50 disabled:cursor-not-allowed
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-destructive focus:border-destructive focus:ring-destructive/10' : 'border-border hover:border-muted-foreground/30'}
          `}
        />
      </div>
      
      {error && (
        <p className="text-xs font-medium text-destructive ml-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default Input;