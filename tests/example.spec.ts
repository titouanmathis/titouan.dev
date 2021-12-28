import { test, describe, expect } from 'vitest'

import Index from '../src/pages/index.mdx'

describe('example test', () => {
  test('stub default layout', () => {
    expect(Index.title).toEqual('You did it!')
  })
})
