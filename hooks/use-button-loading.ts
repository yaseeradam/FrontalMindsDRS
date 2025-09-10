"use client";

import { useLoading } from '@/contexts/loading-context';

export function useButtonLoading() {
  const { isLoading, showLoading, hideLoading } = useLoading();

  const handleButtonClick = (
    onClick?: () => void | Promise<void>,
    duration = 1500
  ) => {
    return async () => {
      showLoading(duration);
      if (onClick) {
        try {
          const result = onClick();
          if (result instanceof Promise) {
            await result;
          }
        } catch (error) {
          console.error('Button click handler error:', error);
        } finally {
          // If it's an async operation, we might want to hide loading manually
          // The duration timeout will also hide it as backup
        }
      }
    };
  };

  const withLoading = (
    fn: () => void | Promise<void>,
    duration = 1500
  ) => {
    return handleButtonClick(fn, duration);
  };

  return {
    isLoading,
    showLoading,
    hideLoading,
    withLoading,
    handleButtonClick,
  };
}
