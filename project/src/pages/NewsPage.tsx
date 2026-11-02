import { useNews } from '@/lib/cricketQueries';
import NewsBento from '@/components/news/NewsBento';
import ResourceNotice from '@/components/ui/ResourceNotice';
import SectionHeader from '@/components/ui/SectionHeader';

export default function NewsPage() {
  const news = useNews();

  if (news.loading) return <ResourceNotice tone="loading" title="Loading news" />;
  if (news.error) return <ResourceNotice tone="error" title="News is unavailable" detail={news.error} onRetry={news.retry} />;
  if (!news.data) return null;
  if (news.data.length === 0) return <ResourceNotice tone="empty" title="No stories right now" />;

  const [featured, ...stories] = news.data;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Latest from the field" />
      <NewsBento featured={featured} stories={stories} />
    </div>
  );
}
