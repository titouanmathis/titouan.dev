---
title: An Alfred Workflow for SSH aliases
description: A workflow to quickly open a connection to your SSH aliases
---

import MetaInfo from '~/components/MetaInfo.vue';

# An Alfred Workflow for SSH aliases

<MetaInfo class="block">26/08/2025 in #terminal #ssh #alfred</MetaInfo>

Although I was already using the [good SSH plugin](https://github.com/ohmyzsh/ohmyzsh/blob/master/plugins/ssh/README.md) from [Oh My ZSH](https://ohmyz.sh/) to provide alias-based autocompletion, I wanted to be able to access my configured aliases from [Alfred](https://alfred.app/) for its ability to remember often used options, so I created a workflow.

The workflow is tiny and is made of a script filter input and a run script action.

![-](/2025/08/26/alfred-ssh.png)

The input script is a shell script using `jq` to format the Alfred output as JSON.

```sh
cat ~/.ssh/config \
  | grep -E "^Host " \
  | sed 's/Host //' \
  | xargs -I _ echo '{"title": "_", "uid": "_", "arg": "_"}' \
  | jq -s '{ items: . }'
```

![-](/2025/08/26/alfred-ssh-input.png)

The action script opens a new [WezTerm](https://wezterm.org/) window with a custom command to start, receiving the `{query}` from the input script.

```sh
open -a wezterm --new --args start ssh {query}
```

If you use another terminal application, you should be able to find a way to setup the same kind of opening with a quick search, be it Google, ChatGPT or Claude.

![-](/2025/08/26/alfred-ssh-action.png)

Et voilà, I can connect to my servers in seconds:

<div style="max-width: 36em; margin: auto;">

![-](/2025/08/26/alfred-ssh-result.png)

</div>
