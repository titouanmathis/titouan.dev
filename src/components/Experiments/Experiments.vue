<script setup lang="ts">
  import { computed, unref } from 'vue';
  import { useUrlSearchParams } from '@vueuse/core';
  import Experiments001 from './Experiments001/Experiments001.vue';
  import Experiments002 from './Experiments002/Experiments002.vue';
  import Experiments003 from './Experiments003/Experiments003.vue';

  const params = useUrlSearchParams < { id: '001' | '002' | '003' } > ('hash-params');

  const components = {
    '001': Experiments001,
    '002': Experiments002,
    '003': Experiments003,
  }

  if (!params.id) {
    params.id = '001';
  }

  const activeName = computed(() => unref(params).id ?? '001');
</script>

<template>
  <component
    :is="component"
    v-for="(component, name) in components"
    :key="name"
    :active="activeName === name" />
</template>
