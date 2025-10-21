<script setup lang="ts">
  import { computed } from 'vue';
  const props = defineProps<{ href: string }>();

  const attr = computed(() =>
    props.href.startsWith('https://')
      ? {
          href: props.href,
          target: '_blank',
          rel: 'noopener',
        }
      : {
          href: props.href,
        },
  );
</script>
<template>
  <a v-bind="attr">
    <slot />
  </a>
</template>
