function buildFilename(base: string) {
  const stamp = new Date().toISOString().slice(0, 19).replaceAll(':', '')
  return `${base}-${stamp}.pdf`
}

export async function exportReportPdf(element: HTMLElement, filenameBase: string) {
  const { default: html2pdf } = await import('html2pdf.js')
  const filename = buildFilename(filenameBase)
  const worker = html2pdf().set({
    margin: [10, 10, 10, 10],
    filename,
    image: { type: 'jpeg', quality: 0.93 },
    html2canvas: {
      scale: typeof window !== 'undefined' && window.devicePixelRatio > 1.25 ? 2 : 1.6,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDocument: Document) => {
        clonedDocument.querySelectorAll('script').forEach((node) => node.remove())
        const root = clonedDocument.querySelector('.pdf-export-zone')
        if (root instanceof HTMLElement) {
          root.style.boxShadow = 'none'
        }
      },
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  })
  await worker.from(element).save()
}
