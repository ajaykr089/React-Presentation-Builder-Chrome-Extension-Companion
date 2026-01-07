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
    if (data.type === 'webpage') {
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
    title: 'Web Content',
    elements: [
      {
        id: `title_${Date.now()}`,
        type: 'text',
        content: data.title || 'Untitled Page',
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

  // Content slides from headings
  if (data.headings && data.headings.length > 0) {
    data.headings.forEach((heading: any, index: number) => {
      if (index < 5) { // Limit to 5 content slides
        slides.push({
          id: `slide_heading_${index}_${Date.now()}`,
          title: heading.text,
          elements: [
            {
              id: `heading_${index}_${Date.now()}`,
              type: 'text',
              content: heading.text,
              x: 50,
              y: 100,
              width: 700,
              height: 60,
              style: {
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#000000'
              }
            },
            {
              id: `content_${index}_${Date.now()}`,
              type: 'text',
              content: 'Content from this section...',
              x: 50,
              y: 180,
              width: 700,
              height: 200,
              style: {
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#333333'
              }
            }
          ]
        })
      }
    })
  }

  return slides
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
