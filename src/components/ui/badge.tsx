import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'violet' | 'green' | 'default' | 'danger';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      cyan: 'bg-duck-cyan/10 text-duck-cyan border-duck-cyan/20',
      violet: 'bg-duck-violet/10 text-duck-violet border-duck-violet/20',
      green: 'bg-duck-green/10 text-duck-green border-duck-green/20',
      default: 'bg-duck-surface text-duck-text-secondary border-duck-border',
      danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const sizes = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-xs px-2.5 py-1',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border font-medium',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
