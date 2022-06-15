---
title: A simple PHP version manager
description: A small ZSH function to easily switch PHP versions for CLI usage
---

# A simple PHP version manager

I have multiple versions of PHP installed with Homebrew on my computer and it has always been a nightmare to use a specific version in the terminal for different commands. For example, installing Composer dependencies with a specific PHP version:

```bash
/usr/bin/local/php73 $(which composer) install
```

I ended up writing a small ZSH function to easily switch from one version to another à la `nvm`. It is quite simple under the hood as it simply changes the content of the `$PATH` variable so that the `php` command points to the desired version.

The function has three commands:

- `pvm use [version]`: use the given version
- `pvm current`: display the current PHP version
- `pvm list`: list all PHP versions installed

The `pvm use [version]` command can be used without specifying a version and will have 2 different behaviours based on the current working directory:

- if a `composer.json` file containing a dependency to PHP is found, it will try to use this version
- it will fallback to the system version

## Disclaimer

This is a script created specificly to work on my local environment, I can not guarantee that it will work correctly on any other environment. Use it at your own risk.

## The script

You will find the script below, to start using it, add it to your `~/.zshrc` file or create a separate file and add the following to your `~/.zshrc`:

```bash
source /path/to/pvm.zsh
```

You also will need to have multiple versions of PHP installed with [Homebrew](https://brew.sh/). I personnaly installed them with the following command:

```bash
brew install shivammathur/php/php \
    shivammathur/php/php@5.6 \
    shivammathur/php/php@7.0 \
    shivammathur/php/php@7.1 \
    shivammathur/php/php@7.2 \
    shivammathur/php/php@7.3 \
    shivammathur/php/php@7.4 \
    shivammathur/php/php@8.0
```

Here is the script:

```bash
#!/bin/zsh

function _resolve_relative_symlink() {
    _symlink=$1
    _source=$2
    if [[ ${_source:0:3} == '../' ]]; then
        _resolve_relative_symlink ${_symlink:h} ${_source:3}
    elif [[ ${_source:0:2} == './' ]]; then
        echo "$_symlink/${_source:2}"
    elif [[ ${_source:0:1} == '/' ]]; then
        echo $_source;
    else
        echo "$_symlink/$_source"
    fi
}

function _get_php_bin_path() {
    _php_exec_path=$(which $1)
    _php_bin=$(dirname $(readlink $_php_exec_path));
    _php_path=$(_resolve_relative_symlink ${_php_exec_path:h} $_php_bin)
    echo $_php_path;
}

function _set_php_version() {
    _current_php_version=$(pvm current)
    _current_path=$(_get_php_bin_path "php${_current_php_version/./}")
    _old_path=$(php -r "echo str_replace('$_current_path:', '', '$PATH');")

    if [[ -z $1 ]]; then
        export PATH="$_old_path"
        return
    fi

    PHP_VERSIONS="$(find /usr/local/bin -maxdepth 1 -mindepth 1 -name 'php[0-9][0-9]' | sed 's#/usr/local/bin/##')"

    _version_exists="$(php -r "echo preg_match('/$1\n/m', '$PHP_VERSIONS');")"

    if [[ $_version_exists == "0" ]]; then
        echo "Could not find PHP version $1, is it installed?";
        return
    fi

    _new_path=$(_get_php_bin_path $1)
    _old_path=$(php -r "echo str_replace('$_new_path:', '', '$_old_path');")
    export PATH="$_new_path:$_old_path"
}

function pvm() {
    zparseopts -D -E -a opts -verbose::=verbose v::=version -version::=version
    VERSION='0.0.1'

    function log() {
        if [[ $verbose ]]; then
            echo $1
        fi
    }

    log "pvm@$VERSION"

    if [[ $1 == 'current' ]]; then
        local PHP_VERSION=$(php -v | grep -Eo 'PHP [0-9]+.[0-9]+')
        echo ${PHP_VERSION/PHP /};
        return;
    fi

    if [[ $1 == 'use' ]]; then
        if [[ $2 == 'system' ]]; then
            log 'use system'
            _set_php_version
        elif [[ -n $2 ]]; then
            log "use $2"
            _set_php_version "php${2/./}"
        else
            composerjson_path=$(_find_up composer.json | tr -d '[:space:]')
            if [[ -a $composerjson_path/composer.json ]]; then
                pvm_version=$(cat $composerjson_path/composer.json | jq '.require.php' | grep -Eo '[0-9](.[0-9])?' | head -n 1)
                pvm_version=${pvm_version/./}
                log "use v$pvm_version from composer.json"
                if [[ -n $pvm_version ]]; then
                    _set_php_version "php$pvm_version"
                    return
                fi
            fi
        fi
        return
    fi

    if [[ $1 == 'list' || $1 == 'ls' ]]; then
        PHP_VERSIONS="$(find /usr/local/bin -maxdepth 1 -mindepth 1 -name 'php[0-9][0-9]' | sed 's#/usr/local/bin/##')"
        echo $PHP_VERSIONS
        return
    fi

    if [[ $version == '--version' || $version == '-v' ]]; then
        echo $VERSION
        return
    fi;

    echo "pvm $VERSION
A fast and simple PHP version manager

USAGE:
    pvm <SUBCOMMAND>

FLAGS:
    -h, --help
        Prints help information

    -v, --version
        Prints version information

SUBCOMMANDS:
    current       Print the current PHP version
    use [version] Change PHP version
    list          List all available PHP versions [alias: ls]
"
}
```
