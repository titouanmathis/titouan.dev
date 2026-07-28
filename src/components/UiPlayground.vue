<script setup lang="ts">
  import { ref, unref, computed } from 'vue';
  import type { Ref } from 'vue';
  import { useDark } from '@vueuse/core';
  import { vElementVisibility } from '@vueuse/components';
  import { isFunction, isString } from '@studiometa/js-toolkit/utils';
  import { zip } from '@studiometa/playground/dist/lib/utils/zip.js';
  import Loader from './Loader.vue';
  import Preview from './Preview.vue';

  /**
   * UiPlayground
   *
   * Like PreviewPlayground, but targets the @studiometa/ui playground at
   * `ui.studiometa.dev/play/`. That deployment maps both `@studiometa/js-toolkit`
   * and `@studiometa/ui` in its import map, so demo scripts can import them
   * directly (bare specifiers) with no esm.sh workaround. It also injects a
   * default padding around the previewed content.
   */

  type CodeProp = string | (() => Promise<{ default: string }>);

  interface Props {
    script?: CodeProp;
    html?: CodeProp;
    css?: CodeProp;
    height?: string;
    zoom?: string | number;
    /** CSS padding applied to the preview `body`. */
    padding?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    height: 'auto',
    zoom: 1,
    padding: '1rem',
  });

  const isDark = useDark();

  /** Zip an HTML/JS code prop, tracking its loading state for lazy imports. */
  function useCode(codeProp?: CodeProp): [Ref<string>, Ref<boolean>] {
    const code = ref(zip(''));
    const codeIsLoading = ref(false);
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

  /** Resolve a CSS code prop to its raw string (so we can prepend the base style). */
  function useRawCode(codeProp?: CodeProp): [Ref<string>, Ref<boolean>] {
    const code = ref('');
    const codeIsLoading = ref(false);
    if (isFunction(codeProp)) {
      codeIsLoading.value = true;
      codeProp().then((mod) => {
        code.value = mod.default;
        codeIsLoading.value = false;
      });
    } else if (isString(codeProp)) {
      code.value = codeProp;
    }
    return [code, codeIsLoading];
  }

  const [script, scriptIsLoading] = useCode(props.script);
  const [html, htmlIsLoading] = useCode(props.html);
  const [cssRaw, cssIsLoading] = useRawCode(props.css);

  /** Default padding + dark-mode background, then the demo's own CSS on top. */
  const style = computed(
    () =>
      `html.dark { background-color: #222; color: #eee; }\n` +
      `body { padding: ${props.padding}; }\n` +
      `${unref(cssRaw)}`,
  );

  const src = computed(() => {
    if (unref(scriptIsLoading) || unref(htmlIsLoading) || unref(cssIsLoading)) {
      return '';
    }

    const searchParams = new URLSearchParams();
    searchParams.set('html', html.value);
    searchParams.set('script', script.value);
    searchParams.set('style', zip(unref(style)));
    searchParams.set('theme', unref(isDark) ? 'dark' : 'light');
    searchParams.set('embed', 'true');

    const url = new URL('https://ui.studiometa.dev/play/');
    url.hash = searchParams.toString();

    return url.toString();
  });

  const isLoading = ref(true);
  const isLoaded = ref(false);
  const isVisible = ref(false);
  const iframe = ref();
  const scale = ref(Number(props.zoom));
  const iframeKey = computed(() => script.value + html.value);

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
