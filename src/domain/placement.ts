import { occupied } from './project'
import type { Label, Project } from './types'

export function canPlaceLabel(project: Project, id: string, rail: number, start: number, span: number): boolean {
  return Number.isInteger(rail) &&
    Number.isInteger(start) &&
    Number.isInteger(span) &&
    span >= 1 &&
    rail >= 0 &&
    rail < project.rails &&
    start >= 0 &&
    start + span <= project.modulesPerRail &&
    !occupied(project.labels, rail, start, span, id)
}

export function canMoveLabel(project: Project, id: string, rail: number, start: number): boolean {
  const label = project.labels.find(item => item.id === id)
  return !!label && canPlaceLabel(project, id, rail, start, label.span)
}

export function moveLabel(project: Project, id: string, rail: number, start: number): Project {
  if (!canMoveLabel(project, id, rail, start)) return project
  return { ...project, labels: project.labels.map(label => label.id === id ? { ...label, rail, start } : label) }
}

export function labelsOutsideBounds(labels: Label[], rails: number, modulesPerRail: number): Label[] {
  return labels.filter(label => label.rail >= rails || label.start + label.span > modulesPerRail)
}
