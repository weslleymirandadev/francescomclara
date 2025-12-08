'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      toastOptions={{
        className: '!bg-background !text-foreground border !rounded-lg',
        duration: 3000,
        success: {
          className: '!bg-green-50 !text-green-700 border-green-200',
          iconTheme: {
            primary: '#10b981',
            secondary: 'white',
          },
        },
        error: {
          className: '!bg-red-50 !text-red-700 border-red-200',
          iconTheme: {
            primary: '#ef4444',
            secondary: 'white',
          },
        },
      }}
    />
  );
}
