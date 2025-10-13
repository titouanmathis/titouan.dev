import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles');
  const notes = await getCollection('notes');

  const posts = [...articles, ...notes]
    .sort((a, b) => a.id.localeCompare(b.id))
    .reverse();

  return rss({
    title: 'Titouan Mathis · Developer & CTO at Studio Meta & Ikko',
    description:
      'Notes and experiments by Titouan Mathis, developer & CTO at Studio Meta between Paris, Strasbourg and Copenhagen.',
    site: context.site!,
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description || '',
      link: `/${post.collection}/${post.slug}/`,
      pubDate: post.data.date,
    })),
    customData: `<language>en</language>`,
  });
}
