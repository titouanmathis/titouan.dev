<template>
  <transition appear @enter="enter" @leave="leave">
    <div>
      <div class="xp3 w100p h100p">
        <div
          class="xp3__inner js-xp3__inner center"
          :style="`width: ${size}px; height: ${size}px;`">
          <div v-for="current in total" class="posa t50p l50p xp3__anchor js-xp3__anchor">
            <div class="posa t50p l50p xp3__rect js-xp3__rect" />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
  import { computed, ref, unref } from 'vue';
  import { usePointer, useMousePressed, useWindowSize, useRafFn } from '@vueuse/core';
  import { degToRad } from '~/utils/math.js';

  const isDestroyed = true;
  const total = 120;
  const delta = total / 2;
  const duration = total / 30;
  const anchors = Array.from(new Array(total)).map((value, index) => {
    // @todo Define each states
    // - enterFrom
    // - pointerXFrom
    // - pointerXTo
    // - pointerYFrom
    // - pointerYTo
    // - leaveTo
    const angle = degToRad((360 / (total - delta - 1)) * (index - delta / 2));
    const x = (unref(size) / 2) * Math.cos(angle);
    const y = (unref(size) / 2) * Math.sin(angle);
    const zIndex = total - index;
    const animationDelay = `${index * (duration / 100) * -1}s`;
    const animationDuration = `${duration}s`;

    const delay = index / 30;

    return {
      enterFrom: {
        zIndex,
        opacity: 0,
        scaleX: 0,
        scaleY: 0,
        z: index * -0.1,
      },
      enterTo: {
        delay: 0.5 + index / 300,
        x,
        y,
        scaleX: 1,
        scaleY: 1,
        ease: 'Back.easeOut',
        opacity: 1,
      },
      pointerFrom: {
        scaleX: 1,
        scaleY: 1,
      },
      pointerTo: {
        scaleX: 0.5,
        scaleY: 0.5,
      },
      leaveTo: {
        zIndex,
        opacity: 0,
        scaleX: 0,
        scaleY: 0,
        z: index * -0.1,
      },
    };
  });
  const progress = ref(0);
  const targetProgress = ref(0);
  const { width, height } = useWindowSize();
  const size = computed(() => (width > height ? height * 0.5 : width * 0.5));

  const { x: pointerX, y: pointerY } = usePointer({
    initialValue: {
      x: unref(width) / 2,
      y: unref(height) / 2,
      width: unref(width),
      height: unref(height),
    },
  });

  function enter() {

  }

  function leave() {
    // TweenMax.staggerTo(
    //      this.$anchors,
    //      0.6,
    //      {
    //        x: 0,
    //        y: 0,
    //        opacity: 0,
    //        scaleX: 0,
    //        scaleY: 0,
    //        ease: Back.easeIn,
    //      },
    //      1 / 300,
    //      () => {
    //        this.isDestroyed = true;
    //        done();
    //      }
    //    );
  }

  function loop() {
    if (isDestroyed) {
      return;
    }
    targetProgress.value = pointerX / width;
    progress.value += (targetProgress.value - progress.value) * 0.05;
    if (progress.value < 0.01) {
      progress.value = 0;
    }

    requestAnimationFrame(loop);
  }
</script>

<style lang="scss">
  .xp3 {
    width: 50vmax;
    height: 50vmax;
    animation: rotation 30s linear infinite;
  }

  .xp3__inner {
    transform-style: preserve-3d;
    perspective: 20px;
  }

  .xp3__anchor {
    width: 2px;
    height: 2px;
    margin: -1px 0 0 -1px;
  }

  .xp3__rect {
    $width: 5vmax;
    $height: $width * 2;

    width: $width;
    height: $height;
    margin: $height * -0.5 0 0 $width * -0.5;
    background-color: #111;
    border: 1px solid #fff;
    animation: rotation 5s linear infinite;
  }
</style>
