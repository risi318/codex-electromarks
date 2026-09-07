import { useCallback, useEffect, useState } from 'react'
import { applyZoneStyles, createLabel, findFree, initialProject, normalizeProject } from '../domain/project'
import { labelsOutsideBounds, moveLabel } from '../domain/placement'
import type { IconItem, LabelUpdate, Project, ProjectSettingsUpdate, ZoneName, ZoneUpdate } from '../domain/types'
import { loadProject, saveProject } from '../lib/projectStorage'
import { appendTestFixture } from '../domain/testFixture'

/** Owns persisted project data; selection and drag state belong to the UI. */
export function useProjectState() {
  const [project, setProject] = useState<Project>(() => {
    const stored = loadProject()
    return stored ?? initialProject()
  })
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    setSaveFailed(!saveProject(project))
  }, [project])

  const updateSettings = (update: ProjectSettingsUpdate): void => {
    const rails = update.rails ?? project.rails
    const modulesPerRail = update.modulesPerRail ?? project.modulesPerRail
    const displacedLabels = labelsOutsideBounds(project.labels, rails, modulesPerRail)
    if (displacedLabels.length) {
      alert(`Нельзя уменьшить щит: за новыми границами останется наклеек — ${displacedLabels.length}. Сначала переместите или удалите их.`)
      return
    }

    setProject(current => {
      const next = { ...current, ...update }
      const labels = next.labels
      const styledLabels = update.zoneStyles ? applyZoneStyles(labels, update.zoneStyles) : labels
      return normalizeProject({ ...next, labels: styledLabels })
    })
  }

  const updateLabel = useCallback((id: string, update: LabelUpdate): void => {
    setProject(current => ({ ...current, labels: current.labels.map(label => label.id === id ? { ...label, ...update } : label) }))
  }, [])

  const updateZone = useCallback((id: string, name: ZoneName, update: ZoneUpdate): void => {
    setProject(current => ({ ...current, labels: current.labels.map(label => label.id === id ? { ...label, [name]: { ...label[name], ...update } } : label) }))
  }, [])

  const addLabel = (): string | null => {
    const slot = findFree(project, 1)
    if (!slot) return null
    const label = createLabel(slot.rail, slot.start, project.zoneStyles)
    setProject(current => normalizeProject({ ...current, labels: [...current.labels, label] }))
    return label.id
  }

  const duplicateLabel = (id: string): string | null => {
    const original = project.labels.find(label => label.id === id)
    if (!original) return null
    const slot = findFree(project, original.span, original.rail) ?? findFree(project, original.span)
    if (!slot) return null
    const copy = { ...original, ...slot, id: crypto.randomUUID(), numberOverride: '' }
    setProject(current => ({ ...current, labels: [...current.labels, copy] }))
    return copy.id
  }

  const removeLabel = (id: string): void => {
    setProject(current => ({ ...current, labels: current.labels.filter(label => label.id !== id) }))
  }

  const relocateLabel = useCallback((id: string, rail: number, start: number): void => {
    setProject(current => moveLabel(current, id, rail, start))
  }, [])

  const replaceProject = (imported: Project): void => setProject(normalizeProject(imported))

  const addIcon = (icon: IconItem, labelId: string | null): void => {
    setProject(current => ({
      ...current,
      icons: [...current.icons, icon],
      labels: current.labels.map(label => label.id === labelId ? { ...label, iconId: icon.id } : label),
    }))
  }

  const addTestFixture = (): number => {
    const result = appendTestFixture(project)
    setProject(result.project)
    return result.added
  }

  return { project, saveFailed, updateSettings, updateLabel, updateZone, addLabel, duplicateLabel, removeLabel, relocateLabel, replaceProject, addIcon, addTestFixture }
}
