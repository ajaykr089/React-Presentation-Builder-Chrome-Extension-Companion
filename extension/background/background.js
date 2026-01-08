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

  // Handle any runtime errors
  if (chrome.runtime.lastError) {
    console.error('Runtime error:', chrome.runtime.lastError);
    sendResponse({ error: chrome.runtime.lastError.message });
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
function handleContentExtraction(tab, sendResponse) {
  if (!tab || !tab.id) {
    sendResponse({ success: false, error: 'No active tab found' });
    return;
  }

  // Check if content script is available by sending a ping first
  chrome.tabs.sendMessage(tab.id, { action: 'ping' }, (pingResponse) => {
    if (chrome.runtime.lastError) {
      console.error('Content script not available:', chrome.runtime.lastError);
      sendResponse({ success: false, error: 'Content script not loaded. Please refresh the page.' });
      return;
    }

    // Content script is available, now extract content
    chrome.tabs.sendMessage(tab.id, { action: 'extractContent' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Content extraction error:', chrome.runtime.lastError);
        sendResponse({ success: false, error: 'Content extraction failed: ' + chrome.runtime.lastError.message });
        return;
      }

      if (response) {
        sendResponse({ success: true, data: response });
      } else {
        sendResponse({ success: false, error: 'No response from content script' });
      }
    });
  });
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

// All message handling is done above in the main listener
