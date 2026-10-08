# Templates

Sketchy templates for projects & sandboxes

## Layout

- [cli/](cli/): command-line applications, including plugin-enabled CLIs.
- [gui/](gui/): desktop applications grouped under `go/`, `rust/`, and `typescript/`.
- [web/](web/): React frontend and full-stack applications.
- [lib/](lib/): Go and TypeScript libraries.
- [mcp/](mcp/): Node-compatible and Bun-native MCP servers.
- [plugins/](plugins/): Neovim plugins.
- [llm/](llm/): LLM evaluations.
- [slides/](slides/): Slidev presentations.

Each active template has an empty `.root` file at its project root. The `tpl`
picker discovers these files at any depth and lists their containing directories.
Grouping folders are not templates. `archive/` is excluded from the picker, even
when archived projects contain `.root` files.

## Scripts

The `tpl` picker requires Bash, Git, `fd`, `fzf`, and `tar`. Save the script below
as an executable named `tpl` on your `PATH`. Set `TEMPLATES_DIR` to the absolute
path of your checkout before running it:

```bash
export TEMPLATES_DIR="/path/to/templates"
tpl
```

<details>
<summary>tpl</summary>

```sh
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# paths
CWD=$PWD
TEMPLATES_DIR=${TEMPLATES_DIR:?Set TEMPLATES_DIR to the absolute path of this checkout}

pick_template() {
    cd "$TEMPLATES_DIR"
    fd --hidden --type file --glob .root --exclude /archive --format '{//}' | fzf
}

copy_template() {
    local source=$1 destination=$2 path
    [[ -d $destination ]] || mkdir "$destination"
    git -C "$source" ls-files -z --cached --others --exclude-standard \
        | while IFS= read -r -d '' path; do
            if [[ -e $source/$path || -L $source/$path ]]; then
                printf '%s\0' "$path"
            fi
        done \
        | tar -C "$source" --null -T - -cf - \
        | tar -C "$destination" -xf -
}

main() {
    # select template
    local selected_template source destination
    selected_template=$(pick_template)
    if [[ -z "$selected_template" ]]; then
    exit
    fi
    source="$TEMPLATES_DIR/$selected_template"
    echo "Source: $source"

    # select destination
    echo -n 'Destination: '
    read -i "$CWD/" -e -r destination

    # apply
    copy_template "$source" "$destination"
    cd "$destination"
    git init
}

main
```

</details>
