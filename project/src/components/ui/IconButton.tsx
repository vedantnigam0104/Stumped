import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: string;
  children: ReactNode;
};

export default function IconButton({ label, children, className = '', type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={`grid h-9 w-9 place-items-center rounded-btn text-muted transition-colors duration-200 hover:bg-elevated hover:text-ink active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
