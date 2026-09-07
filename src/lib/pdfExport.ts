import { jsPDF } from 'jspdf'
import { iconSvgDataUrl } from '../domain/icon'
import { groupAdjacentBottomZones, mergedGroupBoundaryPositions, visibleModuleDividerPositions } from '../domain/labelGroups'
import { resolvePdfLayout } from '../domain/pdfLayout'
import { labelHeight } from '../domain/project'
import type { IconItem, Label, Project, Zone } from '../domain/types'
import { registerPdfFont, usePdfFont } from './pdfFont'

const ICON_BASE_SCALE = 2 / 3
const CSS_PX_TO_PT = 72 / 96
const PAGE_MARGIN_MM = 10

const drawFallbackIcon = (icon: IconItem): string => {
  const canvas = document.createElement('canvas')
  canvas.width = 180
  canvas.height = 180
  const context = canvas.getContext('2d')!
  context.font = '120px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(icon.symbol ?? '⚡', 90, 95)
  return canvas.toDataURL('image/png')
}

const rasterizeIcon = async (icon: IconItem): Promise<string> => {
  const source = icon.dataUrl ?? iconSvgDataUrl(icon)
  if (!source || source.startsWith('data:image/png')) return source ?? drawFallbackIcon(icon)

  const image = new Image()
  image.src = source
  await image.decode()
  const canvas = document.createElement('canvas')
  canvas.width = 360
  canvas.height = 360
  canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/png')
}

const drawText = (pdf: jsPDF, value: string, x: number, y: number, width: number, zone: Zone): void => {
  usePdfFont(pdf)
  pdf.setTextColor(zone.color)
  const preferredSize = zone.fontSize * CSS_PX_TO_PT
  const availableWidth = Math.max(1, width - 2)
  pdf.setFontSize(preferredSize)
  const textWidth = pdf.getTextWidth(value)
  const fittedSize = textWidth > availableWidth ? preferredSize * availableWidth / textWidth : preferredSize
  pdf.setFontSize(Math.max(3, fittedSize))
  pdf.text(value, x + width / 2, y, {
    align: 'center',
    baseline: 'middle',
  })
}

export const exportPdf = async (project: Project): Promise<void> => {
  if (!project.labels.length) {
    alert('Добавьте хотя бы одну наклейку перед экспортом.')
    return
  }

  const railWidth = project.modulesPerRail * project.moduleWidthMm
  const rails = Array.from({ length: project.rails }, (_, rail) =>
    project.labels.filter(label => label.rail === rail),
  ).filter(labels => labels.length)
  const railHeights = rails.map(labels => Math.max(...labels.map(labelHeight)))
  const maximumRailHeight = Math.max(...railHeights)
  const layout = resolvePdfLayout(railWidth, maximumRailHeight, PAGE_MARGIN_MM)

  if (!layout) {
    alert(`Полоса ${railWidth.toFixed(1)} × ${maximumRailHeight.toFixed(1)} мм не помещается на A4 в масштабе 1:1. Уменьшите число или ширину модулей либо высоту зон.`)
    return
  }

  const pdf = new jsPDF({ orientation: layout.orientation, unit: 'mm', format: 'a4' })

  const usedIconIds = new Set(project.labels.map(label => label.iconId))
  const images = new Map<string, string>()
  await Promise.all([
    registerPdfFont(pdf),
    ...project.icons
      .filter(icon => usedIconIds.has(icon.id))
      .map(async icon => images.set(icon.id, await rasterizeIcon(icon))),
  ])

  let y = PAGE_MARGIN_MM
  rails.forEach((labels, index) => {
    const height = railHeights[index]
    if (y + height > layout.pageHeightMm - PAGE_MARGIN_MM) {
      pdf.addPage()
      y = PAGE_MARGIN_MM
    }
    drawRail(pdf, labels, project, images, PAGE_MARGIN_MM, y, railWidth, height)
    y += height
  })

  pdf.save(`${project.name || 'electromarks'}.pdf`)
}

function drawRail(
  pdf: jsPDF,
  labels: Label[],
  project: Project,
  images: Map<string, string>,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  pdf.setFillColor('#ffffff')
  pdf.setDrawColor('#94a3b8')
  pdf.setLineWidth(.1)
  pdf.rect(x, y, width, height, 'F')
  for (const position of visibleModuleDividerPositions(labels, project.modulesPerRail)) {
    pdf.line(x + position * project.moduleWidthMm, y, x + position * project.moduleWidthMm, y + height)
  }

  labels.forEach(label => {
    drawLabel(
      pdf,
      label,
      project,
      images,
      x + label.start * project.moduleWidthMm,
      y,
      label.span * project.moduleWidthMm,
      labelHeight(label),
    )
  })

  groupAdjacentBottomZones(labels)
    .filter(group => group.length > 1)
    .forEach(group => {
      const first = group[0]
      const last = group.at(-1) ?? first
      const zone = first.bottom
      const zoneHeight = zone.heightMm
      const zoneX = x + first.start * project.moduleWidthMm
      const zoneWidth = (last.start + last.span - first.start) * project.moduleWidthMm
      const zoneY = y + labelHeight(first) - zoneHeight
      pdf.setFillColor(zone.background)
      pdf.rect(zoneX, zoneY, zoneWidth, zoneHeight, 'F')
      pdf.setDrawColor('#334155')
      pdf.setLineWidth(.15)
      pdf.line(zoneX, zoneY, zoneX + zoneWidth, zoneY)
      pdf.line(zoneX, zoneY + zoneHeight, zoneX + zoneWidth, zoneY + zoneHeight)
      drawText(pdf, zone.text, zoneX, zoneY + zoneHeight / 2, zoneWidth, zone)
    })

  pdf.setDrawColor('#334155')
  pdf.setLineWidth(.15)
  mergedGroupBoundaryPositions(labels).forEach(position => {
    const boundaryX = x + position * project.moduleWidthMm
    pdf.line(boundaryX, y, boundaryX, y + height)
  })
  pdf.setDrawColor('#94a3b8')
  pdf.setLineWidth(.1)
  pdf.rect(x, y, width, height)
}

function drawLabel(
  pdf: jsPDF,
  label: Label,
  project: Project,
  images: Map<string, string>,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const topHeight = label.top.enabled ? label.top.heightMm : 0
  const bottomHeight = label.bottom.enabled ? label.bottom.heightMm : 0
  const middleHeight = height - topHeight - bottomHeight
  const middleY = y + topHeight
  const bottomY = middleY + middleHeight
  const number = label.numberOverride.trim()

  const fill = (zone: Zone, top: number, zoneHeight: number): void => {
    pdf.setFillColor(zone.background)
    pdf.rect(x, top, width + .02, zoneHeight, 'F')
  }

  if (topHeight) fill(label.top, y, topHeight)
  fill(label.middle, middleY, middleHeight)
  if (bottomHeight) fill(label.bottom, bottomY, bottomHeight)

  pdf.setDrawColor('#334155')
  pdf.setLineWidth(.15)
  pdf.line(x, y, x + width, y)
  pdf.line(x, y + height, x + width, y + height)

  if (topHeight) {
    pdf.line(x, middleY, x + width, middleY)
    drawText(pdf, label.top.text, x, y + topHeight / 2, width, label.top)
  }
  if (bottomHeight) {
    pdf.line(x, bottomY, x + width, bottomY)
    drawText(pdf, label.bottom.text, x, bottomY + bottomHeight / 2, width, label.bottom)
  }

  const icon = project.icons.find(item => item.id === label.iconId)
  if (icon) {
    const scale = Math.max(25, Math.min(200, label.iconScale ?? 100)) / 100
    const size = Math.min(middleHeight * .58, width * .46) * scale * ICON_BASE_SCALE
    pdf.addImage(
      images.get(icon.id) ?? drawFallbackIcon(icon),
      'PNG',
      x + (width - size) / 2,
      middleY + Math.max(0, (middleHeight - size) / 2 - (number ? 1.5 : 0)),
      size,
      size,
    )
  }
  if (number) drawText(pdf, number, x, bottomY - 2.3, width, label.middle)
}
