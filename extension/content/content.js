// Content script for extracting web page content
// This script runs on all web pages and provides content extraction functionality

class ContentExtractor {
  constructor() {
    this.extractedContent = null;
  }

  // Main extraction method
  extract() {
    try {
      const content = {
        url: window.location.href,
        title: this.getTitle(),
        headings: this.getHeadings(),
        textContent: this.getTextContent(),
        images: this.getImages(),
        metaDescription: this.getMetaDescription(),
        timestamp: new Date().toISOString(),
        type: 'webpage'
      };

      this.extractedContent = content;
      return content;
    } catch (error) {
      console.error('Content extraction error:', error);
      return {
        url: window.location.href,
        title: document.title || 'Untitled',
        error: error.message,
        timestamp: new Date().toISOString(),
        type: 'webpage'
      };
    }
  }

  // Extract page title
  getTitle() {
    // Try different title sources
    return document.title ||
           document.querySelector('h1')?.textContent?.trim() ||
           document.querySelector('title')?.textContent?.trim() ||
           'Untitled Page';
  }

  // Extract headings (h1, h2, h3)
  getHeadings() {
    const headings = [];
    const selectors = ['h1', 'h2', 'h3'];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.textContent?.trim();
        if (text && text.length > 0) {
          headings.push({
            level: parseInt(selector.charAt(1)),
            text: text,
            id: element.id || null
          });
        }
      });
    });

    return headings;
  }

  // Extract main text content
  getTextContent() {
    // Remove script, style, and other non-content elements
    const clone = document.body.cloneNode(true);

    // Remove unwanted elements
    const selectorsToRemove = [
      'script', 'style', 'nav', 'header', 'footer',
      'aside', 'advertisement', '.ad', '.ads',
      '.sidebar', '.menu', '.navigation', '.footer',
      '.comments', '.social-share', '.related-posts'
    ];

    selectorsToRemove.forEach(selector => {
      const elements = clone.querySelectorAll(selector);
      elements.forEach(element => element.remove());
    });

    // Extract text from remaining content
    const textElements = clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, div[data-content="true"]');

    const textContent = [];
    textElements.forEach(element => {
      const text = element.textContent?.trim();
      if (text && text.length > 20) { // Only include substantial text blocks
        textContent.push({
          text: text,
          tagName: element.tagName.toLowerCase(),
          className: element.className || null
        });
      }
    });

    // Also try to get main content areas
    const mainContentSelectors = [
      'main', 'article', '[role="main"]', '.content', '.post-content',
      '.entry-content', '.article-content', '#content', '#main'
    ];

    let mainContent = '';
    for (const selector of mainContentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim();
        if (text && text.length > mainContent.length) {
          mainContent = text;
        }
      }
    }

    return {
      paragraphs: textContent,
      mainContent: mainContent,
      wordCount: mainContent.split(/\s+/).length
    };
  }

  // Extract images
  getImages() {
    const images = [];
    const imgElements = document.querySelectorAll('img');

    imgElements.forEach(img => {
      // Only include substantial images
      if (img.width > 100 && img.height > 100) {
        images.push({
          src: img.src,
          alt: img.alt || '',
          width: img.width,
          height: img.height,
          title: img.title || ''
        });
      }
    });

    return images.slice(0, 10); // Limit to first 10 images
  }

  // Extract meta description
  getMetaDescription() {
    const metaDesc = document.querySelector('meta[name="description"]');
    return metaDesc ? metaDesc.content : '';
  }

  // Get structured content for presentation generation
  getStructuredContent() {
    const extracted = this.extract();

    // Convert to presentation-friendly format
    const sections = [];

    // Add title slide
    sections.push({
      title: extracted.title,
      content: extracted.metaDescription || 'Web page content',
      type: 'title'
    });

    // Group headings and content
    extracted.headings.forEach(heading => {
      sections.push({
        title: heading.text,
        content: `Section ${heading.level} content`,
        type: 'section',
        level: heading.level
      });
    });

    // Add main content summary
    if (extracted.textContent.mainContent) {
      const summary = extracted.textContent.mainContent.substring(0, 500) + '...';
      sections.push({
        title: 'Content Summary',
        content: summary,
        type: 'content'
      });
    }

    return {
      ...extracted,
      sections: sections,
      slideCount: Math.min(sections.length, 10) // Suggest slide count
    };
  }
}

// Initialize content extractor
const extractor = new ContentExtractor();

// Listen for messages from popup/background scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContent') {
    const content = extractor.getStructuredContent();
    sendResponse(content);
  }
  return true; // Keep message channel open for async response
});

// Also make extraction function available globally for direct script execution
window.extractPageContent = () => extractor.getStructuredContent();

// Auto-run extraction when script loads (for debugging)
if (window.location.hostname === 'localhost') {
  console.log('Content extraction ready. Call window.extractPageContent() to test.');
}
