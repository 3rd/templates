import { expect, test } from 'bun:test'

import { runtimeSummary } from './runtime'

test('runtime summary names each runtime with its version', () => {
  const summary = runtimeSummary({
    chrome: '140.0.7339.207',
    electron: '44.0.0',
    node: '24.6.0'
  })

  expect(summary).toBe('Electron 44.0.0 / Chromium 140.0.7339.207 / Node 24.6.0')
})
