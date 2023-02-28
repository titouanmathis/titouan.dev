<page>
path: /feed.atom
</page>

<script setup lang="ts">
  import type { FeedOptions, FeedItem } from '@islands/feed';
  import { useListing } from '~/composables/useListing';

  const { site } = usePage();

  const { url, title, description } = site;

  const options: FeedOptions = {
    title,
    description,
    id: url,
    link: url,
    language: 'en',
    image: new URL('/android-chrome-512x512.png', url).toString(),
    favicon: new URL('/favicon.ico', url).toString(),
    copyright: 'Copyright (c) 2021-present, Titouan Mathis',
  };

  const posts = [useListing('articles').items.value, useListing('notes').items.value].flat();

  const items = posts.map<FeedItem>((post) => ({
    link: new URL(post.href, url).toString(),
    date: post.lastUpdated,
    title: post.title,
    description: post.description,
    content: post,
  }))
</script>

<template>
  <RenderFeed format="atom" :options="options" :items="items" />
</template>
