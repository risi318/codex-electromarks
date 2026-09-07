import dejavuSansUrl from 'dejavu-fonts-ttf/ttf/DejaVuSans.ttf'
import type { jsPDF } from 'jspdf'

const PDF_FONT_FILE = 'DejaVuSans.ttf'
const PDF_FONT_FAMILY = 'DejaVuSans'

let fontBase64Promise: Promise<string> | null = null

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }

  return btoa(binary)
}

function loadFontBase64(): Promise<string> {
  fontBase64Promise ??= fetch(dejavuSansUrl)
    .then(response => {
      if (!response.ok) throw new Error(`Не удалось загрузить PDF-шрифт: ${response.status}`)
      return response.arrayBuffer()
    })
    .then(arrayBufferToBase64)
    .catch(error => {
      fontBase64Promise = null
      throw error
    })

  return fontBase64Promise
}

export async function registerPdfFont(document: jsPDF): Promise<void> {
  document.addFileToVFS(PDF_FONT_FILE, await loadFontBase64())
  document.addFont(PDF_FONT_FILE, PDF_FONT_FAMILY, 'normal')
  document.setFont(PDF_FONT_FAMILY, 'normal')
}

export function usePdfFont(document: jsPDF): void {
  document.setFont(PDF_FONT_FAMILY, 'normal')
}
