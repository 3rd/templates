#!/usr/bin/env bash

set -euo pipefail

fail() {
  printf 'rename-plugin test failed: %s\n' "$*" >&2
  exit 1
}

createFixture() {
  local fixtureRoot=$1

  mkdir -p \
    "$fixtureRoot/scripts" \
    "$fixtureRoot/lua/$TEMPLATE_KEBAB" \
    "$fixtureRoot/plugin" \
    "$fixtureRoot/doc" \
    "$fixtureRoot/tests"
  cp "$PROJECT_ROOT/scripts/rename-plugin.sh" "$fixtureRoot/scripts/"

  printf '# %s.nvim\n%s %s\n' \
    "$TEMPLATE_KEBAB" "$TEMPLATE_PASCAL" "$TEMPLATE_SNAKE" \
    > "$fixtureRoot/README.md"
  printf '%s\n' "$TEMPLATE_KEBAB" > "$fixtureRoot/lua/$TEMPLATE_KEBAB/init.lua"
  printf '%s\n' "$TEMPLATE_SNAKE" > "$fixtureRoot/plugin/$TEMPLATE_KEBAB.lua"
  printf '*%s.txt* :%sGreet\n' \
    "$TEMPLATE_KEBAB" "$TEMPLATE_PASCAL" \
    > "$fixtureRoot/doc/$TEMPLATE_KEBAB.txt"
  printf '%s\n' "$TEMPLATE_PASCAL" > "$fixtureRoot/tests/test_$TEMPLATE_SNAKE.lua"
}

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly SCRIPT_DIR
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
readonly PROJECT_ROOT

readonly TEMPLATE_KEBAB="nvim""-plugin"
readonly TEMPLATE_PASCAL="Nvim""Plugin"
readonly TEMPLATE_SNAKE="nvim""_plugin"

TEST_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/rename-plugin-test.XXXXXX")
readonly TEST_ROOT
trap 'rm -rf "$TEST_ROOT"' EXIT

successRoot="$TEST_ROOT/success"
createFixture "$successRoot"

(
  cd "$successRoot"
  ./scripts/rename-plugin.sh smart-pairs.nvim >/dev/null
)

[[ -d $successRoot/lua/smart-pairs ]] || fail "Lua module directory was not renamed"
[[ -f $successRoot/plugin/smart-pairs.lua ]] || fail "plugin entrypoint was not renamed"
[[ -f $successRoot/doc/smart-pairs.txt ]] || fail "help file was not renamed"
[[ -f $successRoot/tests/test_smart_pairs.lua ]] || fail "test file was not renamed"

if rg --quiet --hidden --fixed-strings \
  -e "$TEMPLATE_KEBAB" \
  -e "$TEMPLATE_PASCAL" \
  -e "$TEMPLATE_SNAKE" \
  "$successRoot"; then
  fail "template-name text remains after a successful rename"
fi

rg --quiet --fixed-strings "smart-pairs" "$successRoot/README.md" || \
  fail "kebab-case name was not written"
rg --quiet --fixed-strings "SmartPairs" "$successRoot/doc/smart-pairs.txt" || \
  fail "PascalCase name was not written"
rg --quiet --fixed-strings "smart_pairs" "$successRoot/plugin/smart-pairs.lua" || \
  fail "snake_case name was not written"

set +e
(
  cd "$successRoot"
  ./scripts/rename-plugin.sh another-plugin >/dev/null 2>&1
)
repeatStatus=$?
set -e
[[ $repeatStatus -eq 1 ]] || fail "a repeated rename did not return status 1"

invalidRoot="$TEST_ROOT/invalid"
createFixture "$invalidRoot"

set +e
(
  cd "$invalidRoot"
  ./scripts/rename-plugin.sh Bad_Name >/dev/null 2>&1
)
invalidStatus=$?
set -e
[[ $invalidStatus -eq 2 ]] || fail "an invalid name did not return status 2"
[[ -d $invalidRoot/lua/$TEMPLATE_KEBAB ]] || fail "an invalid name changed the fixture"

for reservedName in bit coroutine debug ffi io jit lpeg luv math mpack os package string table; do
  reservedRoot="$TEST_ROOT/reserved-$reservedName"
  createFixture "$reservedRoot"
  cp -R "$reservedRoot" "$reservedRoot-before"

  set +e
  (
    cd "$reservedRoot"
    ./scripts/rename-plugin.sh "$reservedName.nvim" >/dev/null 2>&1
  )
  reservedStatus=$?
  set -e

  [[ $reservedStatus -eq 2 ]] || fail "reserved module $reservedName did not return status 2"
  diff -r "$reservedRoot-before" "$reservedRoot" || fail "reserved module $reservedName changed the fixture"
done

collisionRoot="$TEST_ROOT/collision"
createFixture "$collisionRoot"
mkdir -p "$collisionRoot/lua/smart-pairs"

set +e
(
  cd "$collisionRoot"
  ./scripts/rename-plugin.sh smart-pairs >/dev/null 2>&1
)
collisionStatus=$?
set -e
[[ $collisionStatus -eq 1 ]] || fail "a destination collision did not return status 1"
[[ -d $collisionRoot/lua/$TEMPLATE_KEBAB ]] || fail "a collision changed the fixture"
rg --quiet --fixed-strings "$TEMPLATE_KEBAB" "$collisionRoot/README.md" || \
  fail "a collision rewrote project text"

printf 'rename-plugin checks passed\n'
