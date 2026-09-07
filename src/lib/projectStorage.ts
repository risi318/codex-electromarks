import type { Project } from '../domain/types'
import { parseProjectJson } from '../domain/projectValidation'
import { builtInIcons } from '../sources/icons/catalog'

const STORAGE_KEY = 'electromarks-project-v1'
const builtInIconIds = new Set(builtInIcons.map(icon => icon.id))
export const loadProject = (): Project | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? parseProjectJson(saved) : null
  } catch {
    return null
  }
}
export const saveProject = (project: Project): boolean => {
  try {
    // Built-in icons are restored by normalization; only uploaded icons need storage.
    const icons = project.icons.filter(icon => !builtInIconIds.has(icon.id))
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...project, icons }))
    return true
  } catch {
    return false
  }
}
export const downloadProject = (project: Project): void => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${project.name || 'electromarks'}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export { parseProjectJson }
