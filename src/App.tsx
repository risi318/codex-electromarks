import { useCallback, useRef, useState, useTransition, type ChangeEvent } from 'react'
import { LabelEditor } from './components/editor/LabelEditor'
import { AppHeader } from './components/layout/AppHeader'
import { Panel, PanelHeading } from './components/layout/Panel'
import { ProjectSettings } from './components/project/ProjectSettings'
import { Shield } from './components/shield/Shield'
import { Button } from './components/ui/Button'
import { useProjectState } from './state/useProjectState'
import type { IconItem, LabelUpdate, ZoneName, ZoneUpdate } from './domain/types'
import { downloadProject, parseProjectJson } from './lib/projectStorage'

export default function App() {
  const projectState = useProjectState()
  const { project } = projectState
  const [isExportingPdf, startPdfExport] = useTransition()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)
  const selectedLabel = project.labels.find(label => label.id === selectedId) ?? null

  const { updateLabel, updateZone, relocateLabel } = projectState
  const updateSelectedLabel = useCallback((update: LabelUpdate): void => {
    if (selectedId) updateLabel(selectedId, update)
  }, [selectedId, updateLabel])
  const updateSelectedZone = useCallback((name: ZoneName, update: ZoneUpdate): void => {
    if (selectedId) updateZone(selectedId, name, update)
  }, [selectedId, updateZone])
  const moveLabel = useCallback((id: string, rail: number, start: number): void => {
    relocateLabel(id, rail, start)
    setSelectedId(id)
  }, [relocateLabel])
  const openIconUpload = useCallback(() => iconInputRef.current?.click(), [])
  const exportProjectPdf = (): void => {
    if (!project.labels.length) {
      alert('Добавьте хотя бы одну наклейку перед экспортом.')
      return
    }

    startPdfExport(async () => {
      try {
        const { exportPdf } = await import('./lib/pdfExport')
        await exportPdf(project)
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Не удалось экспортировать PDF. Попробуйте ещё раз.')
      }
    })
  }
  const createLabelAtFirstFreeSlot = (): void => {
    const id = projectState.addLabel()
    if (id) setSelectedId(id)
    else alert('На щите нет свободного модуля.')
  }
  const removeSelectedLabel = (): void => {
    if (!selectedId) return
    projectState.removeLabel(selectedId)
    setSelectedId(null)
  }
  const duplicateSelectedLabel = (): void => {
    if (!selectedId) return
    const id = projectState.duplicateLabel(selectedId)
    if (id) setSelectedId(id)
    else alert('Нет свободного места для копии.')
  }
  const importProject = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        projectState.replaceProject(parseProjectJson(String(reader.result)))
        setSelectedId(null)
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Это не файл проекта ElectroMarks.')
      }
    }
    reader.onerror = () => alert('Не удалось прочитать файл проекта.')
    reader.readAsText(file)
    event.target.value = ''
  }
  const uploadIcon = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const icon: IconItem = {
        id: crypto.randomUUID(),
        label: file.name.replace(/\.[^.]+$/, ''),
        dataUrl: String(reader.result),
        category: 'Мои',
      }
      projectState.addIcon(icon, selectedId)
    }
    reader.onerror = () => alert('Не удалось прочитать файл пиктограммы.')
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  return <main>
    <AppHeader
      importInputRef={importInputRef}
      onDownloadProject={() => downloadProject(project)}
      onImportProject={importProject}
      onExportPdf={exportProjectPdf}
      isExportingPdf={isExportingPdf}
    />
    {projectState.saveFailed ? <p className="hint" role="alert">Не удалось автоматически сохранить проект в браузере. Сохраните его кнопкой «Сохранить файл».</p> : null}
    <ProjectSettings project={project} onChange={projectState.updateSettings} />
    <div className="layout">
      <Shield
        project={project}
        selectedId={selectedId}
        onMoveLabel={moveLabel}
        onCreateLabel={createLabelAtFirstFreeSlot}
        onAddTestFixture={() => {
          const added = projectState.addTestFixture()
          if (!added) alert('На щите нет места для тестовых наклеек.')
        }}
        onSelectLabel={setSelectedId}
      />
      <Panel className="editor">
        <PanelHeading
          eyebrow="РЕДАКТОР"
          title={selectedLabel ? 'Настройка наклейки' : 'Выберите наклейку'}
          actions={selectedLabel ? <div className="inline-actions">
            <Button variant="icon" title="Копировать" onClick={duplicateSelectedLabel}>⧉</Button>
            <Button variant="danger" title="Удалить" onClick={removeSelectedLabel}>×</Button>
          </div> : undefined}
        />
        {selectedLabel
          ? <LabelEditor
              project={project}
              label={selectedLabel}
              onUpdate={updateSelectedLabel}
              onZoneUpdate={updateSelectedZone}
              onUploadIcon={openIconUpload}
            />
          : <div className="empty">
              <span>▧</span>
              <p>Создайте наклейку или выберите существующую на схеме.</p>
            </div>}
        <input ref={iconInputRef} type="file" accept="image/png,image/svg+xml" hidden onChange={uploadIcon} />
      </Panel>
    </div>
  </main>
}
