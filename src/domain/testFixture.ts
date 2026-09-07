import { createLabel, findFree, normalizeProject } from './project'
import type { Label, Project } from './types'

type FixtureLabel = { span: number; description: string; iconId: string; phase?: string }

const twoPoleLoads: FixtureLabel[] = [
  ...Array.from({ length: 6 }, (_, index) => ({ span: 2, description: 'Розетки', iconId: 'socket', phase: `L${index % 3 + 1}+N` })),
  ...Array.from({ length: 6 }, (_, index) => ({ span: 2, description: 'Освещение', iconId: 'light', phase: `L${index % 3 + 1}+N` })),
  { span: 2, description: 'Стиральная машина', iconId: 'washer', phase: 'L1+N' },
  { span: 2, description: 'Сушильная машина', iconId: 'dryer', phase: 'L2+N' },
  { span: 2, description: 'Посудомоечная машина', iconId: 'dishwasher', phase: 'L3+N' },
  { span: 2, description: 'Санузел', iconId: 'rcd', phase: 'L1+N' },
]

const singlePoleLoads: FixtureLabel[] = [
  { span: 1, description: 'Холодильник', iconId: 'fridge', phase: 'L1' },
  { span: 1, description: 'Кондиционер', iconId: 'ac', phase: 'L2' },
  { span: 1, description: 'Ворота', iconId: 'gate', phase: 'L3' },
  { span: 1, description: 'Кофемашина', iconId: 'coffee', phase: 'L1' },
  { span: 1, description: 'Микроволновка', iconId: 'microwave', phase: 'L2' },
]

const fixture: FixtureLabel[] = [
  { span: 4, description: 'Вводной автомат', iconId: 'general', phase: 'ВВОД' },
  ...twoPoleLoads,
  ...singlePoleLoads,
]

export function appendTestFixture(project: Project): { project: Project; added: number } {
  let draft = project
  const added: Label[] = []

  fixture.forEach(specification => {
    const slot = findFree(draft, specification.span)
    if (!slot) return
    const base = createLabel(slot.rail, slot.start, draft.zoneStyles)
    const label: Label = {
      ...base,
      span: specification.span,
      iconId: specification.iconId,
      top: { ...base.top, text: specification.phase ?? 'L1' },
      bottom: { ...base.bottom, text: specification.description },
    }
    added.push(label)
    draft = { ...draft, labels: [...draft.labels, label] }
  })

  return { project: normalizeProject(draft), added: added.length }
}
