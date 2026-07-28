import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

/**
 * Build-time Open Graph card renderer.
 *
 * Rendered from the `ssg.onSiteRendered` hook in `iles.config.ts`, one card per
 * page: satori lays out the 1200×630 design as an SVG (glyphs baked to paths, so
 * no font install is needed at raster time), resvg rasterises it at 1.5× for
 * crisp text (1800×945), and sharp encodes a JPEG (universally supported by
 * social unfurlers, unlike SVG/WebP). Fonts are the site's own Inter and
 * JetBrains Mono, read from their `@fontsource` packages. satori, resvg and
 * sharp are imported lazily so they only load during a build, never when the
 * Vite/îles config is merely evaluated.
 */

const require = createRequire(import.meta.url);

let fontsCache: Array<{ name: string; weight: 400 | 700; style: 'normal'; data: Buffer }> | null =
  null;

function fonts() {
  if (fontsCache) return fontsCache;
  const file = (pkg: string, name: string) =>
    readFileSync(join(dirname(require.resolve(`${pkg}/package.json`)), 'files', name));
  fontsCache = [
    {
      name: 'Inter',
      weight: 400,
      style: 'normal',
      data: file('@fontsource/inter', 'inter-latin-400-normal.woff'),
    },
    {
      name: 'Inter',
      weight: 700,
      style: 'normal',
      data: file('@fontsource/inter', 'inter-latin-700-normal.woff'),
    },
    {
      name: 'JetBrains Mono',
      weight: 400,
      style: 'normal',
      data: file('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'),
    },
  ];
  return fontsCache;
}

// Minimal satori element helper (no JSX needed in the config toolchain).
const el = (style: Record<string, unknown>, children: unknown) => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
});

// The site favicon, rasterised once to a PNG data URI so satori can embed it.
let iconPromise: Promise<string> | null = null;
function iconDataUri(sharp: typeof import('sharp')): Promise<string> {
  if (!iconPromise) {
    iconPromise = (async () => {
      const svg = readFileSync(join(process.cwd(), 'public', 'icon.svg'));
      const png = await sharp(svg).resize(128).png().toBuffer();
      return `data:image/png;base64,${png.toString('base64')}`;
    })();
  }
  return iconPromise;
}

export async function renderOgImage(title: string, description: string): Promise<Buffer> {
  const [{ default: satori }, { Resvg }, { default: sharp }] = await Promise.all([
    import('satori'),
    import('@resvg/resvg-js'),
    import('sharp'),
  ]);

  const card = el(
    {
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 80,
      backgroundColor: '#f5f5f5',
      color: '#222222',
      fontFamily: 'Inter',
    },
    [
      {
        type: 'img',
        props: {
          src: await iconDataUri(sharp),
          width: 64,
          height: 64,
          style: { width: 64, height: 64 },
        },
      },
      el({ flexDirection: 'column', gap: 24 }, [
        el({ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }, title),
        ...(description
          ? [el({ fontSize: 30, color: '#555555', lineHeight: 1.35 }, description)]
          : []),
      ]),
    ],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svg = await satori(card as any, { width: 1200, height: 630, fonts: fonts() });
  // Rasterise at 1.5× the design width for crisp text on high-DPI displays.
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1800 } }).render().asPng();
  return sharp(png)
    .flatten({ background: '#f5f5f5' })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
}
