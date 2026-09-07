import { describe, expect, it } from 'vitest'
import { canPlaceLabel, labelsOutsideBounds, moveLabel } from './placement'
import { mergedGroupBoundaryPositions, visibleModuleDividerPositions } from './labelGroups'
import { createZone, initialProject } from './project'
import type { Label } from './types'

const makeLabel = (id: string, rail: number, start: number, span: number): Label => ({
  id,
  rail,
  start,
  span,
  heightMm: 32,
  iconId: 'general',
  iconScale: 100,
  top: createZone('L1'),
  middle: createZone('', true, '#fff0d5', '#1e3a8a', 14, 20),
  bottom: createZone('Группа'),
  numberOverride: '',
})

describe('placement', () => {
  it('prevents overlap when the rail, start or width changes', () => {
    const project = {
      ...initialProject(),
      labels: [makeLabel('first', 0, 0, 2), makeLabel('second', 0, 3, 2)],
    }

    expect(canPlaceLabel(project, 'second', 0, 1, 2)).toBe(false)
    expect(canPlaceLabel(project, 'second', 1, 1, 2)).toBe(true)
    expect(canPlaceLabel(project, 'second', 0, 3, 3)).toBe(true)
    expect(canPlaceLabel(project, 'second', 0, 11, 2)).toBe(false)
  })

  it('leaves the project untouched after an invalid drag', () => {
    const project = {
      ...initialProject(),
      labels: [makeLabel('first', 0, 0, 2), makeLabel('second', 0, 3, 2)],
    }

    expect(moveLabel(project, 'second', 0, 1)).toBe(project)
  })

  it('finds labels that would be lost after shrinking the shield', () => {
    const labels = [makeLabel('inside', 0, 0, 1), makeLabel('wide', 0, 10, 2), makeLabel('lower', 4, 0, 1)]

    expect(labelsOutsideBounds(labels, 4, 11).map(label => label.id)).toEqual(['wide', 'lower'])
  })

  it('shows full-height lines only at merged-group edges', () => {
    const groupedLeft = makeLabel('group-left', 0, 0, 1)
    const groupedRight = makeLabel('group-right', 0, 1, 1)
    const standaloneLeft = { ...makeLabel('standalone-left', 0, 2, 1), bottom: createZone('Посудомоечная машина') }
    const standaloneRight = { ...makeLabel('standalone-right', 0, 3, 1), bottom: createZone('Санузел') }
    const labels = [groupedLeft, groupedRight, standaloneLeft, standaloneRight]

    expect(mergedGroupBoundaryPositions(labels)).toEqual([2])
    expect(visibleModuleDividerPositions(labels, 6)).toEqual([4, 5])
  })
})
