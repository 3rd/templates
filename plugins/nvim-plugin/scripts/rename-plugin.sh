#!/usr/bin/env bash

set -euo pipefail

showUsage() {
  printf 'Usage: %s <plugin-name[.nvim]>\n' "${0##*/}"
  printf 'Example: %s smart-pairs.nvim\n' "${0##*/}"
}

toPascalCase() {
  local name=$1
  local part
  local firstCharacter
  local result=""
  local -a parts=()

  IFS='-' read -r -a parts <<< "$name"
  for part in "${parts[@]}"; do
    firstCharacter=$(printf '%s' "${part:0:1}" | tr '[:lower:]' '[:upper:]')
    result+="${firstCharacter}${part:1}"
  done

  printf '%s' "$result"
}

replaceTokens() {
  local sourcePath=$1
  local stagedPath=$2
  local line

  while IFS= read -r line || [[ -n "$line" ]]; do
    line=${line//$TEMPLATE_KEBAB/$PLUGIN_NAME}
    line=${line//$TEMPLATE_PASCAL/$COMMAND_PREFIX}
    line=${line//$TEMPLATE_SNAKE/$LOAD_GUARD}
    printf '%s\n' "$line"
  done < "$sourcePath" > "$stagedPath"
}

if [[ $# -eq 1 && ( $1 == "-h" || $1 == "--help" ) ]]; then
  showUsage
  exit 0
fi

if [[ $# -ne 1 ]]; then
  showUsage >&2
  exit 2
fi

readonly TEMPLATE_KEBAB="nvim""-plugin"
readonly TEMPLATE_PASCAL="Nvim""Plugin"
readonly TEMPLATE_SNAKE="nvim""_plugin"
readonly REQUESTED_NAME=$1
readonly PLUGIN_NAME=${REQUESTED_NAME%.nvim}

if [[ ! $PLUGIN_NAME =~ ^[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$ ]]; then
  printf 'Plugin name must use lowercase kebab-case, optionally followed by .nvim: %s\n' "$REQUESTED_NAME" >&2
  exit 2
fi

if [[ $PLUGIN_NAME == *"$TEMPLATE_KEBAB"* ]]; then
  printf 'Plugin name must not contain the reserved template name %s.\n' "$TEMPLATE_KEBAB" >&2
  exit 2
fi

case "$PLUGIN_NAME" in
  bit|coroutine|debug|ffi|io|jit|lpeg|luv|math|mpack|os|package|string|table)
    printf 'Plugin name conflicts with a built-in Lua or Neovim module: %s\n' "$PLUGIN_NAME" >&2
    exit 2
    ;;
esac

COMMAND_PREFIX=$(toPascalCase "$PLUGIN_NAME")
readonly COMMAND_PREFIX
readonly LOAD_GUARD=${PLUGIN_NAME//-/_}
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly SCRIPT_DIR
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
readonly ROOT_DIR

cd "$ROOT_DIR"

if ! command -v rg >/dev/null 2>&1; then
  printf 'ripgrep is required. Enter the Nix or Mise development environment first.\n' >&2
  exit 1
fi

sourcePaths=(
  "lua/$TEMPLATE_KEBAB"
  "plugin/$TEMPLATE_KEBAB.lua"
  "doc/$TEMPLATE_KEBAB.txt"
  "tests/test_$TEMPLATE_SNAKE.lua"
)
destinationPaths=(
  "lua/$PLUGIN_NAME"
  "plugin/$PLUGIN_NAME.lua"
  "doc/$PLUGIN_NAME.txt"
  "tests/test_$LOAD_GUARD.lua"
)

for sourcePath in "${sourcePaths[@]}"; do
  if [[ ! -e $sourcePath ]]; then
    printf 'Expected template path is missing: %s\n' "$sourcePath" >&2
    printf 'This template may already be renamed or may not be the original starter.\n' >&2
    exit 1
  fi
done

for destinationPath in "${destinationPaths[@]}"; do
  if [[ -e $destinationPath ]]; then
    printf 'Rename destination already exists: %s\n' "$destinationPath" >&2
    exit 1
  fi
done

for templateToken in "$TEMPLATE_KEBAB" "$TEMPLATE_PASCAL" "$TEMPLATE_SNAKE"; do
  if ! rg --quiet --hidden --glob '!.git/**' --glob '!.deps/**' --fixed-strings "$templateToken" .; then
    printf 'Expected template token is missing: %s\n' "$templateToken" >&2
    exit 1
  fi
done

matchedFiles=()
while IFS= read -r -d '' sourcePath; do
  matchedFiles+=("${sourcePath#./}")
done < <(
  rg --files-with-matches --null --hidden \
    --glob '!.git/**' \
    --glob '!.deps/**' \
    --fixed-strings \
    -e "$TEMPLATE_KEBAB" \
    -e "$TEMPLATE_PASCAL" \
    -e "$TEMPLATE_SNAKE" \
    .
)

if [[ ${#matchedFiles[@]} -eq 0 ]]; then
  printf 'No template files need renaming.\n' >&2
  exit 1
fi

STAGING_DIR=$(mktemp -d "${TMPDIR:-/tmp}/${TEMPLATE_KEBAB}-rename.XXXXXX")
readonly STAGING_DIR
trap 'rm -rf "$STAGING_DIR"' EXIT

for sourcePath in "${matchedFiles[@]}"; do
  stagedPath="$STAGING_DIR/$sourcePath"
  mkdir -p "$(dirname "$stagedPath")"
  replaceTokens "$sourcePath" "$stagedPath"
done

if rg --quiet --hidden --fixed-strings \
  -e "$TEMPLATE_KEBAB" \
  -e "$TEMPLATE_PASCAL" \
  -e "$TEMPLATE_SNAKE" \
  "$STAGING_DIR"; then
  printf 'The staged rename still contains template tokens. No project files were changed.\n' >&2
  exit 1
fi

for sourcePath in "${matchedFiles[@]}"; do
  cat "$STAGING_DIR/$sourcePath" > "$sourcePath"
done

for ((index = 0; index < ${#sourcePaths[@]}; index++)); do
  mv "${sourcePaths[$index]}" "${destinationPaths[$index]}"
done

if rg --quiet --hidden --glob '!.git/**' --glob '!.deps/**' --fixed-strings \
  -e "$TEMPLATE_KEBAB" \
  -e "$TEMPLATE_PASCAL" \
  -e "$TEMPLATE_SNAKE" \
  .; then
  printf 'The rename completed, but template-name text remains.\n' >&2
  exit 1
fi

remainingPaths=$(find . \
  \( -path './.git' -o -path './.deps' \) -prune -o \
  \( -name "*$TEMPLATE_KEBAB*" -o -name "*$TEMPLATE_PASCAL*" -o -name "*$TEMPLATE_SNAKE*" \) \
  -print)

if [[ -n $remainingPaths ]]; then
  printf 'The rename completed, but template-name paths remain:\n%s\n' "$remainingPaths" >&2
  exit 1
fi

printf 'Renamed the plugin template.\n'
printf '  Repository:     %s.nvim\n' "$PLUGIN_NAME"
printf '  Lua module:     %s\n' "$PLUGIN_NAME"
printf '  Command prefix: %s\n' "$COMMAND_PREFIX"
printf '  Load guard:     %s\n' "$LOAD_GUARD"
printf 'Run make verify before you start development.\n'
