import type { CSSProperties } from 'react'
import { MM_TO_PX, zoneHeight } from '../../domain/project'
import type { IconItem, Label, Zone } from '../../domain/types'
import { IconGraphic } from '../ui/IconGraphic'

type LabelArtworkProps = { icon: IconItem; label: Label; hideBottomText?: boolean }

const ICON_SIZE_AT_100_PERCENT = 24

/** The same physical-size artwork is used by the board and the editor preview. */
export function LabelArtwork({ icon, label, hideBottomText = false }: LabelArtworkProps) {
  const iconScale = Math.max(25, Math.min(200, label.iconScale ?? 100)) / 100
  const number = label.numberOverride.trim()
  const style = (zone: Zone, fallback: number): CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100%', height: zoneHeight(zone, fallback) * MM_TO_PX,
    flex: '0 0 auto', boxSizing: 'border-box', padding: '0 3px',
    background: zone.background, color: zone.color, fontSize: zone.fontSize,
    fontWeight: 700, lineHeight: 1.2, textAlign: 'center',
    whiteSpace: 'normal', overflowWrap: 'anywhere', overflow: 'hidden',
  })
  return <>
    {label.top.enabled && <span style={style(label.top, 6)}>{label.top.text}</span>}
    <span style={{ ...style(label.middle, 20), position: 'relative', flexDirection: 'column', boxShadow: label.top.enabled ? 'inset 0 0.5px 0 rgba(73, 70, 66, 0.4)' : undefined }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: ICON_SIZE_AT_100_PERCENT * iconScale, lineHeight: 1, flex: '0 1 auto', minHeight: 0 }}><IconGraphic icon={icon} style={{ display: 'block', width: ICON_SIZE_AT_100_PERCENT * iconScale, height: ICON_SIZE_AT_100_PERCENT * iconScale, maxWidth: '100%', objectFit: 'contain' }} /></span>
      {number && <b style={{ position: 'static', marginTop: 3, fontSize: label.middle.fontSize, lineHeight: 1.2, textAlign: 'center' }}>{number}</b>}
    </span>
    {label.bottom.enabled && <span style={{ ...style(label.bottom, 6), boxShadow: 'inset 0 0.5px 0 rgba(73, 70, 66, 0.4)' }}>{hideBottomText ? '' : label.bottom.text}</span>}
  </>
}
