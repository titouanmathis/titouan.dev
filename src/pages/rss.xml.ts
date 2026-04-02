import type { APIRoute } from 'astro';
import { getEmDashCollection } from 'emdash';

const siteTitle = 'Titouan Mathis';
const siteDescription = 'Articles and notes by Titouan Mathis.';

export const GET: APIRoute = async ({ url }) => {
  const siteUrl = url.origin;

  const { entries: articles } = await getEmDashCollection('articles', {
    orderBy: { published_at: 'desc' },
    limit: 20,
  });

  const { entries: notes } = await getEmDashCollection('notes', {
    orderBy: { published_at: 'desc' },
    limit: 20,
  });

  const allItems = [
    ...articles.map((a) => ({
      title: a.data.title,
      url: `${siteUrl}/articles/${a.id}`,
      date: a.data.publishedAt,
      description: a.data.description || '',
    })),
    ...notes.map((n) => ({
      title: n.data.title,
      url: `${siteUrl}/notes/${n.id}`,
      date: n.data.publishedAt,
      description: n.data.description || '',
    })),
  ]
    .filter((item) => item.date)
    .sort((a, b) => (b.date!.getTime() - a.date!.getTime()));

  const items = allItems
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <pubDate>${item.date!.toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`
    )
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <description>${escapeXml(siteDescription)}</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
