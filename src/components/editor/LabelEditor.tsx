import { useCallback } from 'react'
import { labelHeight } from '../../domain/project'
import { canPlaceLabel } from '../../domain/placement'
import type { Label, Project, LabelUpdate, ZoneName, ZoneUpdate } from '../../domain/types'
import { FormField, TextInput } from '../ui/FormField'
import { ColorPresetInput } from '../ui/ColorPresetInput'
import { RangeInput } from '../ui/RangeInput'
import { backgroundColorPresets, textColorPresets } from '../../sources/colors/presets'
import { IconPicker } from './IconPicker'
import { ZoneEditor } from './ZoneEditor'

type LabelEditorProps = {
  project: Project
  label: Label
  onUpdate: (update: LabelUpdate) => void
  onZoneUpdate: (name: ZoneName, update: ZoneUpdate) => void
  onUploadIcon: () => void
}

export function LabelEditor({ project, label, onUpdate, onZoneUpdate, onUploadIcon }: LabelEditorProps) {
  const selectIcon = useCallback((iconId: string) => onUpdate({ iconId }), [onUpdate])
  const setSpan = (value: string) => {
    const span = Number(value)
    if (!canPlaceLabel(project, label.id, label.rail, label.start, span)) return alert('Выбранная ширина пересекается с другой наклейкой или выходит за пределы рейки.')
    onUpdate({ span })
  }
  const setPosition = (value: string) => {
    const start = Number(value) - 1
    if (!canPlaceLabel(project, label.id, label.rail, start, label.span)) return alert('Эта позиция занята или находится вне рейки.')
    onUpdate({ start })
  }
  const setRail = (value: string) => {
    const rail = Number(value) - 1
    if (!canPlaceLabel(project, label.id, rail, label.start, label.span)) return alert('На выбранной рейке эти модули уже заняты или находятся вне диапазона.')
    onUpdate({ rail })
  }
  const setIconScale = (value: number) => onUpdate({ iconScale: Math.max(25, Math.min(200, value || 100)) })

  return <div className="editor-content">
    <div className="dimensions">
      <FormField label="Рейка"><TextInput type="number" min={1} max={project.rails} value={label.rail + 1} onValueChange={setRail} /></FormField>
      <FormField label="Начальный модуль"><TextInput type="number" min={1} max={project.modulesPerRail} value={label.start + 1} onValueChange={setPosition} /></FormField>
      <FormField label="Ширина, модулей"><TextInput type="number" min={1} max={project.modulesPerRail} value={label.span} onValueChange={setSpan} /></FormField>
      <FormField label="Итоговая высота, мм"><output>{labelHeight(label)}</output></FormField>
    </div>
    <ZoneEditor title="Верхняя зона — фаза" value={label.top} onChange={update => onZoneUpdate('top', update)} />
    <section className="zone-card middle-zone">
      <div className="zone-title"><strong>Центральная зона</strong><span>пиктограмма и номер</span></div>
      <IconPicker icons={project.icons} selectedId={label.iconId} onSelect={selectIcon} onUpload={onUploadIcon} />
      <div className="two-cols">
        <FormField label="Фон"><ColorPresetInput ariaLabel="Фон центральной зоны" presets={backgroundColorPresets} value={label.middle.background} onValueChange={background => onZoneUpdate('middle', { background })} /></FormField>
        <FormField label="Цвет номера"><ColorPresetInput ariaLabel="Цвет номера" presets={textColorPresets} value={label.middle.color} onValueChange={color => onZoneUpdate('middle', { color })} /></FormField>
      </div>
      <FormField label="Масштаб пиктограммы"><RangeInput min={25} max={200} step={5} value={label.iconScale ?? 100} onValueChange={setIconScale} formatValue={value => `${value}%`} /></FormField>
      <div className="two-cols number-settings-row">
        <FormField label="Номер аппарата"><TextInput placeholder="Пусто — без номера" value={label.numberOverride} onValueChange={numberOverride => onUpdate({ numberOverride })} /></FormField>
        <FormField label="Размер"><TextInput type="number" min={6} max={30} value={label.middle.fontSize} onValueChange={value => onZoneUpdate('middle', { fontSize: Number(value) || 14 })} /></FormField>
      </div>
    </section>
    <ZoneEditor title="Нижняя зона — описание" value={label.bottom} onChange={update => onZoneUpdate('bottom', update)} />
  </div>
}
