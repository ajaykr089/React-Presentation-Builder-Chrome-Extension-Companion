import { NextRequest, NextResponse } from 'next/server'
import { SlideElement } from '@/types/presentation'

// In a real app, this would be stored in a database
// For now, we'll use a simple in-memory store (resets on server restart)
let pendingImports: any[] = []

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    console.log('Received extension import:', data)

    // Validate the incoming data
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      )
    }

    // Process the data based on type
    let processedData: any = {
      id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...data
    }

    // Convert different content types to presentation elements
    if (data.slides && Array.isArray(data.slides)) {
      // Extension already provided structured slides - convert them to web app format
      processedData.slides = convertExtensionSlidesToWebAppSlides(data.slides)
    } else if (data.type === 'webpage') {
      // Webpage content - convert to slides using basic algorithm
      processedData.slides = convertWebPageToSlides(data)
    } else if (data.type === 'youtube') {
      processedData.slides = convertYouTubeToSlides(data)
    } else if (data.type === 'selection') {
      processedData.slides = convertSelectionToSlides(data)
    } else if (data.type === 'summarized') {
      processedData.slides = convertSummaryToSlides(data)
    }

    // Store the processed data
    pendingImports.push(processedData)

    // Keep only the last 10 imports to prevent memory issues
    if (pendingImports.length > 10) {
      pendingImports = pendingImports.slice(-10)
    }

    console.log(`Processed import: ${processedData.id}`)

    return NextResponse.json({
      success: true,
      id: processedData.id,
      message: 'Content imported successfully',
      slideCount: processedData.slides?.length || 0
    })

  } catch (error) {
    console.error('Extension import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return the latest pending import (for debugging/polling)
  const latest = pendingImports[pendingImports.length - 1]

  if (latest) {
    // Remove it from pending after retrieval
    pendingImports = pendingImports.filter(item => item.id !== latest.id)

    return NextResponse.json({
      success: true,
      data: latest
    })
  }

  return NextResponse.json({
    success: true,
    data: null,
    message: 'No pending imports'
  })
}

// Helper functions to convert different content types to slides

function convertWebPageToSlides(data: any) {
  const slides = []

  // Title slide
  slides.push({
    id: `slide_title_${Date.now()}`,
    title: data.pageTitle || 'Web Content',
    elements: [
      {
        id: `title_${Date.now()}`,
        type: 'text',
        content: data.pageTitle || 'Untitled Page',
        x: 50,
        y: 200,
        width: 700,
        height: 60,
        style: {
          fontSize: '32px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#000000'
        }
      },
      {
        id: `url_${Date.now()}`,
        type: 'text',
        content: data.url,
        x: 50,
        y: 280,
        width: 700,
        height: 30,
        style: {
          fontSize: '14px',
          textAlign: 'center',
          color: '#666666'
        }
      }
    ]
  })

  // Create slides from sections (which have content grouped by headings)
  if (data.sections && data.sections.length > 0) {
    data.sections.forEach((section: any, index: number) => {
      if (section.content && section.content.length > 0) {
        const contentText = section.content.slice(0, 3).join('\n\n') // Take first 3 content items
        const truncatedContent = contentText.length > 500 ? contentText.substring(0, 500) + '...' : contentText

        const slideElements = []

        // Add title
        slideElements.push({
          id: `section_title_${index}_${Date.now()}`,
          type: 'text',
          content: section.heading,
          x: 50,
          y: 80,
          width: 700,
          height: 50,
          style: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#000000'
          }
        })

        let currentY = 140

        // Add image if available
        if (section.images && section.images.length > 0) {
          const image = section.images[0] // Use first image
          slideElements.push({
            id: `section_image_${index}_${Date.now()}`,
            type: 'image',
            content: image.src,
            x: 50,
            y: currentY,
            width: 600,
            height: 200,
            style: {
              objectFit: 'contain',
              borderRadius: '8px'
            }
          })
          currentY += 220 // Move content down after image
        }

        // Add full content without truncation
        const fullContentText = section.content.join('\n\n')
        slideElements.push({
          id: `section_content_${index}_${Date.now()}`,
          type: 'text',
          content: fullContentText,
          x: 50,
          y: currentY,
          width: 700,
          height: 400, // Increased height for more content
          style: {
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#333333'
          }
        })

        slides.push({
          id: `slide_section_${index}_${Date.now()}`,
          title: section.heading,
          elements: slideElements
        })
      }
    })
  }

  // If no sections, fall back to using paragraphs
  if (slides.length <= 1 && data.paragraphs && data.paragraphs.length > 0) {
    const paragraphsPerSlide = 2
    for (let i = 0; i < Math.min(data.paragraphs.length, 10); i += paragraphsPerSlide) {
      const slideParagraphs = data.paragraphs.slice(i, i + paragraphsPerSlide)
      const contentText = slideParagraphs.join('\n\n')
      const truncatedContent = contentText.length > 600 ? contentText.substring(0, 600) + '...' : contentText

      slides.push({
        id: `slide_content_${i}_${Date.now()}`,
        title: `Content Part ${Math.floor(i / paragraphsPerSlide) + 1}`,
        elements: [
          {
            id: `content_title_${i}_${Date.now()}`,
            type: 'text',
            content: `Content Part ${Math.floor(i / paragraphsPerSlide) + 1}`,
            x: 50,
            y: 80,
            width: 700,
            height: 50,
            style: {
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#000000'
            }
          },
          {
            id: `content_text_${i}_${Date.now()}`,
            type: 'text',
            content: truncatedContent,
            x: 50,
            y: 140,
            width: 700,
            height: 300,
            style: {
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#333333'
            }
          }
        ]
      })
    }
  }

  // Add list slides
  if (data.lists && data.lists.length > 0) {
    data.lists.slice(0, 3).forEach((list: any, index: number) => {
      if (list.items && list.items.length > 0) {
        const listContent = list.items.map((item: string) => `• ${item}`).join('\n')

        slides.push({
          id: `slide_list_${index}_${Date.now()}`,
          title: `Key Points ${index + 1}`,
          elements: [
            {
              id: `list_title_${index}_${Date.now()}`,
              type: 'text',
              content: `Key Points ${index + 1}`,
              x: 50,
              y: 80,
              width: 700,
              height: 50,
              style: {
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#000000'
              }
            },
            {
              id: `list_content_${index}_${Date.now()}`,
              type: 'text',
              content: listContent,
              x: 50,
              y: 140,
              width: 700,
              height: 300,
              style: {
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#333333'
              }
            }
          ]
        })
      }
    })
  }

  // Limit total slides to reasonable number (15 max)
  return slides.slice(0, 15)
}

function convertYouTubeToSlides(data: any) {
  const slides = []

  // Title slide
  slides.push({
    id: `slide_youtube_title_${Date.now()}`,
    title: 'YouTube Video',
    elements: [
      {
        id: `youtube_title_${Date.now()}`,
        type: 'text',
        content: data.title || 'YouTube Video',
        x: 50,
        y: 200,
        width: 700,
        height: 60,
        style: {
          fontSize: '32px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#000000'
        }
      },
      {
        id: `youtube_url_${Date.now()}`,
        type: 'text',
        content: data.url,
        x: 50,
        y: 280,
        width: 700,
        height: 30,
        style: {
          fontSize: '14px',
          textAlign: 'center',
          color: '#666666'
        }
      }
    ]
  })

  // Transcript content slide
  if (data.content) {
    const transcript = data.content
    const chunks = splitTextIntoChunks(transcript, 300)

    chunks.forEach((chunk: string, index: number) => {
      slides.push({
        id: `slide_transcript_${index}_${Date.now()}`,
        title: `Transcript Part ${index + 1}`,
        elements: [
          {
            id: `transcript_${index}_${Date.now()}`,
            type: 'text',
            content: chunk,
            x: 50,
            y: 80,
            width: 700,
            height: 400,
            style: {
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#333333'
            }
          }
        ]
      })
    })
  }

  return slides
}

function convertSelectionToSlides(data: any) {
  return [{
    id: `slide_selection_${Date.now()}`,
    title: 'Selected Text',
    elements: [
      {
        id: `selection_title_${Date.now()}`,
        type: 'text',
        content: 'Selected Content',
        x: 50,
        y: 100,
        width: 700,
        height: 50,
        style: {
          fontSize: '28px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#000000'
        }
      },
      {
        id: `selection_content_${Date.now()}`,
        type: 'text',
        content: data.content,
        x: 50,
        y: 170,
        width: 700,
        height: 300,
        style: {
          fontSize: '18px',
          lineHeight: '1.6',
          color: '#333333'
        }
      }
    ]
  }]
}

function convertSummaryToSlides(data: any) {
  const slides = []

  // Title slide
  slides.push({
    id: `slide_summary_title_${Date.now()}`,
    title: 'AI Summary',
    elements: [
      {
        id: `summary_title_${Date.now()}`,
        type: 'text',
        content: data.title || 'Content Summary',
        x: 50,
        y: 200,
        width: 700,
        height: 60,
        style: {
          fontSize: '32px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#000000'
        }
      }
    ]
  })

  // Content slides
  if (data.slides && Array.isArray(data.slides)) {
    data.slides.forEach((slideData: any, index: number) => {
      slides.push({
        id: `slide_summary_${index}_${Date.now()}`,
        title: slideData.title || `Slide ${index + 1}`,
        elements: [
          {
            id: `summary_slide_title_${index}_${Date.now()}`,
            type: 'text',
            content: slideData.title || `Slide ${index + 1}`,
            x: 50,
            y: 100,
            width: 700,
            height: 50,
            style: {
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#000000'
            }
          },
          {
            id: `summary_slide_content_${index}_${Date.now()}`,
            type: 'text',
            content: slideData.content || 'Content...',
            x: 50,
            y: 170,
            width: 700,
            height: 250,
            style: {
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#333333'
            }
          }
        ]
      })
    })
  }

  return slides
}

function splitTextIntoChunks(text: string, chunkSize: number): string[] {
  const words = text.split(/\s+/)
  const chunks = []

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    chunks.push(chunk)
  }

  return chunks
}

// Convert extension slides to web app slide format
function convertExtensionSlidesToWebAppSlides(extensionSlides: any[]): any[] {
  return extensionSlides.map((slide, index) => {
    const slideId = slide.id || `slide_${index}_${Date.now()}`
    const elements: SlideElement[] = []
    let yOffset = 80 // Starting Y position for content

    // Handle different slide types
    switch (slide.type) {
      case 'title':
        // Title slide with rich metadata
        if (slide.content?.title) {
          elements.push({
            id: `title_${Date.now()}`,
            type: 'text',
            content: slide.content.title,
            x: 50,
            y: 150,
            width: 700,
            height: 60,
            style: {
              fontSize: '36px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#000000'
            }
          })
          yOffset = 230
        }

        if (slide.content?.subtitle) {
          elements.push({
            id: `subtitle_${Date.now()}`,
            type: 'text',
            content: slide.content.subtitle,
            x: 50,
            y: yOffset,
            width: 700,
            height: 40,
            style: {
              fontSize: '18px',
              textAlign: 'center',
              color: '#666666'
            }
          })
          yOffset += 60
        }

        // Add metadata if available
        const metadata = []
        if (slide.content?.author) metadata.push(`Author: ${slide.content.author}`)
        if (slide.content?.publishedDate) {
          const date = new Date(slide.content.publishedDate).toLocaleDateString()
          metadata.push(`Published: ${date}`)
        }
        if (slide.content?.readingTime) metadata.push(`${slide.content.readingTime}`)

        if (metadata.length > 0) {
          elements.push({
            id: `metadata_${Date.now()}`,
            type: 'text',
            content: metadata.join(' • '),
            x: 50,
            y: yOffset,
            width: 700,
            height: 30,
            style: {
              fontSize: '14px',
              textAlign: 'center',
              color: '#999999'
            }
          })
        }
        break

      case 'content':
      case 'section':
        // Text content slides
        elements.push({
          id: `content_title_${Date.now()}`,
          type: 'text',
          content: slide.title,
          x: 50,
          y: 80,
          width: 700,
          height: 50,
          style: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#000000'
          }
        })

        if (slide.content && typeof slide.content === 'string') {
          elements.push({
            id: `content_text_${Date.now()}`,
            type: 'text',
            content: slide.content,
            x: 50,
            y: 140,
            width: 700,
            height: 300,
            style: {
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#333333'
            }
          })
        }
        break

      case 'list':
        // List slides
        elements.push({
          id: `list_title_${Date.now()}`,
          type: 'text',
          content: slide.title,
          x: 50,
          y: 80,
          width: 700,
          height: 50,
          style: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#000000'
          }
        })

        if (slide.content?.items && Array.isArray(slide.content.items)) {
          const listContent = slide.content.items.map((item: string, idx: number) =>
            `• ${item}`
          ).join('\n')

          elements.push({
            id: `list_content_${Date.now()}`,
            type: 'text',
            content: listContent,
            x: 50,
            y: 140,
            width: 700,
            height: 300,
            style: {
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#333333'
            }
          })
        }
        break

      case 'image':
        // Image slides with proper image elements
        elements.push({
          id: `image_title_${Date.now()}`,
          type: 'text',
          content: slide.title,
          x: 50,
          y: 50,
          width: 700,
          height: 60,
          style: {
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#000000'
          }
        })

        if (slide.content?.src) {
          // Add proper image element
          elements.push({
            id: `image_${Date.now()}`,
            type: 'image',
            content: slide.content.src,
            x: 100,
            y: 120,
            width: 600,
            height: 300,
            style: {
              objectFit: 'contain',
              borderRadius: '8px'
            }
          })

          // Add caption if available
          if (slide.content.caption) {
            elements.push({
              id: `image_caption_${Date.now()}`,
              type: 'text',
              content: slide.content.caption,
              x: 50,
              y: 440,
              width: 700,
              height: 60,
              style: {
                fontSize: '16px',
                textAlign: 'center',
                color: '#666666',
                fontStyle: 'italic'
              }
            })
          }
        }
        break

      case 'table':
        // Table slides
        elements.push({
          id: `table_title_${Date.now()}`,
          type: 'text',
          content: slide.title,
          x: 50,
          y: 80,
          width: 700,
          height: 50,
          style: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#000000'
          }
        })

        if (slide.content?.headers && slide.content?.rows) {
          // Convert table to text representation
          let tableText = slide.content.headers.join(' | ') + '\n'
          tableText += '-'.repeat(slide.content.headers.length * 10) + '\n'

          slide.content.rows.slice(0, 8).forEach((row: string[]) => {
            tableText += row.join(' | ') + '\n'
          })

          elements.push({
            id: `table_content_${Date.now()}`,
            type: 'text',
            content: tableText,
            x: 50,
            y: 140,
            width: 700,
            height: 300,
            style: {
              fontSize: '14px',
              fontFamily: 'monospace',
              lineHeight: '1.4',
              color: '#333333'
            }
          })
        }
        break

      case 'code':
        // Code slides
        elements.push({
          id: `code_title_${Date.now()}`,
          type: 'text',
          content: slide.title,
          x: 50,
          y: 80,
          width: 700,
          height: 50,
          style: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#000000'
          }
        })

        if (slide.content?.code) {
          const language = slide.content.language || 'text'
          const codeWithLabel = `[${language}]\n${slide.content.code}`

          elements.push({
            id: `code_content_${Date.now()}`,
            type: 'text',
            content: codeWithLabel,
            x: 50,
            y: 140,
            width: 700,
            height: 300,
            style: {
              fontSize: '14px',
              fontFamily: 'monospace',
              backgroundColor: '#f5f5f5',
              padding: '10px',
              color: '#333333'
            }
          })
        }
        break

      case 'links':
        // Links slides
        elements.push({
          id: `links_title_${Date.now()}`,
          type: 'text',
          content: slide.title,
          x: 50,
          y: 80,
          width: 700,
          height: 50,
          style: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#000000'
          }
        })

        if (slide.content && Array.isArray(slide.content)) {
          const linksText = slide.content.map((link: any, idx: number) =>
            `${idx + 1}. ${link.text}\n   ${link.url}`
          ).join('\n\n')

          elements.push({
            id: `links_content_${Date.now()}`,
            type: 'text',
            content: linksText,
            x: 50,
            y: 140,
            width: 700,
            height: 300,
            style: {
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#1890ff'
            }
          })
        }
        break

      case 'insights':
        // Insights slides
        elements.push({
          id: `insights_title_${Date.now()}`,
          type: 'text',
          content: slide.title,
          x: 50,
          y: 80,
          width: 700,
          height: 50,
          style: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#000000'
          }
        })

        if (slide.content && Array.isArray(slide.content)) {
          const insightsText = slide.content.map((insight: string, idx: number) =>
            `${idx + 1}. ${insight}`
          ).join('\n\n')

          elements.push({
            id: `insights_content_${Date.now()}`,
            type: 'text',
            content: insightsText,
            x: 50,
            y: 140,
            width: 700,
            height: 300,
            style: {
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#333333'
            }
          })
        }
        break

      case 'quotes':
        // Quotes slides
        elements.push({
          id: `quotes_title_${Date.now()}`,
          type: 'text',
          content: slide.title,
          x: 50,
          y: 80,
          width: 700,
          height: 50,
          style: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#000000'
          }
        })

        if (slide.content && Array.isArray(slide.content)) {
          const quotesText = slide.content.map((quote: any) =>
            `"${quote.text}"${quote.author ? `\n— ${quote.author}` : ''}`
          ).join('\n\n\n')

          elements.push({
            id: `quotes_content_${Date.now()}`,
            type: 'text',
            content: quotesText,
            x: 50,
            y: 140,
            width: 700,
            height: 300,
            style: {
              fontSize: '18px',
              lineHeight: '1.6',
              color: '#333333',
              fontStyle: 'italic'
            }
          })
        }
        break

      default:
        // Fallback for unknown slide types
        elements.push({
          id: `fallback_title_${Date.now()}`,
          type: 'text',
          content: slide.title || 'Content',
          x: 50,
          y: 80,
          width: 700,
          height: 50,
          style: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#000000'
          }
        })

        if (slide.content && typeof slide.content === 'string') {
          elements.push({
            id: `fallback_content_${Date.now()}`,
            type: 'text',
            content: slide.content,
            x: 50,
            y: 140,
            width: 700,
            height: 300,
            style: {
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#333333'
            }
          })
        }
    }

    return {
      id: slideId,
      title: slide.title || `Slide ${index + 1}`,
      elements: elements,
      backgroundColor: '#ffffff'
    }
  })
}
