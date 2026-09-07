import type { IconItem } from './types'

export function iconSvgMarkup(icon: IconItem): string | null {
  if (!icon.paths?.length) return null
  const paths = icon.paths.map(layer => `<path d="${layer.path}" fill="${layer.color}"${layer.transform ? ` transform="${layer.transform}"` : ''}/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${paths}</svg>`
}

export function iconSvgDataUrl(icon: IconItem): string | null {
  const markup = iconSvgMarkup(icon)
  return markup ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}` : null
}
