import { NextRequest, NextResponse } from 'next/server'

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
      console.log('Alternative caption extraction failed:', error instanceof Error ? error.message : error);
    }

    return null;
  } catch (error) {
    console.error('YouTube transcript extraction error:', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, url, title } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    console.log('Extracting transcript for video:', videoId, title);

    const transcript = await extractYouTubeTranscript(videoId);

    if (transcript) {
      console.log(`Successfully extracted transcript: ${transcript.length} characters`);
      return NextResponse.json({
        success: true,
        transcript: transcript,
        videoId: videoId,
        title: title,
        url: url
      });
    } else {
      console.log('No transcript available for video:', videoId);
      return NextResponse.json({
        success: false,
        transcript: null,
        videoId: videoId,
        message: 'No transcript available for this video'
      });
    }

  } catch (error) {
    console.error('YouTube transcript API error:', error instanceof Error ? error.message : error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to extract transcript', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json(
      { error: 'Video ID is required' },
      { status: 400 }
    );
  }

  try {
    console.log('GET request for transcript:', videoId);
    const transcript = await extractYouTubeTranscript(videoId);

    return NextResponse.json({
      success: true,
      transcript: transcript,
      videoId: videoId
    });
  } catch (error) {
    console.error('YouTube transcript GET error:', error instanceof Error ? error.message : error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to extract transcript', details: errorMessage },
      { status: 500 }
    );
  }
}
