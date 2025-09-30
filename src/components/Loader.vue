<template>
  <transition
    enter-from-class="opacity-0 transform scale-0"
    enter-active-class="transition"
    leave-to-class="opacity-0 transform scale-0"
    leave-active-class="transition"
    appear
    mode="out-in">
    <div class="absolute top-1/2 left-1/2 w-6 h-6 -mt-3 -ml-3">
      <svg
        class="animate-spin h-full w-full text-gray-500"
        style="animation-duration: 0.2s"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="1"></circle>
      </svg>
      <span class="sr-only">Loading...</span>
    </div>
  </transition>
</template>
