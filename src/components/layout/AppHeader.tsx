import type { ChangeEvent, RefObject } from 'react'
import { Button } from '../ui/Button'

type AppHeaderProps = {
  importInputRef: RefObject<HTMLInputElement | null>
  onDownloadProject: () => void
  onImportProject: (event: ChangeEvent<HTMLInputElement>) => void
  onExportPdf: () => void
  isExportingPdf: boolean
}

export function AppHeader({ importInputRef, onDownloadProject, onImportProject, onExportPdf, isExportingPdf }: AppHeaderProps) {
  return <header>
    <div>
      <span className="bolt">⚡</span>
      <h1>ElectroMarks</h1>
      <p>Наклейки для электрических щитов</p>
    </div>
    <div className="header-actions">
      <Button onClick={onDownloadProject}>Сохранить файл</Button>
      <Button onClick={() => importInputRef.current?.click()}>Открыть проект</Button>
      <Button variant="primary" disabled={isExportingPdf} onClick={onExportPdf}>{isExportingPdf ? 'Создание PDF…' : 'Экспорт PDF'}</Button>
      <input ref={importInputRef} type="file" accept="application/json,.json" hidden onChange={onImportProject} />
    </div>
  </header>
}
