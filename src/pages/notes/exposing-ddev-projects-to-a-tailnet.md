---
date: 2026-08-24
title: Exposing DDEV projects to a Tailnet
description: A small host-level proxy for sharing running DDEV projects through Tailscale without breaking canonical-host redirects.
tags: ddev, tailscale, nginx, docker
---

# Exposing DDEV projects to a Tailnet

<MetaInfo class="block">24/08/2026 in #ddev #tailscale #nginx #docker</MetaInfo>

I wanted to debug [DDEV](https://ddev.com/) projects running on my development server from other devices on the same [Tailscale](https://tailscale.com/) Tailnet. I first tried [ddev-tailscale-router](https://github.com/atj4me/ddev-tailscale-router), but its setup was more complex than I needed and it configured exposure per project.

I instead put one proxy in front of DDEV. It discovers running projects, assigns each one a port, and exposes the ports through the server's Tailnet hostname.

A direct host port does not always work: applications can redirect the browser to their configured canonical host, such as `<project>.ddev.site`. DDEV's router uses that host to select the project, but a second Tailnet device cannot usually resolve it, so the browser leaves the Tailnet URL and cannot reach the project.

## The canonical-host problem

DDEV routes requests through `ddev-router`. The router selects a project from the request `Host` header, for example `project.ddev.site`. Many applications then use that host as their canonical URL.

WordPress and PrestaShop can redirect to the configured site URL, while framework middleware, generated links, cookies, and API responses can also contain the canonical host. Changing only the request destination does not change those browser-visible values.

The proxy gives each discovered project a Tailnet URL of this form:

```text
https://<tailnet-node>:<port>/
```

For an incoming request, it sends `Host: <project>.ddev.site` to `ddev-router`. DDEV can then select the right project, and the application sees its expected host. Before the response reaches the browser, the proxy rewrites references to the DDEV host back to the Tailnet node and assigned port.

## A fast prototype

The prototype took little code because it uses standard components: an Nginx container, a reverse proxy, DDEV's router, and Tailscale Serve. It runs on DDEV's Docker network and has three responsibilities.

### Discover running projects and preserve their ports

The refresh step reads DDEV's JSON project list and selects projects whose status is `running`. It records a port for each project in a persistent JSON file. New projects receive the next available port from a configured range. Existing projects retain their port across refreshes.

A project keeps its port when other projects start or stop, so bookmarks continue to identify the same project. The refresh step removes stopped projects from the active proxy configuration, while it retains their port assignments for the next start.

The proxy skips projects that already publish HTTP or HTTPS on all host interfaces: they already have a direct exposure path, and their canonical-port settings can conflict with host rewriting.

### Route through `ddev-router` and rewrite the response

For each assigned port, Nginx listens inside one server block and proxies HTTPS requests to `ddev-router`. It sets the upstream TLS server name and `Host` header to the project's DDEV host. The router can therefore use its normal host-based routing.

The proxy then changes response data that would send the browser back to the DDEV host:

- `Location` headers are rewritten to the Tailnet URL.
- Cookie domains are rewritten to the Tailnet node.
- HTML, CSS, JavaScript, and JSON response bodies are rewritten when they contain absolute URLs or host names.

Nginx asks the upstream not to compress these responses, because its body substitution operates on readable response bodies. This is a targeted workaround, not a general URL-rewriting engine.

### Publish only loopback ports through Tailscale Serve

The Nginx container publishes each assigned port on `127.0.0.1`, not on every network interface. [Tailscale Serve](https://tailscale.com/kb/1241/tailscale-serve) forwards HTTPS traffic for that local port to Tailnet peers.

The container listens only on loopback, so this setup does not add a port to the public network or the host firewall. Access depends on Tailnet device membership and access-control policy; a process on the same host can still reach the loopback port, so Tailscale is the network boundary rather than a local-process isolation boundary.

## Prototype usage

The prototype has a refresh command with no arguments. It discovers running projects, generates Nginx configuration when the mapping changed, and ensures that each local port has a Tailscale Serve rule. Running it again is safe when no configuration changed; it does not recreate the proxy container in that case.

```sh
ddev-tailnet-proxy
```

Its `status` command prints the current project-to-port mapping and checks whether each local endpoint responds.

```sh
ddev-tailnet-proxy status
```

The first prototype used `cron` for periodic refreshes. The package I am preparing replaces it with a systemd timer, so refreshes run with the privileges required to maintain Tailscale Serve rules.

## Limits of response rewriting

The approach works when an application consistently uses its DDEV host in ordinary HTTP responses. It has limits.

Nginx only rewrites the configured response types. A host embedded in another content type, encoded value, binary asset, or application-specific protocol will pass through unchanged. WebSocket upgrades also need explicit proxy configuration, which this prototype does not provide.

Cookie rewriting changes the domain but does not make separate application origins equivalent. Applications that validate an allowed origin, callback URL, or trusted proxy configuration can need their own development configuration. Some applications may also construct URLs from a configured port or scheme in ways that a simple host substitution cannot correct.

The proxy disables certificate verification for the upstream DDEV router because the connection stays on the Docker network controlled by the development host. This setting does not apply to an upstream outside that network.

Each project also consumes a distinct port. This keeps discovery simple and preserves DDEV's host routing, but it is less convenient than one path-based or hostname-based public endpoint. Port allocation can collide with another local service, so the prototype checks before assigning a new port.

## Choosing the boundary deliberately

DDEV's router remains responsible for project selection. The host-level proxy only translates between two names for the same project: the DDEV host used upstream and the Tailnet URL used by the browser. It does not change each application's configured site URL or expose its Docker ports directly.

The prototype works for the simple projects I use for debugging. I have not tested it with advanced DDEV configurations, so [ddev-tailnet-proxy](https://github.com/titouanmathis/ddev-tailnet-proxy) is available for testing rather than presented as a general solution.
