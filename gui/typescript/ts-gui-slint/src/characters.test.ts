import { expect, test } from 'bun:test'

import { countCharacters } from './characters.ts'

test.each([
  ['', 0],
  ['é', 1],
  ['😀', 1],
  ['e\u0301', 2],
  ['é😀', 2]
])('%p counts as %i characters, one per code point', (text, count) => {
  expect(countCharacters(text)).toBe(count)
})
