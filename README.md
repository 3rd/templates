# Templates

Sketchy templates for projects & sandboxes

### Scripts

<details>
<summary>tpl.sh</summary>

```sh
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# paths
CWD=$PWD
TEMPLATES_DIR=~/templates

pick_template() {
cd "$TEMPLATES_DIR"
fd . -td -d 1 | fzf
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
    if [ -d "$destination" ]; then
    cp -r "$source""/*" "$destination"
    else
    cp -r "$source" "$destination"
    fi
    git init
}

main
```

</details>
