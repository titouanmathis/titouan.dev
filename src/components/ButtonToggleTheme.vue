<script setup lang="ts">
  import { useDark, useToggle } from '@vueuse/core';

  const isDark = useDark();
  const toggleDark = useToggle(isDark);
</script>

<template>
  <button aria-label="Toggle theme" @click="toggleDark()">
    <transition
      enter-from-class="transform -translate-y-full opacity-0"
      enter-active-class="transition duration-500 ease-out-expo"
      leave-to-class="transform translate-y-full opacity-0"
      leave-active-class="absolute transition duration-500 ease-out-expo">
      <IconBxBxMoon v-if="isDark" />
      <IconBxBxSun v-else />
    </transition>
  </button>
</template>
