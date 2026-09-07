import { describe, expect, it } from 'vitest'
import { resolvePdfLayout } from './pdfLayout'

describe('resolvePdfLayout', () => {
  it('uses portrait for a standard 12-module rail', () => {
    expect(resolvePdfLayout(12 * 17.5, 32, 10)?.orientation).toBe('landscape')
    expect(resolvePdfLayout(10 * 17.5, 32, 10)?.orientation).toBe('portrait')
  })

  it('rejects a strip that cannot fit A4 at 1:1', () => {
    expect(resolvePdfLayout(280, 32, 10)).toBeNull()
    expect(resolvePdfLayout(100, 280, 10)).toBeNull()
  })
})
