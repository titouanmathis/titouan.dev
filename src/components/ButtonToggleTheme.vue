<script setup lang="ts">
  import { useDark, useToggle } from '@vueuse/core';

  const isDark = useDark();
  const toggleDark = useToggle(isDark);
</script>

<template>
  <button aria-label="Toggle theme" @click="toggleDark()">
    <IconBxBxMoon v-if="isDark" />
    <IconBxBxSun v-else />
  </button>
</template>
