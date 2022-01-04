import { defineApp } from 'iles'

import checkTheme from '~/utils/check-theme?raw';

export default defineApp({
  head: {
    script: [
      { children: checkTheme, once: true },
    ]
  }
})
