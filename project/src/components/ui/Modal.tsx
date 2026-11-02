import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import IconButton from '@/components/ui/IconButton';

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-score-in flex max-h-[90vh] w-full max-w-3xl flex-col rounded-t-card border border-line bg-surface sm:rounded-card motion-reduce:animate-none"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold leading-[1.2]">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </header>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
