/// <reference types="node" />

import { readFile } from 'node:fs/promises'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { jsPDF } from 'jspdf'
import { createLabel, initialProject } from '../domain/project'

const output = vi.hoisted(() => ({ save: vi.fn(), document: null as jsPDF | null }))

vi.mock('jspdf', async importOriginal => {
  const actual = await importOriginal<typeof import('jspdf')>()
  return {
    ...actual,
    jsPDF: function (...args: ConstructorParameters<typeof actual.jsPDF>) {
      const document = new actual.jsPDF(...args)
      document.save = output.save
      output.document = document
      return document
    },
  }
})

describe('PDF export', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
    output.document = null
  })

  it('exports a real PDF with an embedded font, icon and multiple rails', async () => {
    const font = await readFile('node_modules/dejavu-fonts-ttf/ttf/DejaVuSans.ttf')
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      arrayBuffer: async () => font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength),
    })))
    const icon = {
      id: 'test-png',
      label: 'Тест',
      category: 'Мои',
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
    }
    const project = {
      ...initialProject(),
      name: 'Щит проверки',
      rails: 7,
      icons: [icon],
      labels: Array.from({ length: 7 }, (_, rail) => ({
        ...createLabel(rail, 0),
        iconId: icon.id,
        numberOverride: `QF${rail + 1}`,
      })),
    }
    const { exportPdf } = await import('./pdfExport')

    await exportPdf(project)

    expect(output.save).toHaveBeenCalledWith('Щит проверки.pdf')
    expect(output.document?.getNumberOfPages()).toBe(2)
    expect(output.document?.internal.pageSize.getWidth()).toBeCloseTo(297)
    expect(output.document?.output()).toContain('/FontFile2')
    expect(output.document?.output()).toContain('/Subtype /Image')
  })

  it('rejects an empty project before loading fonts or creating a PDF', async () => {
    const alert = vi.fn()
    const fetchFont = vi.fn()
    vi.stubGlobal('alert', alert)
    vi.stubGlobal('fetch', fetchFont)
    const { exportPdf } = await import('./pdfExport')

    await exportPdf(initialProject())

    expect(alert).toHaveBeenCalledWith('Добавьте хотя бы одну наклейку перед экспортом.')
    expect(fetchFont).not.toHaveBeenCalled()
    expect(output.document).toBeNull()
    expect(output.save).not.toHaveBeenCalled()
  })
})
