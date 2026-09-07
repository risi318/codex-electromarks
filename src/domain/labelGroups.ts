import { labelHeight } from './project'
import type { Label, Zone } from './types'

const sameZone = (left: Zone, right: Zone): boolean =>
  left.enabled === right.enabled &&
  left.text === right.text &&
  left.background === right.background &&
  left.color === right.color &&
  left.fontSize === right.fontSize

/** Groups labels whose lower zones form one continuous, identically styled block. */
export function groupAdjacentBottomZones(labels: Label[]): Label[][] {
  const groups: Label[][] = []
  const sorted = [...labels].sort((left, right) => left.rail - right.rail || left.start - right.start)

  sorted.forEach(label => {
    const group = groups.at(-1)
    const previous = group?.at(-1)
    const joinsPrevious = previous &&
      previous.rail === label.rail &&
      previous.start + previous.span === label.start &&
      previous.bottom.enabled && label.bottom.enabled &&
      labelHeight(previous) === labelHeight(label) &&
      sameZone(previous.bottom, label.bottom)

    if (group && joinsPrevious) group.push(label)
    else groups.push([label])
  })

  return groups
}

/** Module boundaries that remain visible because at least one neighbouring cell is empty. */
export function visibleModuleDividerPositions(labels: Label[], modulesPerRail: number): number[] {
  const labelAt = (module: number) => labels.find(label => module >= label.start && module < label.start + label.span)

  return Array.from({ length: Math.max(0, modulesPerRail - 1) }, (_, index) => index + 1)
    .filter(position => !(labelAt(position - 1) && labelAt(position)))
}

/** Full-height cut lines appear only at the outer edges of merged lower-zone groups. */
export function mergedGroupBoundaryPositions(labels: Label[]): number[] {
  const mergedGroups = groupAdjacentBottomZones(labels).filter(group => group.length > 1)
  const groupByLabelId = new Map(mergedGroups.flatMap((group, groupIndex) =>
    group.map(label => [label.id, groupIndex] as const),
  ))
  const sorted = [...labels].sort((left, right) => left.start - right.start)
  const positions = new Set<number>()

  for (let index = 1; index < sorted.length; index += 1) {
    const left = sorted[index - 1]
    const right = sorted[index]
    if (left.start + left.span !== right.start) continue

    const leftGroup = groupByLabelId.get(left.id)
    const rightGroup = groupByLabelId.get(right.id)
    const touchesMergedGroup = leftGroup !== undefined || rightGroup !== undefined
    if (touchesMergedGroup && leftGroup !== rightGroup) positions.add(right.start)
  }

  return [...positions]
}
