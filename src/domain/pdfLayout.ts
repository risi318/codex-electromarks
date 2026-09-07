export type PdfOrientation = 'portrait' | 'landscape'

export type PdfLayout = {
  orientation: PdfOrientation
  pageWidthMm: number
  pageHeightMm: number
  usableWidthMm: number
  usableHeightMm: number
}

const A4_PORTRAIT = { width: 210, height: 297 }

export function resolvePdfLayout(widthMm: number, heightMm: number, marginMm = 10): PdfLayout | null {
  const layouts: Array<Pick<PdfLayout, 'orientation' | 'pageWidthMm' | 'pageHeightMm'>> = [
    { orientation: 'portrait', pageWidthMm: A4_PORTRAIT.width, pageHeightMm: A4_PORTRAIT.height },
    { orientation: 'landscape', pageWidthMm: A4_PORTRAIT.height, pageHeightMm: A4_PORTRAIT.width },
  ]

  const matchingLayout = layouts.find(layout =>
    widthMm <= layout.pageWidthMm - marginMm * 2 &&
    heightMm <= layout.pageHeightMm - marginMm * 2,
  )

  return matchingLayout ? {
    ...matchingLayout,
    usableWidthMm: matchingLayout.pageWidthMm - marginMm * 2,
    usableHeightMm: matchingLayout.pageHeightMm - marginMm * 2,
  } : null
}
