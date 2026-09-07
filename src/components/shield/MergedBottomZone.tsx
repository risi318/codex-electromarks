import { labelHeight, MM_TO_PX, zoneHeight } from '../../domain/project'
import type { Label } from '../../domain/types'

type MergedBottomZoneProps = { labels: Label[] }

export function MergedBottomZone({ labels }: MergedBottomZoneProps) {
  const first = labels[0]
  const last = labels.at(-1) ?? first
  const zone = first.bottom
  const height = zoneHeight(zone, 6) * MM_TO_PX

  return <div className="merged-bottom-zone" style={{
    gridColumn: `${first.start + 1} / ${last.start + last.span + 1}`,
    gridRow: 1,
    alignSelf: 'start',
    marginTop: labelHeight(first) * MM_TO_PX - height,
    height,
    background: zone.background,
    color: zone.color,
    fontSize: zone.fontSize,
  }}>{zone.text}</div>
}
