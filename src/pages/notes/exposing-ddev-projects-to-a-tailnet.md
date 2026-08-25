---
date: 2026-08-24
title: Exposing DDEV projects to a Tailnet
description: A small proxy for debugging DDEV projects from a Tailnet.
tags: ddev, tailscale, nginx, docker
---

# Exposing DDEV projects to a Tailnet

<MetaInfo class="block">24/08/2026 in #ddev #tailscale #nginx #docker</MetaInfo>

I am now mainly working on a remote development server setup with [Herdr](https://herdr.dev), [mise](https://mise.jdx.dev/) and [Tailscale](https://tailscale.com/), with [Zed](https://zed.dev) as my main editor with its [remote development](https://zed.dev/docs/remote-development) features.

Most of our projects run with [DDEV](https://ddev.com) and I wanted to be able to run them on my development server and expose them to my Tailnet for private access. I first tried [ddev-tailscale-router](https://github.com/atj4me/ddev-tailscale-router), but it is a per-project DDEV addon which is too complex to maintain and setup. 

I instead explored the idead of adding one proxy in front of DDEV: it would discover running projects, assign stable ports, and exposes them through the server's Tailnet hostname. 

After a few iterations with Claude, i ended up with a stable enough solution to share it publicly: [ddev-tailnet-proxy](https://github.com/titouanmathis/ddev-tailnet-proxy) is available for testing. 

**Try it now**

```sh
mise use -g github:titouanmathis/ddev-tailnet-proxy@0.1.4
sudo "$(mise which ddev-tailnet-proxy)" service install
```

The service refreshes every two minutes. It adds new running projects and removes stopped ones from the active proxy configuration.

```sh
$ ddev-tailnet-proxy status
Node DNS: server.some-name.ts.net

PROJECT                      PORT   URL
foehn-demo                   19009  https://server.some-name.ts.net:19009/
```

**Disclaimer**

I use it with simple DDEV projects and it works fine, but I haven't tried it with more advanced DDEV network configurations.
