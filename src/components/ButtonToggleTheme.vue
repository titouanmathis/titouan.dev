<script setup lang="ts">
  import { useDark, useToggle } from '@vueuse/core';

  const isDark = useDark();
  const toggleDark = useToggle(isDark);

  function onClick() {
    console.log('toggle dark');
    toggleDark();
  }
</script>

<template>
  <button
    @click="onClick"
    class="w-5 h-5"
    type="button"
    aria-label="Toggle theme">
    <Transition
      enter-from-class="opacity-0 translate-y-full"
      leave-to-class="opacity-0 -translate-y-full">
      <IconBxBxMoon
        v-if="!isDark"
        class="absolute top-0 left-0 block transition duration-500 ease-out-expo" />
      <IconBxBxSun
        v-else
        class="absolute top-0 left-0 block transition duration-500 ease-out-expo" />
    </Transition>
    <span class="sr-only">Switch between dark or light theme</span>
  </button>
</template>
