'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-duck transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-duck-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-duck-bg disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-duck-cyan text-white hover:bg-duck-cyan-light active:bg-duck-cyan-dark shadow-lg shadow-duck-cyan/20',
      secondary: 'bg-duck-violet text-white hover:bg-duck-violet-light active:bg-duck-violet-dark shadow-lg shadow-duck-violet/20',
      ghost: 'text-duck-text-secondary hover:text-duck-text hover:bg-duck-surface-hover',
      danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
      outline: 'border border-duck-border text-duck-text-secondary hover:text-duck-text hover:border-duck-border-hover hover:bg-duck-surface',
    };

    const sizes = {
      sm: 'text-sm px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
