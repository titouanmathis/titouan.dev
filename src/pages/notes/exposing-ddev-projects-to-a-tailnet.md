---
date: 2026-08-24
title: Exposing DDEV projects to a Tailnet
description: A small proxy for debugging DDEV projects from a Tailnet.
tags: ddev, tailscale, nginx, docker
---

# Exposing DDEV projects to a Tailnet

<MetaInfo class="block">24/08/2026 in #ddev #tailscale #nginx #docker</MetaInfo>

I wanted to debug [DDEV](https://ddev.com/) projects running on my development server from other devices on the same [Tailscale](https://tailscale.com/) Tailnet. I first tried [ddev-tailscale-router](https://github.com/atj4me/ddev-tailscale-router), but its per-project setup was more than I needed.

I instead put one proxy in front of DDEV. It discovers running projects, assigns stable ports, and exposes them through the server's Tailnet hostname.

## The proxy

DDEV routes each request from its `Host` header, usually `<project>.ddev.site`. Applications can also redirect to that canonical host, which another Tailnet device cannot resolve.

The proxy sends the DDEV host to `ddev-router`, then rewrites redirects, cookie domains, and common text responses to the Tailnet URL. Nginx runs on DDEV's Docker network, while Tailscale Serve publishes only loopback ports.

## Install

[ddev-tailnet-proxy](https://github.com/titouanmathis/ddev-tailnet-proxy) is available for testing. It uses Bash, Nginx, Docker, Tailscale Serve, and systemd.

```sh
mise use -g github:titouanmathis/ddev-tailnet-proxy@0.1.4
sudo "$(mise which ddev-tailnet-proxy)" service install
```

The service refreshes every two minutes. It adds new running projects and removes stopped ones from the active proxy configuration.

```sh
ddev-tailnet-proxy status
sudo ddev-tailnet-proxy service status
```

I use it with simple DDEV projects. Advanced DDEV network configurations still need testing.
