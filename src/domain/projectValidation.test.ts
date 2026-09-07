import { describe, expect, it } from 'vitest'
import { initialProject } from './project'
import { ProjectValidationError, parseProjectJson, validateProject } from './projectValidation'

describe('project validation', () => {
  it('accepts an exported project', () => {
    const project = initialProject()

    expect(parseProjectJson(JSON.stringify(project))).toMatchObject({
      name: project.name,
      rails: 5,
      modulesPerRail: 12,
    })
  })

  it('rejects malformed dimensions', () => {
    expect(() => validateProject({ ...initialProject(), rails: 1.5 })).toThrow(ProjectValidationError)
    expect(() => validateProject({ ...initialProject(), moduleWidthMm: Number.POSITIVE_INFINITY })).toThrow(ProjectValidationError)
  })

  it('rejects labels outside the shield and overlapping labels', () => {
    const project = initialProject()
    const zone = { enabled: true, text: '', background: '#ffffff', color: '#000000', fontSize: 10, heightMm: 6 }
    const label = { id: 'one', rail: 0, start: 11, span: 2, heightMm: 32, iconId: 'general', iconScale: 100, top: zone, middle: zone, bottom: zone, numberOverride: '' }

    expect(() => validateProject({ ...project, labels: [label] })).toThrow(/за границами/)
    expect(() => validateProject({
      ...project,
      labels: [
        { ...label, start: 0 },
        { ...label, id: 'two', start: 1 },
      ],
    })).toThrow(/пересекается/)
  })

  it('rejects invalid JSON with a useful message', () => {
    expect(() => parseProjectJson('{bad json')).toThrow(/корректный JSON/)
  })
})
