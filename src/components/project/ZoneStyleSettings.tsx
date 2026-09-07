import type { ZoneHeights, ZoneName, ZoneStyles } from '../../domain/types'
import { ColorInput, FormField, TextInput } from '../ui/FormField'

type ZoneStyleSettingsProps = {
  heights: ZoneHeights
  styles: ZoneStyles
  onHeightsChange: (heights: ZoneHeights) => void
  onChange: (styles: ZoneStyles) => void
}

const fields: { name: ZoneName; label: string; minHeight: number }[] = [
  { name: 'top', label: 'Верхняя зона', minHeight: 2 },
  { name: 'middle', label: 'Средняя зона', minHeight: 4 },
  { name: 'bottom', label: 'Нижняя зона', minHeight: 2 },
]

export function ZoneStyleSettings({ heights, styles, onHeightsChange, onChange }: ZoneStyleSettingsProps) {
  const update = (name: ZoneName, change: Partial<ZoneStyles[ZoneName]>) => onChange({ ...styles, [name]: { ...styles[name], ...change } })

  return <fieldset className="zone-style-settings">
    <legend>Оформление зон · применить ко всем наклейкам</legend>
    {fields.map(({ name, label, minHeight }) => <div className="zone-style-group" key={name}>
      <strong>{label}</strong>
      <FormField label="Высота, мм"><TextInput type="number" min={minHeight} step={0.5} value={heights[name]} onValueChange={raw => {
        const value = Number(raw)
        if (Number.isFinite(value) && value >= minHeight) onHeightsChange({ ...heights, [name]: value })
      }} /></FormField>
      <FormField label="Размер"><TextInput type="number" min={6} max={30} value={styles[name].fontSize} onValueChange={raw => update(name, { fontSize: Math.max(6, Number(raw) || styles[name].fontSize) })} /></FormField>
      <FormField label="Цвет текста"><ColorInput ariaLabel={`${label}: цвет текста`} value={styles[name].color} onValueChange={color => update(name, { color })} /></FormField>
      <FormField label="Фон"><ColorInput ariaLabel={`${label}: фон`} value={styles[name].background} onValueChange={background => update(name, { background })} /></FormField>
    </div>)}
  </fieldset>
}
