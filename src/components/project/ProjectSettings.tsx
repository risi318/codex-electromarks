import { ZoneStyleSettings } from './ZoneStyleSettings'
import type { Project, ProjectSettingsUpdate } from '../../domain/types'
import { FormField, TextInput } from '../ui/FormField'

type ProjectSettingsProps = { project: Project; onChange: (update: ProjectSettingsUpdate) => void }
export function ProjectSettings({ project, onChange }: ProjectSettingsProps) {
  const updatePositiveInteger = (field: 'rails' | 'modulesPerRail') => (raw: string) => {
    const value = Number(raw)
    if (Number.isInteger(value) && value > 0) onChange({ [field]: value })
  }
  const updateModuleWidth = (raw: string) => {
    const moduleWidthMm = Number(raw)
    if (Number.isFinite(moduleWidthMm) && moduleWidthMm > 0) onChange({ moduleWidthMm })
  }

  return <section className="project-bar">
    <FormField label="Название">
      <TextInput value={project.name} onValueChange={name => onChange({ name })} />
    </FormField>
    <FormField label="Реек">
      <TextInput type="number" min={1} step={1} value={project.rails} onValueChange={updatePositiveInteger('rails')} />
    </FormField>
    <FormField label="Модулей в рейке">
      <TextInput type="number" min={1} step={1} value={project.modulesPerRail} onValueChange={updatePositiveInteger('modulesPerRail')} />
    </FormField>
    <FormField label="Ширина модуля, мм">
      <TextInput type="number" min={1} step={0.1} value={project.moduleWidthMm} onValueChange={updateModuleWidth} />
    </FormField>
    <ZoneStyleSettings
      heights={project.zoneHeights}
      styles={project.zoneStyles}
      onHeightsChange={zoneHeights => onChange({ zoneHeights })}
      onChange={zoneStyles => onChange({ zoneStyles })}
    />
  </section>
}
