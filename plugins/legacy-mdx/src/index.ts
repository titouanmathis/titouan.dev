import { definePlugin } from 'emdash';

const portableTextBlocks = [
  {
    type: 'legacyPlayground',
    label: 'Legacy Playground',
    icon: 'code',
    description: 'Legacy interactive demo with HTML, CSS and JS source.',
    placeholder: 'Demo title or URL',
    fields: [
      { type: 'text_input', action_id: 'title', label: 'Title' },
      { type: 'text_input', action_id: 'note', label: 'Editor note', multiline: true },
      { type: 'text_input', action_id: 'html', label: 'HTML', multiline: true },
      { type: 'text_input', action_id: 'css', label: 'CSS', multiline: true },
      { type: 'text_input', action_id: 'js', label: 'JavaScript', multiline: true },
    ],
  },
  {
    type: 'legacyVideo',
    label: 'Legacy Video Pair',
    icon: 'video',
    description: 'Legacy light/dark video sources with optional caption.',
    placeholder: 'Video source URL',
    fields: [
      { type: 'text_input', action_id: 'title', label: 'Title' },
      { type: 'text_input', action_id: 'lightSrc', label: 'Light video URL' },
      { type: 'text_input', action_id: 'darkSrc', label: 'Dark video URL' },
      { type: 'text_input', action_id: 'caption', label: 'Caption', multiline: true },
    ],
  },
  {
    type: 'legacyNumberGrid',
    label: 'Legacy Number Grid',
    icon: 'code',
    description: 'Three-column numeric demo content from the previous MDX site.',
    placeholder: 'Numbers',
    fields: [
      { type: 'text_input', action_id: 'title', label: 'Title' },
      { type: 'text_input', action_id: 'columns', label: 'Columns JSON', multiline: true },
      { type: 'text_input', action_id: 'note', label: 'Note', multiline: true },
    ],
  },
];

export function legacyMdxPlugin() {
  return {
    id: 'legacy-mdx',
    version: '0.1.0',
    entrypoint: 'legacy-mdx-plugin',
    format: 'native',
    componentsEntry: 'legacy-mdx-plugin/astro',
  };
}

export function createPlugin() {
  return definePlugin({
    id: 'legacy-mdx',
    version: '0.1.0',
    capabilities: [],
    admin: {
      portableTextBlocks,
    },
  });
}

export default legacyMdxPlugin;
