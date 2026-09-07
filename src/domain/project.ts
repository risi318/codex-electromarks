import { builtInIcons } from '../sources/icons/catalog'
import type { Label, Project, Zone, ZoneStyles } from './types'

const builtInIconIds = new Set(builtInIcons.map(icon => icon.id))

export const DEFAULT_ZONE_STYLES: ZoneStyles = {
  top: { background: '#fef3c7', color: '#854d0e', fontSize: 9 },
  middle: { background: '#fff0d5', color: '#1e3a8a', fontSize: 14 },
  bottom: { background: '#ffffff', color: '#172033', fontSize: 9 },
}

export const MM_TO_PX = 96 / 25.4
export const zoneHeight = (zone: Zone, fallback: number): number => zone.heightMm || fallback
export const labelHeight = (label: Label): number => (label.top.enabled ? zoneHeight(label.top, 6) : 0) + zoneHeight(label.middle, 20) + (label.bottom.enabled ? zoneHeight(label.bottom, 6) : 0)
export const occupied = (labels: Label[], rail: number, start: number, span: number, except?: string): boolean => labels.some(label => label.id !== except && label.rail === rail && start < label.start + label.span && start + span > label.start)
export const findFree = (project: Project, span: number, fromRail = 0): Pick<Label, 'rail' | 'start'> | null => {
  for (let rail = fromRail; rail < project.rails; rail += 1) for (let start = 0; start <= project.modulesPerRail - span; start += 1) if (!occupied(project.labels, rail, start, span)) return { rail, start }
  return null
}
export const applyZoneStyles = (labels: Label[], styles: ZoneStyles): Label[] => labels.map(label => ({
  ...label,
  top: { ...label.top, ...styles.top },
  middle: { ...label.middle, ...styles.middle },
  bottom: { ...label.bottom, ...styles.bottom },
}))
export const normalizeProject = (project: Project): Project => {
  // Older projects inherit the first label's dimensions when adopting shared heights.
  const first = project.labels[0]
  const zoneHeights = project.zoneHeights ?? {
    top: first ? zoneHeight(first.top, 6) : 6,
    middle: first ? zoneHeight(first.middle, 20) : 20,
    bottom: first ? zoneHeight(first.bottom, 6) : 6,
  }
  const zoneStyles = project.zoneStyles ?? {
    top: first ? { background: first.top.background, color: first.top.color, fontSize: first.top.fontSize } : { ...DEFAULT_ZONE_STYLES.top },
    middle: first ? { background: first.middle.background, color: first.middle.color, fontSize: first.middle.fontSize } : { ...DEFAULT_ZONE_STYLES.middle },
    bottom: first ? { background: first.bottom.background, color: first.bottom.color, fontSize: first.bottom.fontSize } : { ...DEFAULT_ZONE_STYLES.bottom },
  }
  const customIcons = (project.icons ?? []).filter(icon => !builtInIconIds.has(icon.id))
  const icons = [...builtInIcons, ...customIcons]
  const labels = project.labels.map(label => {
    const iconScale = Math.max(25, Math.min(200, label.iconScale ?? 100))
    const numberOverride = label.numberOverride ?? ''
    const middleBackground = label.middle.background === '#eff6ff' ? '#fff0d5' : label.middle.background
    const top = label.top.heightMm === zoneHeights.top ? label.top : { ...label.top, heightMm: zoneHeights.top }
    const middle = label.middle.heightMm === zoneHeights.middle && label.middle.background === middleBackground
      ? label.middle
      : { ...label.middle, background: middleBackground, heightMm: zoneHeights.middle }
    const bottom = label.bottom.heightMm === zoneHeights.bottom ? label.bottom : { ...label.bottom, heightMm: zoneHeights.bottom }

    if (iconScale === label.iconScale && numberOverride === label.numberOverride && top === label.top && middle === label.middle && bottom === label.bottom) return label
    return { ...label, iconScale, numberOverride, top, middle, bottom }
  })

  // Keep unchanged data stable so unrelated project settings do not invalidate previews.
  return {
    ...project,
    zoneHeights,
    zoneStyles,
    icons: project.icons?.length === icons.length && icons.every((icon, index) => icon === project.icons[index]) ? project.icons : icons,
    labels: labels.every((label, index) => label === project.labels[index]) ? project.labels : labels,
  }
}
export const initialProject = (): Project => ({ zoneHeights: { top: 6, middle: 20, bottom: 6 }, zoneStyles: { top: { ...DEFAULT_ZONE_STYLES.top }, middle: { ...DEFAULT_ZONE_STYLES.middle }, bottom: { ...DEFAULT_ZONE_STYLES.bottom } }, name: 'Мой электрический щит', rails: 5, modulesPerRail: 12, moduleWidthMm: 17.5, labels: [], icons: builtInIcons })
export const createZone = (text = '', enabled = true, background = '#ffffff', color = '#172033', fontSize = 11, heightMm = 6): Zone => ({ enabled, text, background, color, fontSize, heightMm })
export const createLabel = (rail: number, start: number, styles = DEFAULT_ZONE_STYLES): Label => ({ id: crypto.randomUUID(), rail, start, span: 1, heightMm: 32, iconId: 'general', iconScale: 100, top: createZone('L1', true, styles.top.background, styles.top.color, styles.top.fontSize, 6), middle: createZone('', true, styles.middle.background, styles.middle.color, styles.middle.fontSize, 20), bottom: createZone('Новая группа', true, styles.bottom.background, styles.bottom.color, styles.bottom.fontSize, 6), numberOverride: '' })
