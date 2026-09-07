export type ZoneName = 'top' | 'middle' | 'bottom'

export type Zone = { enabled: boolean; text: string; background: string; color: string; fontSize: number; heightMm: number }
export type IconPath = { path: string; color: string; transform?: string }
export type IconItem = { id: string; label: string; symbol?: string; dataUrl?: string; paths?: IconPath[]; category: string }
export type Label = { id: string; rail: number; start: number; span: number; heightMm: number; iconId: string; iconScale: number; top: Zone; middle: Zone; bottom: Zone; numberOverride: string }
export type ZoneHeights = Record<ZoneName, number>
export type ZoneStyle = Pick<Zone, 'background' | 'color' | 'fontSize'>
export type ZoneStyles = Record<ZoneName, ZoneStyle>
export type Project = { zoneHeights: ZoneHeights; zoneStyles: ZoneStyles; name: string; rails: number; modulesPerRail: number; moduleWidthMm: number; labels: Label[]; icons: IconItem[] }
export type ProjectSettingsUpdate = Partial<Pick<Project, 'name' | 'rails' | 'modulesPerRail' | 'moduleWidthMm' | 'zoneHeights' | 'zoneStyles'>>

export type LabelUpdate = Partial<Label>
export type ZoneUpdate = Partial<Omit<Zone, 'heightMm'>>
