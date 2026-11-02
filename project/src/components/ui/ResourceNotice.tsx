import { Loader2, AlertTriangle, Inbox } from 'lucide-react';
import Button from '@/components/ui/Button';

type ResourceNoticeProps =
  | { tone: 'loading'; title: string; detail?: string }
  | { tone: 'empty'; title: string; detail?: string }
  | { tone: 'error'; title: string; detail?: string; onRetry?: () => void };

const icons = { loading: Loader2, empty: Inbox, error: AlertTriangle } as const;

export default function ResourceNotice(props: ResourceNoticeProps) {
  const Icon = icons[props.tone];
  const retry = props.tone === 'error' ? props.onRetry : undefined;

  return (
    <div
      role={props.tone === 'error' ? 'alert' : 'status'}
      className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface p-8 text-center"
    >
      <Icon size={20} className={props.tone === 'loading' ? 'animate-spin text-muted' : 'text-muted'} aria-hidden="true" />
      <p className="font-semibold">{props.title}</p>
      {props.detail && <p className="max-w-sm text-sm text-muted">{props.detail}</p>}
      {retry && (
        <Button variant="outline" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}
