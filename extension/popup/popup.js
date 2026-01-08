// Popup script for Presentation Builder Chrome Extension

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const extractPageBtn = document.getElementById('extract-page');
  const extractYoutubeBtn = document.getElementById('extract-youtube');
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
      setLoading(true, 'Extracting YouTube content...');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.url || !tab.url.includes('youtube.com')) {
        showError('Please navigate to a YouTube video first');
        return;
      }

      // Extract YouTube transcript
      const transcript = await extractYouTubeTranscript(tab.url);

      if (transcript) {
        const pageData = {
          url: tab.url,
          title: tab.title,
          type: 'youtube',
          content: transcript,
          timestamp: new Date().toISOString()
        };

        await sendToWebApp(pageData);
        showSuccess('YouTube transcript extracted!');
        if (autoOpenCheckbox.checked) {
          openWebApp();
        }
      } else {
        showError('Could not extract YouTube transcript. Video might not have captions.');
      }

    } catch (error) {
      console.error('Error extracting YouTube:', error);
      showError('Failed to extract YouTube content: ' + error.message);
    } finally {
      setLoading(false);
    }
  });

  // Summarize and create slides
  summarizeBtn.addEventListener('click', async function() {
    try {
      setLoading(true, 'Summarizing content...');

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

      // Send to AI summarization service (placeholder for Phase 5)
      const summarizedData = await summarizeContent(pageData);

      await sendToWebApp(summarizedData);
      showSuccess('Content summarized and slides created!');
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
    // This is a simplified version. In production, you'd need to:
    // 1. Extract video ID from URL
    // 2. Use YouTube Data API or a transcript service
    // 3. Handle various caption formats

    try {
      // Placeholder - in real implementation, this would call a service
      const videoId = extractVideoId(url);
      if (!videoId) return null;

      // Simulate API call to get transcript
      const response = await fetch(`https://api.example.com/youtube/transcript/${videoId}`);
      if (response.ok) {
        const data = await response.json();
        return data.transcript;
      }
    } catch (error) {
      console.error('Error extracting YouTube transcript:', error);
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
    chrome.tabs.create({ url: 'http://localhost:3000' });
  }
});
