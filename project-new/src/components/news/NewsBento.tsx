import { ArrowUpRight, Newspaper } from 'lucide-react';
import type { NewsItem } from '@/types/cricket';
import { timeAgo } from '@/lib/format';

function Thumbnail({ className = '' }: { className?: string }) {
  return (
    <div className={`grid place-items-center bg-elevated text-muted ${className}`}>
      <Newspaper size={28} strokeWidth={1.5} aria-hidden="true" />
    </div>
  );
}

function FeaturedArticle({ article }: { article: NewsItem }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group grid overflow-hidden rounded-card border border-line bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 md:grid-cols-5"
    >
      <Thumbnail className="aspect-[16/10] md:col-span-2 md:aspect-auto" />
      <div className="flex flex-col gap-4 p-6 md:col-span-3 md:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-text">BBC Sport · Cricket</p>
        <h3 className="text-2xl font-semibold leading-[1.2] tracking-tight md:text-3xl">{article.title}</h3>
        <p className="mt-auto flex items-center gap-2 text-xs text-muted">
          {timeAgo(article.publishedAt)}
          <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </p>
      </div>
    </a>
  );
}

function CompactArticle({ article }: { article: NewsItem }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 rounded-card border border-line bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50"
    >
      <Thumbnail className="h-24 w-24 shrink-0 rounded-btn" />
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="font-semibold leading-[1.2]">{article.title}</h3>
        <p className="mt-auto flex items-center gap-2 text-xs text-muted">
          {timeAgo(article.publishedAt)}
          <ArrowUpRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </p>
      </div>
    </a>
  );
}

export default function NewsBento({ featured, stories }: { featured: NewsItem; stories: NewsItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <FeaturedArticle article={featured} />
      </div>
      {stories.map((story) => (
        <CompactArticle key={story.id} article={story} />
      ))}
    </div>
  );
}
