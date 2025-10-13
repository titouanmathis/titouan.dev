---
title: A simple Basic Auth middleware for Nuxt 3
description: A quick implementation of the basic authentication scheme with a server middleware and runtime config for Nuxt 3
---

# A simple Basic Auth middleware for Nuxt 3

<div class="tracking-wide uppercase opacity-70"><small>10/03/2023 in #Vue #Nuxt</small></div>

We often find ourselves needing to protect the access to development environment to avoid unwanted visitors. We use the [Basic authentication scheme](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#basic_authentication_scheme), which is quite simple to configure when working with an Apache server.

For our Nuxt 3 projects, we implemented this feature with a simple [server middleware](https://nuxt.com/docs/guide/directory-structure/server#server-middleware) and a [runtime config](https://nuxt.com/docs/guide/going-further/runtime-config) to define the valid credentials.

**nuxt.config.ts**

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    basicAuth: '',
  },
});
```

**server/middleware/basic-auth.ts**

```ts
import { appendHeader, createError, getHeader } from 'h3';

function mapCredentialsToBasicAuthHeaders(multipleCredentials: string): string[] {
  return multipleCredentials.split('\n').map((credentials) => `Basic ${btoa(credentials)}`);
}

export default defineEventHandler((event) => {
  const { basicAuth } = useRuntimeConfig();

  // If `basicAuth` is empty, do not prompt for authentication
  if (!basicAuth) {
    return;
  }

  // Format our credentials to their corresponding header:
  // `user:pass` becomes `Basic dXNlcjpwYXNz`
  const validAuthHeaders = mapCredentialsToBasicAuthHeaders(basicAuth);
  const authHeader = getHeader(event, 'authorization');

  // If the given authentication header is valid, do not prompt for authentication
  if (authHeader && validAuthHeaders.some((validAuthHeader) => validAuthHeader === authHeader)) {
    return;
  }

  // Set the `www-authenticate` header to prompt for authentication
  // The realm attribute can be used to customize the message shown to the user
  appendHeader(event, 'www-authenticate', 'Basic realm="Identification"');
  throw createError({ statusCode: 401, statusMessage: 'Not authorized' });
});
```

We can then define the `NUXT_BASIC_AUTH` environment variable to enable authentication where we need it.

We can define multiple credentials by putting each one on a different line:

```sh
NUXT_BASIC_AUTH="user1:pass1\nuser2:pass2"
```

---

We currently enable the middelware by injecting the file in our build pipelines, but we plan to migrate it to a [module](https://nuxt.com/docs/guide/directory-structure/modules). This will allow us to inject it whereever the `NUXT_BASIC_AUTH` environment variable is defined.
