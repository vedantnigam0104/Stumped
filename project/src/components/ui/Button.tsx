import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'outline' | 'ghost';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent/90',
  outline: 'border border-line text-ink hover:border-accent hover:text-accent-text',
  ghost: 'text-muted hover:bg-elevated hover:text-ink',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export default function Button({ variant = 'outline', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-btn px-4 py-2 text-sm font-medium transition-colors duration-200 active:scale-[0.98] disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
