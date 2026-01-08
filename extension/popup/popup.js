// Popup script for Presentation Builder Chrome Extension

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const extractPageBtn = document.getElementById('extract-page');
  const extractYoutubeBtn = document.getElementById('extract-youtube');
  const manualTranscriptBtn = document.getElementById('manual-transcript');
  const summarizeBtn = document.getElementById('summarize-content');
  const openAppLink = document.getElementById('open-app');
  const statusMessage = document.getElementById('status-message');
  const autoOpenCheckbox = document.getElementById('auto-open');

  // Load settings
  chrome.storage.sync.get(['autoOpen'], function(result) {
    autoOpenCheckbox.checked = result.autoOpen !== false;
  });

  // Save settings
  autoOpenCheckbox.addEventListener('change', function() {
    chrome.storage.sync.set({ autoOpen: autoOpenCheckbox.checked });
  });

  // Extract current page content
  extractPageBtn.addEventListener('click', async function() {
    try {
      setLoading(true, 'Extracting page content...');

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id) {
        throw new Error('No active tab found');
      }

      // Send message to content script to extract content
      const response = await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tab.id, { action: 'extractContent' }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error('Content script not available. Please refresh the page.'));
            return;
          }

          if (response) {
            resolve(response);
          } else {
            reject(new Error('No response from content script'));
          }
        });
      });

      // Send data to web app
      await sendToWebApp(response);

      showSuccess('Page content extracted successfully!');
      if (autoOpenCheckbox.checked) {
        openWebApp();
      }

    } catch (error) {
      console.error('Error extracting page:', error);
      showError('Failed to extract page content: ' + error.message);
    } finally {
      setLoading(false);
    }
  });

  // Extract YouTube content
  extractYoutubeBtn.addEventListener('click', async function() {
    try {
      setLoading(true, 'Extracting YouTube transcript...');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.url || !isYouTubeUrl(tab.url)) {
        showError('Please navigate to a YouTube video page first');
        return;
      }

      console.log('Sending YouTube URL to backend for transcript extraction:', tab.url);

      // Send YouTube URL to backend for server-side transcript extraction
      const videoId = extractVideoId(tab.url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // First, try to get transcript from backend
      try {
        const transcriptResponse = await fetch('http://localhost:3000/api/extension/youtube-transcript', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId: videoId,
            url: tab.url,
            title: tab.title
          })
        });

        if (transcriptResponse.ok) {
          const transcriptData = await transcriptResponse.json();

          if (transcriptData.transcript && transcriptData.transcript.trim().length > 0) {
            console.log('Transcript extracted from backend, length:', transcriptData.transcript.length);

            const pageData = {
              url: tab.url,
              title: tab.title,
              type: 'youtube',
              content: transcriptData.transcript,
              timestamp: new Date().toISOString()
            };

            await sendToWebApp(pageData);
            showSuccess('YouTube transcript extracted and converted to slides!');
            if (autoOpenCheckbox.checked) {
              openWebApp();
            }
            return;
          }
        }
      } catch (backendError) {
        console.log('Backend transcript extraction failed, falling back to basic extraction:', backendError.message);
      }

      // Fallback: Basic extraction or manual option
      console.log('Transcript extraction failed, creating basic video info slides');

      const pageData = {
        url: tab.url,
        title: tab.title,
        type: 'youtube',
        content: '', // Empty content will trigger fallback in API
        timestamp: new Date().toISOString()
      };

      await sendToWebApp(pageData);
      showSuccess('Video info extracted (transcript not available). Try "Manual Transcript" to paste transcript text.');
      if (autoOpenCheckbox.checked) {
        openWebApp();
      }

    } catch (error) {
      console.error('Error extracting YouTube:', error);
      showError('Failed to extract YouTube content: ' + error.message);
    } finally {
      setLoading(false);
    }
  });

  // Manual transcript input
  manualTranscriptBtn.addEventListener('click', async function() {
    try {
      // Show instructions first
      const instructions = '📝 Manual Transcript Input\n\n' +
        'Paste your transcript text below and it will be converted into presentation slides.\n\n' +
        'Tips:\n' +
        '• Copy transcript from YouTube captions or other sources\n' +
        '• Include timestamps if available (they will be cleaned automatically)\n' +
        '• Long transcripts will be split into multiple slides automatically\n\n' +
        'Enter your transcript text:';

      const transcriptText = prompt(instructions, '');

      if (!transcriptText || transcriptText.trim().length === 0) {
        showError('No transcript text entered');
        return;
      }

      setLoading(true, 'Processing manual transcript...');

      // Clean the transcript text
      const cleanTranscript = transcriptText
        .replace(/\d{1,2}:\d{2}(?::\d{2})?/g, '') // Remove timestamps like 00:00 or 0:00:00
        .replace(/\[.*?\]/g, '') // Remove [brackets]
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      if (cleanTranscript.length < 10) {
        throw new Error('Transcript text is too short');
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      const pageData = {
        url: tab?.url || 'manual-input',
        title: 'Manual Transcript Input',
        type: 'youtube', // Use YouTube processing for transcript slides
        content: cleanTranscript,
        timestamp: new Date().toISOString()
      };

      await sendToWebApp(pageData);
      showSuccess('Manual transcript processed and converted to slides!');
      if (autoOpenCheckbox.checked) {
        openWebApp();
      }

    } catch (error) {
      console.error('Error processing manual transcript:', error);
      showError('Failed to process manual transcript: ' + error.message);
    } finally {
      setLoading(false);
    }
  });

  // Summarize and create slides
  summarizeBtn.addEventListener('click', async function() {
    try {
      setLoading(true, 'Analyzing and summarizing content...');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id) {
        throw new Error('No active tab found');
      }

      // Send message to content script to extract content
      const pageData = await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tab.id, { action: 'extractContent' }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error('Content script not available. Please refresh the page.'));
            return;
          }

          if (response) {
            resolve(response);
          } else {
            reject(new Error('No response from content script'));
          }
        });
      });

      // Mark as summarized content for algorithmic processing
      const summarizedData = {
        ...pageData,
        type: 'summarized'
      };

      await sendToWebApp(summarizedData);
      showSuccess('Content analyzed and summarized slides created!');
      if (autoOpenCheckbox.checked) {
        openWebApp();
      }

    } catch (error) {
      console.error('Error summarizing content:', error);
      showError('Failed to summarize content: ' + error.message);
    } finally {
      setLoading(false);
    }
  });

  // Open web app
  openAppLink.addEventListener('click', function(e) {
    e.preventDefault();
    openWebApp();
  });

  // Helper functions
  function setLoading(loading, message = '') {
    const container = document.getElementById('popup-container');

    if (loading) {
      container.classList.add('loading');
      statusMessage.innerHTML = '<div class="spinner"></div>' + message;
      statusMessage.className = 'status';
    } else {
      container.classList.remove('loading');
      if (!message) {
        statusMessage.textContent = 'Ready to extract content...';
        statusMessage.className = 'status success';
      }
    }
  }

  function showSuccess(message) {
    statusMessage.textContent = '✅ ' + message;
    statusMessage.className = 'status success';
  }

  function showError(message) {
    statusMessage.textContent = '❌ ' + message;
    statusMessage.className = 'status error';
  }

  async function sendToWebApp(data) {
    // Get web app URL from storage or use default
    const result = await chrome.storage.sync.get(['webAppUrl']);
    const webAppUrl = result.webAppUrl || 'http://localhost:3000';

    try {
      // Send data to web app via HTTP POST
      const response = await fetch(`${webAppUrl}/api/extension/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to send data to web app');
      }

      return await response.json();
    } catch (error) {
      console.warn('Could not send to web app, storing locally:', error);
      // Fallback: store in chrome storage
      await chrome.storage.local.set({
        [`pending_import_${Date.now()}`]: data
      });
      throw error;
    }
  }

  async function extractYouTubeTranscript(url) {
    try {
      const videoId = extractVideoId(url);
      if (!videoId) {
        console.log('Could not extract video ID from URL');
        return null;
      }

      console.log('Extracting transcript for video ID:', videoId);

      // Method 1: Try YouTube's timedtext API (most reliable for available transcripts)
      try {
        const transcript = await getYouTubeCaptionTranscript(videoId);
        if (transcript && transcript.trim().length > 0) {
          console.log('Successfully extracted transcript using timedtext API');
          return transcript;
        }
      } catch (e) {
        console.log('Timedtext API failed:', e.message);
      }

      // Method 2: Try alternative caption URLs
      try {
        const transcript = await getAlternativeCaptionTranscript(videoId);
        if (transcript && transcript.trim().length > 0) {
          console.log('Successfully extracted transcript using alternative method');
          return transcript;
        }
      } catch (e) {
        console.log('Alternative method failed:', e.message);
      }

      console.log('No transcript available for this video');
      return null;
    } catch (error) {
      console.error('Error extracting YouTube transcript:', error);
      return null;
    }
  }

  async function getYouTubeCaptionTranscript(videoId) {
    // Try different language codes for captions
    const languages = ['en', 'en-US', 'en-GB', ''];

    for (const lang of languages) {
      try {
        const langParam = lang ? `&lang=${lang}` : '';
        const captionUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&fmt=json3${langParam}`;

        console.log('Trying caption URL:', captionUrl);

        const response = await fetch(captionUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            // Add some headers that might help avoid CORS issues
            'User-Agent': 'Mozilla/5.0 (compatible; PresentationBuilder/1.0)'
          }
        });

        if (response.ok) {
          const data = await response.json();

          if (data.events && data.events.length > 0) {
            // Convert timed text events to plain text
            const transcript = data.events
              .filter(event => event.segs && event.segs.length > 0)
              .map(event => event.segs.map(seg => seg.utf8 || '').join(''))
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();

            if (transcript && transcript.length > 10) {
              return transcript;
            }
          }
        } else {
          console.log(`Caption API returned ${response.status} for lang ${lang || 'auto'}`);
        }
      } catch (error) {
        console.log(`Caption extraction failed for lang ${lang || 'auto'}:`, error.message);

        // If we get a CORS error, try the alternative method immediately
        if (error.message.includes('CORS') || error.message.includes('NetworkError')) {
          console.log('CORS error detected, skipping to alternative method');
          return null; // Let the caller try the alternative method
        }
      }
    }

    return null;
  }

  async function getAlternativeCaptionTranscript(videoId) {
    // Try to get caption info from the video page and then fetch the XML transcript
    try {
      console.log('Trying alternative caption extraction method');

      // First, get the video page to find caption tracks
      const pageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
      if (!pageResponse.ok) {
        throw new Error(`Failed to fetch video page: ${pageResponse.status}`);
      }

      const html = await pageResponse.text();

      // Look for caption tracks in the page
      const captionTracksMatch = html.match(/"captionTracks":\[([^\]]+)\]/);
      if (!captionTracksMatch) {
        console.log('No caption tracks found in video page');
        return null;
      }

      const captionData = captionTracksMatch[1];
      console.log('Found caption tracks data');

      // Extract the base URL for captions
      const baseUrlMatch = captionData.match(/"baseUrl":"([^"]+)"/);
      if (!baseUrlMatch) {
        console.log('No base URL found in caption tracks');
        return null;
      }

      const baseUrl = decodeURIComponent(baseUrlMatch[1]);
      console.log('Found caption base URL:', baseUrl);

      // Fetch the XML transcript
      const xmlResponse = await fetch(baseUrl);
      if (!xmlResponse.ok) {
        throw new Error(`Failed to fetch XML transcript: ${xmlResponse.status}`);
      }

      const xmlText = await xmlResponse.text();
      console.log('Fetched XML transcript, length:', xmlText.length);

      // Parse XML transcript
      const textMatches = xmlText.match(/<text[^>]*>([^<]+)<\/text>/g);
      if (!textMatches) {
        console.log('No text content found in XML transcript');
        return null;
      }

      // Extract and clean the text content
      const transcript = textMatches
        .map(match => {
          // Remove XML tags and decode HTML entities
          const text = match.replace(/<[^>]+>/g, '');
          try {
            // Try to decode HTML entities
            const textarea = document.createElement('textarea');
            textarea.innerHTML = text;
            return textarea.value;
          } catch (e) {
            return text;
          }
        })
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      console.log('Successfully parsed transcript, length:', transcript.length);
      return transcript || null;

    } catch (error) {
      console.error('Alternative caption extraction failed:', error);
      return null;
    }
  }

  async function extractTranscriptFromPage(url) {
    // Alternative method: try to extract transcript from the video page
    // This has limited success but works for some videos

    try {
      const response = await fetch(url);
      if (!response.ok) return null;

      const html = await response.text();

      // Look for transcript data in the HTML
      // This is a basic implementation - more sophisticated parsing would be needed
      const transcriptMatch = html.match(/"transcript":"([^"]+)"/);
      if (transcriptMatch) {
        return decodeURIComponent(transcriptMatch[1]);
      }

      // Look for caption tracks
      const captionMatch = html.match(/"captionTracks":\[([^\]]+)\]/);
      if (captionMatch) {
        // Parse caption track info
        const captionData = captionMatch[1];
        const baseUrlMatch = captionData.match(/"baseUrl":"([^"]+)"/);
        if (baseUrlMatch) {
          const captionUrl = decodeURIComponent(baseUrlMatch[1]);
          const captionResponse = await fetch(captionUrl);
          if (captionResponse.ok) {
            const captionXml = await captionResponse.text();
            // Parse XML transcript (simplified)
            const textMatches = captionXml.match(/<text[^>]*>([^<]+)<\/text>/g);
            if (textMatches) {
              return textMatches
                .map(match => match.replace(/<[^>]+>/g, ''))
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
            }
          }
        }
      }
    } catch (error) {
      console.log('Page transcript extraction failed:', error);
    }

    return null;
  }

  async function summarizeContent(pageData) {
    // Placeholder for AI summarization (Phase 5 feature)
    // In production, this would call OpenAI/Anthropic API

    const summary = {
      ...pageData,
      type: 'summarized',
      summary: `AI-generated summary of: ${pageData.title}`,
      slides: [
        { title: 'Overview', content: 'Key points from the article...' },
        { title: 'Main Ideas', content: 'Important concepts covered...' },
        { title: 'Conclusion', content: 'Summary of findings...' }
      ]
    };

    return summary;
  }

  function isYouTubeUrl(url) {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  function extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  function openWebApp() {
    chrome.tabs.create({ url: 'http://localhost:3001' });
  }
});
