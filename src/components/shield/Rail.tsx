import { MM_TO_PX, labelHeight } from '../../domain/project'
import { useCallback, useMemo, useState, type DragEvent } from 'react'
import { canMoveLabel } from '../../domain/placement'
import { groupAdjacentBottomZones, mergedGroupBoundaryPositions, visibleModuleDividerPositions } from '../../domain/labelGroups'
import type { IconItem, Label, Project } from '../../domain/types'
import { LabelCard, type DragLabel } from './LabelCard'
import { ModuleCell } from './ModuleCell'
import { MergedBottomZone } from './MergedBottomZone'
import { SelectionOutline } from './SelectionOutline'

type RailProps = {
  index: number
  labels: Label[]
  project: Project
  iconsById: ReadonlyMap<string, IconItem>
  selectedId: string | null
  onSelect: (id: string) => void
  drag: DragLabel | null
  onDragChange: (drag: DragLabel | null) => void
  onMove: (id: string, rail: number, start: number) => void
}
export function Rail({ index, labels, project, iconsById, selectedId, onSelect, drag, onDragChange, onMove }: RailProps) {
  const [hover, setHover] = useState<number | null>(null)
  const width = project.moduleWidthMm * MM_TO_PX
  const dragged = project.labels.find(label => label.id === drag?.id)
  const selectedLabel = labels.find(label => label.id === selectedId)
  const { height, bottomGroups, groupBoundaries, mergedBottomIds } = useMemo(() => {
    const bottomGroups = groupAdjacentBottomZones(labels).filter(group => group.length > 1)
    return {
      height: Math.max(32, ...labels.map(labelHeight)) * MM_TO_PX,
      bottomGroups,
      groupBoundaries: mergedGroupBoundaryPositions(labels),
      mergedBottomIds: new Set(bottomGroups.flatMap(group => group.map(label => label.id))),
    }
  }, [labels])
  const moduleDividers = useMemo(() => visibleModuleDividerPositions(labels, project.modulesPerRail), [labels, project.modulesPerRail])
  const endDrag = useCallback(() => {
    onDragChange(null)
    setHover(null)
  }, [onDragChange])
  const target = (event: DragEvent<HTMLDivElement>) => Math.floor((event.clientX - event.currentTarget.getBoundingClientRect().left - event.currentTarget.clientLeft) / width) - (drag?.offset ?? 0)

  const dragOver = (event: DragEvent<HTMLDivElement>): void => {
    if (!drag) return
    event.preventDefault()
    const start = target(event)
    setHover(start)
    event.dataTransfer.dropEffect = canMoveLabel(project, drag.id, index, start) ? 'move' : 'none'
  }
  const drop = (event: DragEvent<HTMLDivElement>): void => {
    if (!drag) return
    event.preventDefault()
    const start = target(event)
    if (canMoveLabel(project, drag.id, index, start)) onMove(drag.id, index, start)
    endDrag()
  }

  return <div className="rail"><span className="rail-name">Рейка {index + 1}</span><div className="grid"
    onDragOver={dragOver}
    onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHover(null) }}
    onDrop={drop}
    style={{ gridTemplateColumns: `repeat(${project.modulesPerRail}, ${width}px)`, gridTemplateRows: `${height}px` }}>
    {Array.from({ length: project.modulesPerRail }, (_, moduleIndex) => <ModuleCell key={moduleIndex} column={moduleIndex + 1} number={index * project.modulesPerRail + moduleIndex + 1} />)}
    {moduleDividers.map(position => <span aria-hidden className="module-divider" key={position} style={{ left: position * width }} />)}
    {labels.map(label => <LabelCard
      key={label.id}
      label={label}
      icon={iconsById.get(label.iconId) ?? project.icons[0]}
      moduleWidth={width}
      selected={label.id === selectedId}
      hideBottomText={mergedBottomIds.has(label.id)}
      onSelect={onSelect}
      onDragChange={onDragChange}
      onDragEnd={endDrag}
    />)}
    {bottomGroups.map(group => <MergedBottomZone key={group.map(label => label.id).join(':')} labels={group} />)}
    {groupBoundaries.map(position => <span aria-hidden className="group-boundary" key={position} style={{ left: position * width }} />)}
    {selectedLabel ? <SelectionOutline label={selectedLabel} moduleWidthMm={project.moduleWidthMm} /> : null}
    {dragged && drag && hover !== null ? <div aria-hidden className={`drop-preview ${canMoveLabel(project, drag.id, index, hover) ? 'drop-preview--valid' : 'drop-preview--invalid'}`} style={{ left: Math.max(0, hover) * width, width: Math.max(0, Math.min(dragged.span, project.modulesPerRail - Math.max(0, hover))) * width }} /> : null}
  </div></div>
}
