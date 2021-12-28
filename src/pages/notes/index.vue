<script setup lang="ts">
	import { useNotes } from '~/composables/useNotes';

	const notes = useNotes();
</script>

<template>
  <Listing
    title="Notes"
    :items="notes"
    no-items-label="No notes."
  />
</template>
