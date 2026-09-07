import type { Zone, ZoneUpdate } from '../../domain/types'
import { Button } from '../ui/Button'
import { FormField, TextInput } from '../ui/FormField'
import { ColorPresetInput } from '../ui/ColorPresetInput'
import { backgroundColorPresets, textColorPresets } from '../../sources/colors/presets'

type ZoneEditorProps = { title: string; value: Zone; onChange: (update: ZoneUpdate) => void }
export function ZoneEditor({ title, value, onChange }: ZoneEditorProps) {
  const setNumber = (property: 'fontSize', fallback: number, minimum: number) => (raw: string) => onChange({ [property]: Math.max(minimum, Number(raw) || fallback) })
  return <section className="zone-card"><div className="zone-title"><strong>{title}</strong>{value.enabled ? <Button variant="danger" className="zone-delete" onClick={() => onChange({ enabled: false, text: '' })}>Удалить зону</Button> : <Button variant="add" className="zone-add" onClick={() => onChange({ enabled: true })}>+ Добавить зону</Button>}</div>{value.enabled && <><div className="zone-primary-row"><FormField label="Текст"><TextInput value={value.text} onValueChange={text => onChange({ text })} /></FormField><FormField label="Размер"><TextInput type="number" min={6} max={30} value={value.fontSize} onValueChange={setNumber('fontSize', 10, 6)} /></FormField></div><div className="two-cols"><FormField label="Фон"><ColorPresetInput ariaLabel="Фон зоны" presets={backgroundColorPresets} value={value.background} onValueChange={background => onChange({ background })} /></FormField><FormField label="Цвет"><ColorPresetInput ariaLabel="Цвет текста зоны" presets={textColorPresets} value={value.color} onValueChange={color => onChange({ color })} /></FormField></div></>}</section>
}
