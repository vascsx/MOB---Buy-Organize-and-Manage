/**
 * useToast Hook
 * Hook simples para exibir toasts usando a biblioteca sonner
 */

import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export const useToast = () => {
  const toast = {
    success: (message: string, options?: ToastOptions) => {
      sonnerToast.success(options?.title || message, {
        description: options?.description,
        duration: options?.duration || 3000,
      });
    },

    error: (message: string, options?: ToastOptions) => {
      sonnerToast.error(options?.title || message, {
        description: options?.description,
        duration: options?.duration || 5000,
      });
    },

    info: (message: string, options?: ToastOptions) => {
      sonnerToast.info(options?.title || message, {
        description: options?.description,
        duration: options?.duration || 3000,
      });
    },

    warning: (message: string, options?: ToastOptions) => {
      sonnerToast.warning(options?.title || message, {
        description: options?.description,
        duration: options?.duration || 4000,
      });
    },
  };

  return { toast };
};
