// Background service worker for Presentation Builder Chrome Extension
// Handles extension lifecycle, cross-origin requests, and communication between components

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Presentation Builder Extension installed');

    // Set default settings
    chrome.storage.sync.set({
      autoOpen: true,
      webAppUrl: 'http://localhost:3000'
    });

    // Create context menu items
    createContextMenus();

  } else if (details.reason === 'update') {
    console.log('Presentation Builder Extension updated');
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'extract-selection') {
    handleTextSelection(tab, info.selectionText);
  } else if (info.menuItemId === 'extract-page') {
    handlePageExtraction(tab);
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'extractContent':
      handleContentExtraction(sender.tab, sendResponse);
      return true; // Keep channel open for async response

    case 'sendToWebApp':
      handleSendToWebApp(request.data, sendResponse);
      return true;

    case 'getSettings':
      handleGetSettings(sendResponse);
      return true;

    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Handle tab updates to show page action
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    updatePageAction(tab);
  }
});

// Create context menus
function createContextMenus() {
  chrome.contextMenus.create({
    id: 'extract-selection',
    title: 'Create slide from selection',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'extract-page',
    title: 'Extract page to presentation',
    contexts: ['page']
  });
}

// Update page action based on current URL
function updatePageAction(tab) {
  const url = tab.url;

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    chrome.action.setTitle({ tabId: tab.id, title: 'Extract YouTube to Presentation' });
    chrome.action.setBadgeText({ tabId: tab.id, text: 'YT' });
    chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: '#ff0000' });
  } else {
    chrome.action.setTitle({ tabId: tab.id, title: 'Extract Page to Presentation' });
    chrome.action.setBadgeText({ tabId: tab.id, text: '' });
  }
}

// Handle content extraction from tab
async function handleContentExtraction(tab, sendResponse) {
  try {
    if (!tab || !tab.id) {
      throw new Error('No active tab found');
    }

    // Execute content script to extract data
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // This function runs in the page context
        const extractor = {
          getTitle: () => document.title,
          getHeadings: () => Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
            level: parseInt(h.tagName.charAt(1)),
            text: h.textContent.trim()
          })),
          getTextContent: () => {
            const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
            return Array.from(elements).map(el => el.textContent.trim()).filter(text => text.length > 20);
          }
        };

        return {
          url: window.location.href,
          title: extractor.getTitle(),
          headings: extractor.getHeadings(),
          textContent: extractor.getTextContent(),
          timestamp: new Date().toISOString(),
          type: 'webpage'
        };
      }
    });

    if (results && results[0] && results[0].result) {
      sendResponse({ success: true, data: results[0].result });
    } else {
      throw new Error('Content extraction failed');
    }

  } catch (error) {
    console.error('Content extraction error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle sending data to web app
async function handleSendToWebApp(data, sendResponse) {
  try {
    // Get web app URL from storage
    const result = await chrome.storage.sync.get(['webAppUrl']);
    const webAppUrl = result.webAppUrl || 'http://localhost:3000';

    // Send data to web app
    const response = await fetch(`${webAppUrl}/api/extension/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();
      sendResponse({ success: true, data: result });
    } else {
      throw new Error('Failed to send to web app');
    }

  } catch (error) {
    console.error('Send to web app error:', error);

    // Fallback: store locally
    const key = `pending_import_${Date.now()}`;
    await chrome.storage.local.set({ [key]: data });

    sendResponse({
      success: false,
      error: error.message,
      storedLocally: true,
      key: key
    });
  }
}

// Handle text selection
async function handleTextSelection(tab, selectedText) {
  if (!selectedText || selectedText.trim().length === 0) return;

  const data = {
    url: tab.url,
    title: tab.title,
    type: 'selection',
    content: selectedText.trim(),
    timestamp: new Date().toISOString()
  };

  // Send to web app
  chrome.runtime.sendMessage({
    action: 'sendToWebApp',
    data: data
  }, (response) => {
    if (response && response.success) {
      // Show success notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Selection Added',
        message: 'Selected text added to your presentation!'
      });
    }
  });
}

// Handle page extraction
async function handlePageExtraction(tab) {
  chrome.runtime.sendMessage({
    action: 'extractContent'
  }, (response) => {
    if (response && response.success) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Page Extracted',
        message: 'Page content added to your presentation!'
      });
    }
  });
}

// Handle settings retrieval
function handleGetSettings(sendResponse) {
  chrome.storage.sync.get(['autoOpen', 'webAppUrl'], (result) => {
    sendResponse({
      autoOpen: result.autoOpen !== false,
      webAppUrl: result.webAppUrl || 'http://localhost:3000'
    });
  });
}

// Error handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle any unhandled messages
  if (chrome.runtime.lastError) {
    console.error('Runtime error:', chrome.runtime.lastError);
    sendResponse({ error: chrome.runtime.lastError.message });
  }
});
