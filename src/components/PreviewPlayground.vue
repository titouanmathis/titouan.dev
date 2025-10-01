<script setup lang="ts">
  import { ref, unref, computed, watch } from 'vue';
  import type { Ref } from 'vue';
  import { useDark } from '@vueuse/core';
  import { vElementVisibility } from '@vueuse/components';
  import { isFunction, isString } from '@studiometa/js-toolkit/utils';
  import { zip } from '@studiometa/playground/dist/lib/utils/zip.js';
  import Loader from './Loader.vue';
  import Preview from './Preview.vue';

  type CodeProp = string | (() => Promise<{ default: string }>);

  interface Props {
    script?: CodeProp;
    html?: CodeProp;
    css?: CodeProp;
    height?: string;
    zoom?: string | number;
  }

  const props = withDefaults(defineProps<Props>(), {
    height: 'auto',
    zoom: 1,
  });

  const isDark = useDark();
  const defaultContent = zip('');

  function useCode(codeProp?: CodeProp): [Ref<string>, Ref<boolean>] {
    const code = ref(defaultContent);
    let codeIsLoading = ref(false);
    if (isFunction(codeProp)) {
      codeIsLoading.value = true;
      codeProp().then((mod) => {
        code.value = zip(mod.default);
        codeIsLoading.value = false;
      });
    } else if (isString(codeProp)) {
      code.value = zip(codeProp);
    }

    return [code, codeIsLoading];
  }

  const [script, scriptIsLoading] = useCode(props.script);
  const [html, htmlIsLoading] = useCode(props.html);
  const [css, cssIsLoading] = useCode(props.css);

  const src = computed(() => {
    if (unref(scriptIsLoading) || unref(htmlIsLoading) || unref(cssIsLoading)) {
      return '';
    }

    const searchParams = new URLSearchParams();

    searchParams.set('html', html.value);
    searchParams.set('script', script.value);
    if (css.value !== defaultContent) {
      searchParams.set('style', css.value);
    }

    searchParams.set('html-editor', 'false');
    searchParams.set('script-editor', 'false');
    searchParams.set('style-editor', 'false');
    searchParams.set('theme', unref(isDark) ? 'dark' : 'light');
    searchParams.set('header', 'hidden');

    const url = new URL('https://feature-ui.studiometa-playground.pages.dev/');
    url.hash = searchParams.toString();

    return url.toString();
  });

  const isLoading = ref(true);
  const isLoaded = ref(false);
  const isVisible = ref(false);
  const iframe = ref();
  const scale = ref(Number(props.zoom));
  const iframeKey = computed(() => script.value + html.value + isDark.value);

  const shouldDisplayIframe = computed(() => {
    if (isLoaded) return true;
    if (isVisible) return true;
    return false;
  });

  function onLoad() {
    isLoading.value = false;
    isLoaded.value = true;
  }

  function onElementVisibility(state: boolean) {
    isVisible.value = state;
  }
</script>

<template>
  <Preview v-element-visibility="onElementVisibility" :style="{ height }">
    <Loader v-if="isLoading" />
    <iframe
      v-if="shouldDisplayIframe"
      ref="iframe"
      :key="iframeKey"
      @load="onLoad"
      class="block border-0 transform origin-top-left duration-300"
      :class="{ 'opacity-0': isLoading }"
      :src="src"
      width="100%"
      :style="{
        '--scale': scale,
        '--tw-scale-x': 'var(--scale)',
        '--tw-scale-y': 'var(--scale)',
        width: `calc(1 / var(--scale) * 100%)`,
        height: `calc(1 / var(--scale) * ${height})`,
      }" />
  </Preview>
</template>
