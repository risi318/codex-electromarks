import { memo, useRef } from 'react'
import type { IconItem } from '../../domain/types'
import { Button } from '../ui/Button'
import { IconGraphic } from '../ui/IconGraphic'

type IconPickerProps = { icons: IconItem[]; selectedId: string; onSelect: (id: string) => void; onUpload: () => void }
export const IconPicker = memo(function IconPicker({ icons, selectedId, onSelect, onUpload }: IconPickerProps) {
  const pickerRef = useRef<HTMLDetailsElement>(null)
  const selected = icons.find(icon => icon.id === selectedId) ?? icons[0]
  const close = () => pickerRef.current?.removeAttribute('open')

  return <details className="icon-picker-dropdown" ref={pickerRef}>
    <summary aria-label="Выбрать пиктограмму">
      {selected && <IconGraphic icon={selected} />}
      <span>{selected?.label ?? 'Выбрать пиктограмму'}</span>
      <i aria-hidden="true">⌄</i>
    </summary>
    <div className="icon-picker-popover">
      <div className="icon-picker">
        {icons.map(icon => <Button variant="icon" className={icon.id === selectedId ? 'active' : ''} key={icon.id} title={icon.label} onClick={() => { onSelect(icon.id); close() }}><IconGraphic icon={icon} /></Button>)}
        <Button variant="icon" className="upload" title="Загрузить SVG или PNG" onClick={() => { close(); onUpload() }}>+</Button>
      </div>
    </div>
  </details>
})
