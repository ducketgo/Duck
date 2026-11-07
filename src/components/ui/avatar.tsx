'use client';

import { useState, type ImgHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  isOfficial?: boolean;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, fallback = '?', size = 'md', isOnline, isOfficial, alt = 'Avatar', ...props }, ref) => {
    const [hasError, setHasError] = useState(false);

    const sizes = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-sm',
      lg: 'h-14 w-14 text-lg',
      xl: 'h-20 w-20 text-xl',
    };

    const statusSizes = {
      xs: 'h-2 w-2',
      sm: 'h-2.5 w-2.5',
      md: 'h-3 w-3',
      lg: 'h-3.5 w-3.5',
      xl: 'h-4 w-4',
    };

    const initials = fallback.slice(0, 2).toUpperCase();

    return (
      <div ref={ref} className={cn('relative inline-flex shrink-0', className)}>
        <div className={cn(
          'rounded-full overflow-hidden flex items-center justify-center bg-duck-bg-elevated border border-duck-border',
          sizes[size]
        )}>
          {src && !hasError ? (
            // Intentionally use a native image: user avatar hosts are not restricted to Next Image domains.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover"
              onError={() => setHasError(true)}
              {...props}
            />
          ) : (
            <span className="font-medium text-duck-text-secondary select-none">
              {initials}
            </span>
          )}
        </div>
        {isOnline !== undefined && (
          <span className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-duck-bg',
            statusSizes[size],
            isOnline ? 'bg-duck-green' : 'bg-duck-text-muted'
          )} />
        )}
        {isOfficial && (
          <span className={cn(
            'absolute -top-0.5 -right-0.5 rounded-full bg-duck-cyan flex items-center justify-center',
            size === 'xs' || size === 'sm' ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'
          )}>
            <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
