import { afterEach, describe, expect, it, vi } from 'vitest'
import type { jsPDF } from 'jspdf'

describe('PDF font loading', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('retries a failed download and reuses the successful font for later exports', async () => {
    vi.resetModules()
    const fetchFont = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer })
    vi.stubGlobal('fetch', fetchFont)
    const document = {
      addFileToVFS: vi.fn(),
      addFont: vi.fn(),
      setFont: vi.fn(),
    }
    const { registerPdfFont } = await import('./pdfFont')

    await expect(registerPdfFont(document as unknown as jsPDF)).rejects.toThrow('503')
    expect(document.addFont).not.toHaveBeenCalled()

    await Promise.all([
      registerPdfFont(document as unknown as jsPDF),
      registerPdfFont(document as unknown as jsPDF),
    ])
    await registerPdfFont(document as unknown as jsPDF)

    expect(fetchFont).toHaveBeenCalledTimes(2)
    expect(document.addFileToVFS).toHaveBeenCalledWith('DejaVuSans.ttf', 'AQID')
    expect(document.addFont).toHaveBeenCalledTimes(3)
  })
})
