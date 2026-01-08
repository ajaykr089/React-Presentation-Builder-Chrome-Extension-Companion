import PptxGenJS from 'pptxgenjs'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Slide, Theme } from '@/types/presentation'

export const exportToPPTX = async (slides: Slide[], theme: Theme): Promise<void> => {
  const pptx = new PptxGenJS()

  // Set presentation properties
  pptx.author = 'React Presentation Builder'
  pptx.company = 'Presentation Builder'
  pptx.subject = 'Generated Presentation'
  pptx.title = 'Presentation'

  // Helper function to strip HTML tags
  const stripHtmlTags = (html: string): string => {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ''
  }

  // Add each slide
  slides.forEach((slide) => {
    const pptxSlide = pptx.addSlide()

    // Set background color
    if (slide.backgroundColor) {
      pptxSlide.background = { color: slide.backgroundColor }
    }

    // Add elements
    slide.elements.forEach((element) => {
      if (element.type === 'text' && element.content) {
        // Strip HTML tags from text content for PPTX export
        const cleanText = stripHtmlTags(element.content)

        pptxSlide.addText(cleanText, {
          x: element.x / 800 * 10, // Convert to inches (assuming 800px canvas)
          y: element.y / 600 * 7.5, // Convert to inches (assuming 600px canvas)
          w: element.width / 800 * 10,
          h: element.height / 600 * 7.5,
          fontSize: element.style?.fontSize ? parseInt(element.style.fontSize.toString()) * 0.75 : 18,
          color: element.style?.color || theme.colors.text,
          fontFace: element.style?.fontFamily || theme.fonts.body,
          bold: element.style?.fontWeight === 'bold',
          align: element.style?.textAlign as any || 'left',
        })
      }
    })
  })

  // Save the presentation
  await pptx.writeFile({ fileName: 'presentation.pptx' })
}

export const exportToPDF = async (canvasElement: HTMLElement): Promise<void> => {
  // Temporarily modify text elements for better export
  const textElements = canvasElement.querySelectorAll('.slide-element')
  const originalStyles: Array<{ element: Element; originalStyle: string }> = []

  textElements.forEach(element => {
    const textDiv = element.querySelector('div')
    if (textDiv && textDiv.innerHTML.includes('<')) {
      // Store original style
      originalStyles.push({
        element: textDiv,
        originalStyle: textDiv.getAttribute('style') || ''
      })

      // Apply better styling for export
      textDiv.setAttribute('style',
        (textDiv.getAttribute('style') || '') +
        '; white-space: pre-wrap; word-wrap: break-word; line-height: 1.2; font-family: Arial, sans-serif;'
      )
    }
  })

  const canvas = await html2canvas(canvasElement, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false
  })

  // Restore original styles
  originalStyles.forEach(({ element, originalStyle }) => {
    element.setAttribute('style', originalStyle)
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('landscape', 'mm', 'a4')

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
  const imgX = (pdfWidth - imgWidth * ratio) / 2
  const imgY = (pdfHeight - imgHeight * ratio) / 2

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
  pdf.save('presentation.pdf')
}

export const exportToPNG = async (canvasElement: HTMLElement): Promise<void> => {
  // Temporarily modify text elements for better export
  const textElements = canvasElement.querySelectorAll('.slide-element')
  const originalStyles: Array<{ element: Element; originalStyle: string }> = []

  textElements.forEach(element => {
    const textDiv = element.querySelector('div')
    if (textDiv && textDiv.innerHTML.includes('<')) {
      // Store original style
      originalStyles.push({
        element: textDiv,
        originalStyle: textDiv.getAttribute('style') || ''
      })

      // Apply better styling for export
      textDiv.setAttribute('style',
        (textDiv.getAttribute('style') || '') +
        '; white-space: pre-wrap; word-wrap: break-word; line-height: 1.2; font-family: Arial, sans-serif;'
      )
    }
  })

  const canvas = await html2canvas(canvasElement, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false
  })

  // Restore original styles
  originalStyles.forEach(({ element, originalStyle }) => {
    element.setAttribute('style', originalStyle)
  })

  const link = document.createElement('a')
  link.download = 'presentation.png'
  link.href = canvas.toDataURL()
  link.click()
}

export const saveProject = (slides: Slide[], theme: Theme): void => {
  const projectData = {
    slides,
    theme,
    version: '1.0',
    timestamp: new Date().toISOString(),
  }

  const dataStr = JSON.stringify(projectData, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

  const exportFileDefaultName = 'presentation.json'

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}
