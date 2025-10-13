<script setup lang="ts">
  import { watch } from 'vue';
  import { useDark, useToggle } from '@vueuse/core';

  const isDark = useDark();
  const toggleDark = useToggle(isDark);

  watch(isDark, (value) => {
    const theme = value ? 'dark' : 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.querySelectorAll<HTMLLinkElement>('link[data-theme-switch]').forEach((link) => {
      if (link.dataset[theme] && link.href !== link.dataset[theme]) {
        link.href = link.dataset[theme];
      }
    });
  });
</script>

<template>
  <button
    @click="() => toggleDark()"
    class="flex items-center justify-center w-8 h-8 rounded-full"
    type="button"
    aria-label="Toggle theme">
    <Transition
      enter-from-class="opacity-0 scale-50 -translate-y-full"
      leave-to-class="opacity-0 scale-50 translate-y-full">
      <svg v-if="!isDark" class="absolute block transition duration-500 ease-out-expo w-6 h-6" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 11.807A9.002 9.002 0 0 1 10.049 2a9.942 9.942 0 0 0-5.12 2.735c-3.905 3.905-3.905 10.237 0 14.142c3.906 3.906 10.237 3.905 14.143 0a9.946 9.946 0 0 0 2.735-5.119A9.003 9.003 0 0 1 12 11.807z"/>
      </svg>
      <svg v-else class="absolute block transition duration-500 ease-out-expo w-6 h-6" viewBox="0 0 24 24">
        <path fill="currentColor" d="M6.995 12c0 2.761 2.246 5.007 5.007 5.007s5.007-2.246 5.007-5.007s-2.246-5.007-5.007-5.007S6.995 9.239 6.995 12M11 19h2v3h-2zm0-17h2v3h-2zm-9 9h3v2H2zm17 0h3v2h-3zM5.637 19.778l-1.414-1.414l2.121-2.121l1.414 1.414zM16.242 6.344l2.122-2.122l1.414 1.414l-2.122 2.122zM6.344 7.759L4.223 5.637l1.415-1.414l2.12 2.122zm13.434 10.605l-1.414 1.414l-2.122-2.122l1.414-1.414z"/>
      </svg>
    </Transition>
    <span class="sr-only">Switch between dark or light theme</span>
  </button>
</template>
