import { normalizeProject, occupied } from './project'
import type { IconItem, Label, Project, Zone, ZoneHeights, ZoneName, ZoneStyles } from './types'

type UnknownRecord = Record<string, unknown>

const zoneNames: ZoneName[] = ['top', 'middle', 'bottom']

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFinitePositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function isColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
}

function isZone(value: unknown): value is Zone {
  return isRecord(value) &&
    typeof value.enabled === 'boolean' &&
    typeof value.text === 'string' &&
    isColor(value.background) &&
    isColor(value.color) &&
    isFinitePositive(value.fontSize) &&
    isFinitePositive(value.heightMm)
}

function isZoneHeights(value: unknown): value is ZoneHeights {
  return isRecord(value) && zoneNames.every(name => isFinitePositive(value[name]))
}

function isZoneStyles(value: unknown): value is ZoneStyles {
  return isRecord(value) && zoneNames.every(name => {
    const style = value[name]
    return isRecord(style) && isColor(style.background) && isColor(style.color) && isFinitePositive(style.fontSize)
  })
}

function isLabel(value: unknown): value is Label {
  return isRecord(value) &&
    typeof value.id === 'string' && value.id.length > 0 &&
    isNonNegativeInteger(value.rail) &&
    isNonNegativeInteger(value.start) &&
    isPositiveInteger(value.span) &&
    isFinitePositive(value.heightMm) &&
    typeof value.iconId === 'string' && value.iconId.length > 0 &&
    (value.iconScale === undefined || isFinitePositive(value.iconScale)) &&
    isZone(value.top) &&
    isZone(value.middle) &&
    isZone(value.bottom) &&
    (value.numberOverride === undefined || typeof value.numberOverride === 'string')
}

function isIcon(value: unknown): value is IconItem {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id || typeof value.label !== 'string' || typeof value.category !== 'string') return false
  if (value.symbol !== undefined && typeof value.symbol !== 'string') return false
  if (value.dataUrl !== undefined && typeof value.dataUrl !== 'string') return false
  if (value.paths === undefined) return true
  return Array.isArray(value.paths) && value.paths.every(path =>
    isRecord(path) &&
    typeof path.path === 'string' &&
    isColor(path.color) &&
    (path.transform === undefined || typeof path.transform === 'string'),
  )
}

export class ProjectValidationError extends Error {
  constructor(message: string) {
    super(`Некорректный файл проекта: ${message}`)
    this.name = 'ProjectValidationError'
  }
}

export function validateProject(value: unknown): Project {
  if (!isRecord(value)) throw new ProjectValidationError('ожидался объект.')
  if (typeof value.name !== 'string') throw new ProjectValidationError('неверное название.')
  if (!isPositiveInteger(value.rails)) throw new ProjectValidationError('число реек должно быть целым и больше нуля.')
  if (!isPositiveInteger(value.modulesPerRail)) throw new ProjectValidationError('число модулей должно быть целым и больше нуля.')
  if (!isFinitePositive(value.moduleWidthMm)) throw new ProjectValidationError('ширина модуля должна быть больше нуля.')
  if (!Array.isArray(value.labels) || !value.labels.every(isLabel)) throw new ProjectValidationError('повреждены данные наклеек.')
  if (!Array.isArray(value.icons) || !value.icons.every(isIcon)) throw new ProjectValidationError('повреждён каталог пиктограмм.')
  if (value.zoneHeights !== undefined && !isZoneHeights(value.zoneHeights)) throw new ProjectValidationError('повреждены общие высоты зон.')
  if (value.zoneStyles !== undefined && !isZoneStyles(value.zoneStyles)) throw new ProjectValidationError('повреждены общие стили зон.')

  const ids = new Set<string>()
  for (const label of value.labels) {
    if (ids.has(label.id)) throw new ProjectValidationError(`повторяется идентификатор наклейки «${label.id}».`)
    ids.add(label.id)
    if (label.rail >= value.rails || label.start + label.span > value.modulesPerRail) {
      throw new ProjectValidationError(`наклейка «${label.id}» находится за границами щита.`)
    }
    if (occupied(value.labels, label.rail, label.start, label.span, label.id)) {
      throw new ProjectValidationError(`наклейка «${label.id}» пересекается с другой наклейкой.`)
    }
  }

  const project = normalizeProject(value as unknown as Project)
  const iconIds = new Set(project.icons.map(icon => icon.id))
  if (project.labels.some(label => !iconIds.has(label.iconId))) {
    throw new ProjectValidationError('одна из наклеек ссылается на неизвестную пиктограмму.')
  }

  return project
}

export function parseProjectJson(source: string): Project {
  let value: unknown
  try {
    value = JSON.parse(source)
  } catch {
    throw new ProjectValidationError('файл не содержит корректный JSON.')
  }
  return validateProject(value)
}
