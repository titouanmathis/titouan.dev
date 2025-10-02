<script setup lang="ts">
  import { watch } from 'vue';
  import { useDark, useToggle } from '@vueuse/core';

  const isDark = useDark();
  const toggleDark = useToggle(isDark);

  watch(isDark, (value) => {
    const theme = value ? 'dark' : 'light';
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
      <IconBxBxMoon v-if="!isDark" class="absolute block transition duration-500 ease-out-expo" />
      <IconBxBxSun v-else class="absolute block transition duration-500 ease-out-expo" />
    </Transition>
    <span class="sr-only">Switch between dark or light theme</span>
  </button>
</template>
