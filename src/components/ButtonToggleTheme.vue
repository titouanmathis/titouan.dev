<template>
  <button id="toggle-theme" class="btn-theme w-5 h-5" type="button" aria-label="Toggle theme">
    <IconBxBxMoon class="btn-theme__icon btn-theme__icon--dark" />
    <IconBxBxSun class="btn-theme__icon btn-theme__icon--light" />
    <span class="sr-only">Switch between dark or light theme</span>
  </button>
</template>

<style>
  .btn-theme__icon {
    @apply transition duration-500 ease-out-expo;
    position: absolute;
    top: 0;
    left: 0;
  }

  html.dark .btn-theme__icon--light,
  html:not(.dark) .btn-theme__icon--dark {
    opacity: 0;
    transform: translateY(100%);
  }
</style>
