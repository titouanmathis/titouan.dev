import { join } from 'node:path';
import sharp from 'sharp';
import { visit } from 'unist-util-visit';
import type { Element, Root } from 'hast';

/**
 * Set `width` and `height` on images served from `public/`, so the browser
 * reserves their space before they load. Without them, a lazy-loaded image
 * pushes the content down when it loads, for example during a smooth scroll
 * to a heading.
 */
export function rehypeImageSize() {
  return async (tree: Root) => {
    const images: Element[] = [];

    visit(tree, 'element', (node) => {
      const { src, width } = node.properties;
      if (
        node.tagName === 'img' &&
        typeof src === 'string' &&
        src.startsWith('/') &&
        !src.startsWith('//') &&
        width === undefined
      ) {
        images.push(node);
      }
    });

    await Promise.all(
      images.map(async (node) => {
        const { width, height } = await sharp(
          join('public', node.properties.src as string),
        ).metadata();
        node.properties.width = width;
        node.properties.height = height;
      }),
    );
  };
}
