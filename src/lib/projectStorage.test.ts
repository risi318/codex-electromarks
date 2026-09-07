import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createLabel, initialProject, normalizeProject } from '../domain/project'
import { loadProject, saveProject } from './projectStorage'

const storageKey = 'electromarks-project-v1'

describe('project storage', () => {
  let stored: Map<string, string>

  beforeEach(() => {
    stored = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value),
    })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('stores only custom icons and restores the complete project', () => {
    const initial = initialProject()
    const custom = { id: 'custom-icon', label: 'Моя пиктограмма', category: 'Мои', dataUrl: 'data:image/png;base64,AAAA' }
    const project = normalizeProject({
      ...initial,
      icons: [...initial.icons, custom],
      labels: [createLabel(0, 0), { ...createLabel(0, 1), iconId: custom.id }],
    })

    expect(saveProject(project)).toBe(true)
    expect(JSON.parse(stored.get(storageKey)!).icons).toEqual([custom])
    expect(loadProject()).toEqual(project)
  })

  it('reads existing saves containing the built-in catalog', () => {
    const project = normalizeProject({ ...initialProject(), labels: [createLabel(0, 0)] })
    stored.set(storageKey, JSON.stringify(project))

    expect(loadProject()).toEqual(project)
  })

  it('reports a failed save without throwing or replacing the previous save', () => {
    saveProject(initialProject())
    const previous = stored.get(storageKey)
    vi.stubGlobal('localStorage', {
      setItem: () => { throw new DOMException('Storage is full', 'QuotaExceededError') },
    })

    expect(saveProject({ ...initialProject(), name: 'Unsaved' })).toBe(false)
    expect(stored.get(storageKey)).toBe(previous)
  })

  it('recovers from unavailable storage and corrupt saves', () => {
    stored.set(storageKey, '{invalid')
    expect(loadProject()).toBeNull()

    vi.stubGlobal('localStorage', {
      getItem: () => { throw new DOMException('Storage is blocked', 'SecurityError') },
    })
    expect(loadProject()).toBeNull()
    expect(saveProject(initialProject())).toBe(false)
  })
})
