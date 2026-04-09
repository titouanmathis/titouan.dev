import LegacyPlayground from './LegacyPlayground.astro';
import LegacyVideo from './LegacyVideo.astro';
import LegacyNumberGrid from './LegacyNumberGrid.astro';

export {
  LegacyPlayground as legacyPlayground,
  LegacyVideo as legacyVideo,
  LegacyNumberGrid as legacyNumberGrid,
};

export const blockComponents = {
  legacyPlayground: LegacyPlayground,
  legacyVideo: LegacyVideo,
  legacyNumberGrid: LegacyNumberGrid,
} as const;
