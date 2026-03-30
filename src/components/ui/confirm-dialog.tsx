'use client';

import { useState, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning';
  borderColor?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  onConfirm,
  borderColor,
}: ConfirmDialogProps) {
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);

  const handleFirstConfirm = () => {
    setShowSecondConfirm(true);
  };

  const handleSecondConfirm = () => {
    onConfirm();
    setShowSecondConfirm(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setShowSecondConfirm(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="bg-zinc-900 max-w-[calc(100%-2rem)] border p-0"
        showCloseButton={false}
        style={{ borderColor: borderColor || '#c93843' }}
      >
        <DialogTitle className="sr-only">{showSecondConfirm ? 'Вы уверены?' : title}</DialogTitle>
        <div className="flex flex-col">
          {showSecondConfirm ? (
            <>
              {/* Second confirmation */}
              <div className="pt-4" />
              <div className="text-white font-medium text-base text-center">Вы уверены?</div>
              
              <div className="pt-4" />
              <div className="flex flex-row px-4 pb-4">
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-zinc-700 text-zinc-300 border-0 hover:bg-zinc-700 hover:text-zinc-300 retro-large-text"
                >
                  Нет
                </Button>
                <div className="w-2" />
                <Button
                  onClick={handleSecondConfirm}
                  className="flex-1 text-primary-foreground border-0 retro-large-text"
                  style={{ backgroundColor: '#c93843' }}
                >
                  Да
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* First confirmation */}
              <div className="pt-4" />
              <div className="text-white font-medium text-base text-center">{title}</div>
              
              <div className="pt-4" />
              <div className="text-zinc-400 text-center px-4">{description}</div>
              
              <div className="pt-4" />
              <div className="flex flex-row px-4 pb-4">
                <Button
                  onClick={handleFirstConfirm}
                  className="flex-1 text-primary-foreground border-0 retro-large-text"
                  style={{ backgroundColor: '#c93843' }}
                >
                  {confirmText}
                </Button>
                <div className="w-2" />
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-zinc-700 text-zinc-300 border-0 hover:bg-zinc-700 hover:text-zinc-300 retro-large-text"
                >
                  {cancelText}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
