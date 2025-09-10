"use client";

import React, { forwardRef } from 'react';
import { Button, ButtonProps } from './button';
import { useLoading } from '@/contexts/loading-context';
import { Loader2 } from 'lucide-react';

export interface LoadingButtonProps extends ButtonProps {
  loadingDuration?: number;
  showLoadingSpinner?: boolean;
  loadingText?: string;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    children, 
    onClick, 
    disabled, 
    loadingDuration = 1500,
    showLoadingSpinner = true,
    loadingText,
    ...props 
  }, ref) => {
    const { isLoading, showLoading } = useLoading();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (showLoadingSpinner) {
        showLoading(loadingDuration);
      }
      if (onClick) {
        onClick(event);
      }
    };

    return (
      <Button
        ref={ref}
        {...props}
        disabled={disabled || isLoading}
        onClick={handleClick}
      >
        {isLoading && showLoadingSpinner ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || "Loading..."}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";
