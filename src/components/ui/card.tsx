import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glow-cyan' | 'glow-violet' | 'glow-green';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const baseStyles = 'rounded-duck-lg border transition-all duration-300';
    
    const variants = {
      default: 'bg-duck-bg-card border-duck-border',
      glass: 'glass',
      'glow-cyan': 'bg-duck-bg-card border-duck-border glow-cyan',
      'glow-violet': 'bg-duck-bg-card border-duck-border glow-violet',
      'glow-green': 'bg-duck-bg-card border-duck-border glow-green',
    };

    const hoverStyles = hover
      ? 'hover:border-duck-border-hover hover:bg-duck-bg-elevated cursor-pointer hover:scale-[1.01] hover:shadow-lg'
      : '';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], hoverStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4 border-b border-duck-border', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4 border-t border-duck-border', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
