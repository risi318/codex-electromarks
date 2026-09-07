import { memo, type DragEvent } from 'react'
import { labelHeight, MM_TO_PX } from '../../domain/project'
import { LabelArtwork } from '../preview/LabelArtwork'
import type { IconItem, Label } from '../../domain/types'

export type DragLabel = { id: string; offset: number }
type LabelCardProps = {
  label: Label
  icon: IconItem
  moduleWidth: number
  selected: boolean
  hideBottomText: boolean
  onSelect: (id: string) => void
  onDragChange: (drag: DragLabel | null) => void
  onDragEnd: () => void
}

export const LabelCard = memo(function LabelCard({ label, icon, moduleWidth, selected, hideBottomText, onSelect, onDragChange, onDragEnd }: LabelCardProps) {
  const startDrag = (event: DragEvent<HTMLButtonElement>): void => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', label.id)
    onSelect(label.id)
    const offset = Math.floor((event.clientX - event.currentTarget.getBoundingClientRect().left) / moduleWidth)
    onDragChange({ id: label.id, offset: Math.min(label.span - 1, Math.max(0, offset)) })
  }

  return <button aria-pressed={selected} draggable onDragStart={startDrag} onDragEnd={onDragEnd} title="Перетащите наклейку на свободные модули" className="grid-label" style={{ gridColumn: `${label.start + 1} / span ${label.span}`, gridRow: 1, height: labelHeight(label) * MM_TO_PX, margin: 0, alignSelf: 'start', border: 0 }} onClick={() => onSelect(label.id)}>
    <LabelArtwork icon={icon} label={label} hideBottomText={hideBottomText} />
  </button>
})
