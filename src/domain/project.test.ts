import { describe, expect, it } from 'vitest'
import { createLabel, initialProject, normalizeProject } from './project'
import { parseProjectJson } from './projectValidation'

describe('project normalization', () => {
  it('preserves unchanged labels and icons when project settings change', () => {
    const original = normalizeProject({ ...initialProject(), labels: [createLabel(0, 0)] })
    const renamed = normalizeProject({ ...original, name: 'Новый щит' })

    expect(renamed.name).toBe('Новый щит')
    expect(renamed.labels).toBe(original.labels)
    expect(renamed.icons).toBe(original.icons)
  })

  it('updates shared heights without mutating existing labels or unrelated zones', () => {
    const original = normalizeProject({ ...initialProject(), labels: [createLabel(0, 0)] })
    const resized = normalizeProject({ ...original, zoneHeights: { ...original.zoneHeights, top: 8 } })

    expect(resized.labels[0].top.heightMm).toBe(8)
    expect(original.labels[0].top.heightMm).toBe(6)
    expect(resized.labels[0].middle).toBe(original.labels[0].middle)
    expect(resized.labels[0].bottom).toBe(original.labels[0].bottom)
    expect(resized.icons).toBe(original.icons)
  })

  it('still migrates legacy heights, appearance and optional label fields', () => {
    const label = createLabel(0, 0)
    const legacy = {
      ...initialProject(),
      zoneHeights: undefined,
      zoneStyles: undefined,
      labels: [{
        ...label,
        iconScale: undefined,
        numberOverride: undefined,
        top: { ...label.top, heightMm: 8 },
        middle: { ...label.middle, background: '#eff6ff' },
      }],
    }

    const restored = parseProjectJson(JSON.stringify(legacy))

    expect(restored.zoneHeights.top).toBe(8)
    expect(restored.labels[0]).toMatchObject({
      iconScale: 100,
      numberOverride: '',
      top: { heightMm: 8 },
      middle: { background: '#fff0d5' },
    })
  })
})
