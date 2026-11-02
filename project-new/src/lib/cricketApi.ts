import { getMatches, getNews, getPlayer, getScorecard } from '@/lib/cricketProvider';

const ID_PATTERN = /^[A-Za-z0-9-]{1,80}$/;

function requireId(params: Record<string, string>): string {
  const id = params.id ?? '';
  if (!ID_PATTERN.test(id)) throw new Error('Invalid id.');
  return id;
}

export async function fetchCricket<T>(
  resource: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  let result: unknown;
  switch (resource) {
    case 'matches':
      result = await getMatches();
      break;
    case 'news':
      result = await getNews();
      break;
    case 'scorecard':
      result = await getScorecard(requireId(params));
      break;
    case 'player':
      result = await getPlayer(requireId(params));
      break;
    default:
      throw new Error('Unknown resource.');
  }
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  return result as T;
}
