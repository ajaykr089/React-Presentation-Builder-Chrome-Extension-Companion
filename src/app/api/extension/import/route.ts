import { NextRequest, NextResponse } from 'next/server'
import { SlideElement } from '@/types/presentation'

// YouTube transcript extraction using server-side approach
async function extractYouTubeTranscript(videoId: string): Promise<string | null> {
  try {
    // Method 1: Try YouTube's timedtext API (server-side, no CORS)
    const languages = ['en', 'en-US', 'en-GB', ''];

    for (const lang of languages) {
      try {
        const langParam = lang ? `&lang=${lang}` : '';
        const captionUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&fmt=json3${langParam}`;

        const response = await fetch(captionUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; PresentationBuilder/1.0)',
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();

          if (data.events && data.events.length > 0) {
            // Convert timed text events to plain text
            const transcript = data.events
              .filter((event: any) => event.segs && event.segs.length > 0)
              .map((event: any) => event.segs.map((seg: any) => seg.utf8 || '').join(''))
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();

            if (transcript && transcript.length > 10) {
              return transcript;
            }
          }
        }
      } catch (error) {
        console.log(`Caption extraction failed for lang ${lang || 'auto'}:`, error instanceof Error ? error.message : error);
      }
    }

    // Method 2: Try alternative approach using YouTube page parsing
    try {
      const pageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PresentationBuilder/1.0)'
        }
      });

      if (pageResponse.ok) {
        const html = await pageResponse.text();

        // Look for caption tracks in the page
        const captionTracksMatch = html.match(/"captionTracks":\[([^\]]+)\]/);
        if (captionTracksMatch) {
          const captionData = captionTracksMatch[1];

          // Extract the base URL for captions
          const baseUrlMatch = captionData.match(/"baseUrl":"([^"]+)"/);
          if (baseUrlMatch) {
            const baseUrl = decodeURIComponent(baseUrlMatch[1]);

            // Fetch the XML transcript
            const xmlResponse = await fetch(baseUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; PresentationBuilder/1.0)'
              }
            });

            if (xmlResponse.ok) {
              const xmlText = await xmlResponse.text();

              // Parse XML transcript
              const textMatches = xmlText.match(/<text[^>]*>([^<]+)<\/text>/g);
              if (textMatches) {
                // Extract and clean the text content
                const transcript = textMatches
                  .map(match => {
                    // Remove XML tags and decode HTML entities
                    const text = match.replace(/<[^>]+>/g, '');
                    try {
                      // Try to decode HTML entities
                      const textarea = document.createElement('textarea');
                      (textarea as any).innerHTML = text;
                      return textarea.value;
                    } catch (e) {
                      return text;
                    }
                  })
                  .join(' ')
                  .replace(/\s+/g, ' ')
                  .trim();

                if (transcript && transcript.length > 10) {
                  return transcript;
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log('Alternative caption extraction failed:', error);
    }

    return null;
  } catch (error) {
    console.error('YouTube transcript extraction error:', error);
    return null;
  }
}

// In a real app, this would be stored in a database
// For now, we'll use a simple in-memory store (resets on server restart)
let pendingImports: any[] = []

export async function POST(request: NextRequest) {
  try {
    let data

    try {
      data = await request.json()
    } catch (parseError) {
      console.error('Failed to parse request JSON:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    console.log('Received extension import:', data)
    console.log('Data type:', typeof data)
    console.log('Data keys:', data ? Object.keys(data) : 'null/undefined')

    // More robust validation
    if (data === null || data === undefined) {
      console.error('Data is null or undefined')
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      )
    }

    if (typeof data !== 'object') {
      console.error('Data is not an object, type:', typeof data)
      return NextResponse.json(
        { error: 'Data must be an object' },
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
      processedData.slides = convertSummarizedToSlides(data)
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

// GET method to retrieve pending imports (for web app polling)
export async function GET(request: NextRequest) {
  try {
    console.log('GET request for pending imports, current count:', pendingImports.length)

    // Return the latest pending import (if any)
    const latest = pendingImports[pendingImports.length - 1]

    if (latest) {
      // Remove it from pending after retrieval
      pendingImports = pendingImports.filter(item => item.id !== latest.id)

      console.log('Returning pending import:', latest.id)
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

  } catch (error) {
    console.error('GET pending imports error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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

  // Title slide with video info
  slides.push({
    id: `slide_youtube_title_${Date.now()}`,
    title: 'YouTube Video Summary',
    elements: [
      {
        id: `youtube_title_${Date.now()}`,
        type: 'text',
        content: data.title || 'YouTube Video',
        x: 50,
        y: 150,
        width: 700,
        height: 60,
        style: {
          fontSize: '28px',
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
        y: 220,
        width: 700,
        height: 30,
        style: {
          fontSize: '14px',
          textAlign: 'center',
          color: '#666666'
        }
      },
      {
        id: `youtube_description_${Date.now()}`,
        type: 'text',
        content: 'Video transcript converted to presentation slides',
        x: 50,
        y: 260,
        width: 700,
        height: 40,
        style: {
          fontSize: '16px',
          textAlign: 'center',
          color: '#888888'
        }
      }
    ]
  })

  // Process transcript content into slides
  if (data.content && typeof data.content === 'string') {
    const transcript = data.content.trim()

    if (transcript.length === 0) {
      // No transcript available
      slides.push({
        id: `slide_no_transcript_${Date.now()}`,
        title: 'Transcript Not Available',
        elements: [
          {
            id: `no_transcript_${Date.now()}`,
            type: 'text',
            content: 'This YouTube video does not have captions or transcripts available. You can still create slides manually.',
            x: 50,
            y: 150,
            width: 700,
            height: 100,
            style: {
              fontSize: '18px',
              textAlign: 'center',
              color: '#666666'
            }
          }
        ]
      })
      return slides
    }

    // Clean and process the transcript
    const cleanTranscript = transcript
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
      .trim()

    // Create overview slide with key insights
    const wordCount = cleanTranscript.split(/\s+/).length
    const estimatedReadingTime = Math.ceil(wordCount / 150) // Average reading speed

    slides.push({
      id: `slide_overview_${Date.now()}`,
      title: 'Transcript Overview',
      elements: [
        {
          id: `overview_title_${Date.now()}`,
          type: 'text',
          content: 'Video Transcript Summary',
          x: 50,
          y: 80,
          width: 700,
          height: 50,
          style: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#000000'
          }
        },
        {
          id: `overview_stats_${Date.now()}`,
          type: 'text',
          content: `Words: ${wordCount} | Reading Time: ${estimatedReadingTime} min`,
          x: 50,
          y: 140,
          width: 700,
          height: 30,
          style: {
            fontSize: '14px',
            color: '#666666'
          }
        },
        {
          id: `overview_preview_${Date.now()}`,
          type: 'text',
          content: cleanTranscript.substring(0, 300) + (cleanTranscript.length > 300 ? '...' : ''),
          x: 50,
          y: 180,
          width: 700,
          height: 120,
          style: {
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#333333'
          }
        }
      ]
    })

    // Split transcript into meaningful chunks for slides
    const sentences = cleanTranscript.split(/[.!?]+/).filter((s: string) => s.trim().length > 10)
    const chunks = []

    // Group sentences into slide-sized chunks
    let currentChunk = ''
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim()
      if (!trimmedSentence) continue

      const potentialChunk = currentChunk ? `${currentChunk}. ${trimmedSentence}` : trimmedSentence

      // If adding this sentence would make the chunk too long, start a new chunk
      if (potentialChunk.length > 400) {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
          currentChunk = trimmedSentence
        } else {
          // Single long sentence, add it anyway
          chunks.push(trimmedSentence)
          currentChunk = ''
        }
      } else {
        currentChunk = potentialChunk
      }
    }

    // Add remaining content
    if (currentChunk) {
      chunks.push(currentChunk.trim())
    }

    // Create content slides
    chunks.forEach((chunk: string, index: number) => {
      if (chunk.trim().length === 0) return

      slides.push({
        id: `slide_transcript_${index}_${Date.now()}`,
        title: `Content Part ${index + 1}`,
        elements: [
          {
            id: `transcript_title_${index}_${Date.now()}`,
            type: 'text',
            content: `Part ${index + 1}`,
            x: 50,
            y: 80,
            width: 700,
            height: 40,
            style: {
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#000000'
            }
          },
          {
            id: `transcript_content_${index}_${Date.now()}`,
            type: 'text',
            content: chunk,
            x: 50,
            y: 130,
            width: 700,
            height: 320,
            style: {
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#333333'
            }
          }
        ]
      })
    })

    // Add summary slide if we have content
    if (chunks.length > 0) {
      const totalParts = chunks.length
      slides.push({
        id: `slide_summary_${Date.now()}`,
        title: 'Summary',
        elements: [
          {
            id: `summary_title_${Date.now()}`,
            type: 'text',
            content: 'Transcript Complete',
            x: 50,
            y: 150,
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
            id: `summary_stats_${Date.now()}`,
            type: 'text',
            content: `Total Parts: ${totalParts} | Total Words: ${wordCount}`,
            x: 50,
            y: 220,
            width: 700,
            height: 30,
            style: {
              fontSize: '16px',
              textAlign: 'center',
              color: '#666666'
            }
          },
          {
            id: `summary_note_${Date.now()}`,
            type: 'text',
            content: 'You can now edit these slides to create your presentation',
            x: 50,
            y: 260,
            width: 700,
            height: 40,
            style: {
              fontSize: '14px',
              textAlign: 'center',
              color: '#888888'
            }
          }
        ]
      })
    }
  } else {
    // No transcript content
    slides.push({
      id: `slide_no_content_${Date.now()}`,
      title: 'No Transcript Available',
      elements: [
        {
          id: `no_content_${Date.now()}`,
          type: 'text',
          content: 'Unable to extract transcript from this YouTube video. The video may not have captions available.',
          x: 50,
          y: 150,
          width: 700,
          height: 100,
          style: {
            fontSize: '18px',
            textAlign: 'center',
            color: '#666666'
          }
        }
      ]
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

function convertSummarizedToSlides(data: any) {
  const slides = []

  // Title slide
  slides.push({
    id: `slide_summary_title_${Date.now()}`,
    title: 'Content Summary',
    elements: [
      {
        id: `summary_title_${Date.now()}`,
        type: 'text',
        content: 'Smart Content Summary',
        x: 50,
        y: 150,
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
        id: `summary_subtitle_${Date.now()}`,
        type: 'text',
        content: data.pageTitle || 'Summarized Content',
        x: 50,
        y: 220,
        width: 700,
        height: 40,
        style: {
          fontSize: '18px',
          textAlign: 'center',
          color: '#666666'
        }
      }
    ]
  })

  // Extract key content using algorithmic summarization
  const keyContent = extractKeyContent(data)

  // Create slides from key content
  keyContent.forEach((content: any, index: number) => {
    const slideElements = []

    // Add title
    slideElements.push({
      id: `summary_slide_title_${index}_${Date.now()}`,
      type: 'text',
      content: content.title,
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
    if (content.image) {
      slideElements.push({
        id: `summary_image_${index}_${Date.now()}`,
        type: 'image',
        content: content.image,
        x: 50,
        y: currentY,
        width: 600,
        height: 200,
        style: {
          objectFit: 'contain',
          borderRadius: '8px'
        }
      })
      currentY += 220
    }

    // Add content
    slideElements.push({
      id: `summary_content_${index}_${Date.now()}`,
      type: 'text',
      content: content.text,
      x: 50,
      y: currentY,
      width: 700,
      height: 300,
      style: {
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#333333'
      }
    })

    slides.push({
      id: `slide_summary_${index}_${Date.now()}`,
      title: content.title,
      elements: slideElements
    })
  })

  return slides
}

// Algorithmic content summarization without AI
function extractKeyContent(data: any) {
  const keyContent = []

  // Use sections if available (already structured)
  if (data.sections && data.sections.length > 0) {
    data.sections.slice(0, 8).forEach((section: any) => {
      if (section.content && section.content.length > 0) {
        const text = section.content.slice(0, 2).join('\n\n')
        const image = section.images && section.images.length > 0 ? section.images[0].src : null

        keyContent.push({
          title: section.heading,
          text: text,
          image: image
        })
      }
    })
  }
  // Fallback to paragraphs and headings
  else if (data.paragraphs && data.paragraphs.length > 0) {
    const importantParagraphs = data.paragraphs
      .filter((p: string) => p.length > 100 && p.length < 1000)
      .slice(0, 6)

    // Group paragraphs into logical slides
    for (let i = 0; i < importantParagraphs.length; i += 2) {
      const title = data.headings && data.headings[i]
        ? data.headings[i].text
        : `Key Point ${Math.floor(i / 2) + 1}`

      const text = importantParagraphs.slice(i, i + 2).join('\n\n')

      keyContent.push({
        title: title,
        text: text,
        image: null
      })
    }
  }

  // Add overview slide if we have content
  if (keyContent.length > 0) {
    const overviewText = `This summary contains ${keyContent.length} key sections from the original content.`
    keyContent.unshift({
      title: 'Content Overview',
      text: overviewText,
      image: null
    })
  }

  return keyContent
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
