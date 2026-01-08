// Content script for extracting web page content
// This script runs on all web pages and provides content extraction functionality

(function() {
  // Avoid redeclaration by checking if already exists
  if (window.presentationBuilderContentExtractor) {
    return; // Already initialized
  }

  class ContentExtractor {
    constructor() {
      this.extractedContent = null;
    }

    // Main extraction method with comprehensive content analysis
    extract() {
      try {
        const content = {
          url: window.location.href,
          title: this.getTitle(),
          description: this.getMetaDescription(),
          author: this.getAuthor(),
          publishedDate: this.getPublishedDate(),
          headings: this.getHeadings(),
          paragraphs: this.getParagraphs(),
          lists: this.getLists(),
          quotes: this.getQuotes(),
          links: this.getImportantLinks(),
          images: this.getImages(),
          codeBlocks: this.getCodeBlocks(),
          tables: this.getTables(),
          keyInsights: this.extractKeyInsights(),
          readingTime: this.calculateReadingTime(),
          contentType: this.detectContentType(),
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

    // Extract page title with fallbacks
    getTitle() {
      // Try multiple sources for the best title
      const titleSources = [
        () => document.title,
        () => document.querySelector('h1')?.textContent?.trim(),
        () => document.querySelector('title')?.textContent?.trim(),
        () => document.querySelector('[property="og:title"]')?.content,
        () => document.querySelector('meta[name="title"]')?.content
      ];

      for (const getTitle of titleSources) {
        try {
          const title = getTitle();
          if (title && title.trim().length > 0) {
            return title.trim();
          }
        } catch (e) {
          // Continue to next source
        }
      }

      return 'Untitled Page';
    }

    // Extract meta description
    getMetaDescription() {
      const sources = [
        () => document.querySelector('meta[name="description"]')?.content,
        () => document.querySelector('[property="og:description"]')?.content,
        () => document.querySelector('meta[name="twitter:description"]')?.content
      ];

      for (const getDesc of sources) {
        try {
          const desc = getDesc();
          if (desc && desc.trim().length > 10) {
            return desc.trim();
          }
        } catch (e) {
          // Continue to next source
        }
      }

      return '';
    }

    // Extract author information
    getAuthor() {
      const sources = [
        () => document.querySelector('meta[name="author"]')?.content,
        () => document.querySelector('[property="article:author"]')?.content,
        () => document.querySelector('.author')?.textContent?.trim(),
        () => document.querySelector('[rel="author"]')?.textContent?.trim(),
        () => document.querySelector('.byline')?.textContent?.trim()
      ];

      for (const getAuthor of sources) {
        try {
          const author = getAuthor();
          if (author && author.trim().length > 0) {
            return author.trim();
          }
        } catch (e) {
          // Continue to next source
        }
      }

      return '';
    }

    // Extract published date
    getPublishedDate() {
      const sources = [
        () => document.querySelector('meta[property="article:published_time"]')?.content,
        () => document.querySelector('meta[name="publish-date"]')?.content,
        () => document.querySelector('time[datetime]')?.dateTime,
        () => document.querySelector('.published')?.textContent?.trim(),
        () => document.querySelector('.date')?.textContent?.trim()
      ];

      for (const getDate of sources) {
        try {
          const dateStr = getDate();
          if (dateStr) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              return date.toISOString();
            }
          }
        } catch (e) {
          // Continue to next source
        }
      }

      return '';
    }

    // Extract headings with hierarchy and context
    getHeadings() {
      const headings = [];
      const selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
          const text = element.textContent?.trim();
          if (text && text.length > 0 && text.length < 200) { // Reasonable length
            // Get context around the heading
            const context = this.getHeadingContext(element);

            headings.push({
              level: parseInt(selector.charAt(1)),
              text: text,
              id: element.id || `${selector}_${index}`,
              context: context,
              position: this.getElementPosition(element)
            });
          }
        });
      });

      return headings;
    }

    // Get context around a heading
    getHeadingContext(element) {
      const context = [];
      let sibling = element.nextElementSibling;

      // Get next few meaningful elements
      for (let i = 0; i < 3 && sibling; i++) {
        if (sibling.tagName === 'P' ||
            sibling.tagName === 'DIV' ||
            sibling.tagName === 'SPAN' ||
            sibling.tagName === 'ARTICLE') {
          const text = sibling.textContent?.trim();
          if (text && text.length > 20) {
            context.push(text.substring(0, 150));
            break;
          }
        }
        sibling = sibling.nextElementSibling;
      }

      return context;
    }

    // Get element position for better slide organization
    getElementPosition(element) {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        order: Array.from(element.parentElement?.children || []).indexOf(element)
      };
    }

    // Extract paragraphs with comprehensive content discovery
    getParagraphs() {
      const paragraphs = [];

      // Multiple selectors to find content across different site structures
      const selectors = [
        'p',  // Standard paragraphs
        '[data-content="true"]',  // Content markers
        '.content p', '.post-content p', 'article p',  // Article content
        '.entry-content p', '.post p', '.article-body p',  // Blog content
        'main p', '[role="main"] p',  // Main content areas
        '.text p', '.body p', '.description p',  // Content containers
        'div[data-testid*="content"] p',  // Social media content
        '.markdown-body p', '.prose p',  // Documentation content
        '.blog-content p', '.news-content p'  // Specialized content
      ];

      const allElements = new Set();

      // Collect elements from all selectors
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => allElements.add(element));
        } catch (e) {
          // Skip invalid selectors
        }
      });

      // Also try to find content in common content containers
      const contentContainers = [
        'main', 'article', '[role="main"]', '.content', '.post-content',
        '.entry-content', '.article-body', '.text', '.body', '.description',
        '.blog-content', '.news-content', '.markdown-body', '.prose'
      ];

      contentContainers.forEach(containerSelector => {
        try {
          const containers = document.querySelectorAll(containerSelector);
          containers.forEach(container => {
            const paragraphs = container.querySelectorAll('p, div, span');
            paragraphs.forEach(element => {
              if (element.textContent?.trim()) {
                allElements.add(element);
              }
            });
          });
        } catch (e) {
          // Skip invalid selectors
        }
      });

      // Process collected elements
      Array.from(allElements).forEach((element, index) => {
        const text = element.textContent?.trim();
        if (text && text.length > 20 && text.length < 3000) { // More lenient length limits
          // Less aggressive boilerplate filtering
          if (!this.isMajorBoilerplateText(text)) {
            paragraphs.push({
              text: text,
              id: `para_${index}`,
              wordCount: text.split(/\s+/).length,
              position: this.getElementPosition(element),
              context: this.getParagraphContext(element),
              tagName: element.tagName.toLowerCase(),
              className: element.className || ''
            });
          }
        }
      });

      // Sort by position and relevance
      paragraphs.sort((a, b) => {
        // Prefer content from main content areas
        const aScore = this.getContentRelevanceScore(a);
        const bScore = this.getContentRelevanceScore(b);
        return bScore - aScore;
      });

      return paragraphs.slice(0, 50); // Increased limit for more comprehensive content
    }

    // Check if text looks like boilerplate
    isBoilerplateText(text) {
      const boilerplatePatterns = [
        /copyright/i,
        /terms of use/i,
        /privacy policy/i,
        /cookie policy/i,
        /all rights reserved/i,
        /subscribe/i,
        /newsletter/i,
        /share this/i,
        /related articles/i,
        /advertisement/i
      ];

      return boilerplatePatterns.some(pattern => pattern.test(text)) ||
             text.length < 50; // Too short to be meaningful
    }

    // Less aggressive boilerplate filtering for comprehensive content
    isMajorBoilerplateText(text) {
      const majorBoilerplatePatterns = [
        /© \d{4}/,  // Copyright notices
        /all rights reserved/i,
        /terms of service/i,
        /privacy policy/i,
        /cookie preferences/i,
        /sign up for/i,
        /subscribe to/i,
        /follow us on/i,
        /share this/i,
        /related articles/i,
        /advertisement/i,
        /sponsored content/i
      ];

      return majorBoilerplatePatterns.some(pattern => pattern.test(text)) &&
             text.length < 100; // Only filter short boilerplate
    }

    // Calculate content relevance score for sorting
    getContentRelevanceScore(paragraph) {
      let score = 0;

      // Prefer content from main content areas
      if (paragraph.className?.includes('content') ||
          paragraph.className?.includes('post') ||
          paragraph.className?.includes('article') ||
          paragraph.className?.includes('entry')) {
        score += 20;
      }

      // Prefer paragraphs that are substantial
      if (paragraph.wordCount > 20) score += 10;
      if (paragraph.wordCount > 50) score += 10;

      // Prefer paragraphs with context (headings)
      if (paragraph.context?.heading) score += 15;

      // Prefer certain content types
      if (paragraph.tagName === 'p') score += 5;

      // Penalize very short content
      if (paragraph.wordCount < 10) score -= 10;

      return score;
    }

    // Get context around a paragraph
    getParagraphContext(element) {
      const context = {};

      // Find the nearest heading above this paragraph
      let sibling = element.previousElementSibling;
      while (sibling) {
        if (sibling.tagName?.match(/^H[1-6]$/)) {
          context.heading = sibling.textContent?.trim();
          break;
        }
        sibling = sibling.previousElementSibling;
      }

      return context;
    }

    // Extract lists (ordered and unordered)
    getLists() {
      const lists = [];
      const listElements = document.querySelectorAll('ul, ol');

      listElements.forEach((listElement, listIndex) => {
        const items = Array.from(listElement.querySelectorAll('li'))
          .map(li => li.textContent?.trim())
          .filter(text => text && text.length > 0);

        if (items.length > 0 && items.length <= 15) { // Reasonable list size
          // Get context heading
          let heading = '';
          let sibling = listElement.previousElementSibling;
          for (let i = 0; i < 3 && sibling; i++) {
            if (sibling.tagName?.match(/^H[1-6]$/)) {
              heading = sibling.textContent?.trim() || '';
              break;
            }
            sibling = sibling.previousElementSibling;
          }

          lists.push({
            type: listElement.tagName.toLowerCase(),
            items: items,
            heading: heading,
            id: `list_${listIndex}`
          });
        }
      });

      return lists.slice(0, 10);
    }

    // Extract quotes and blockquotes
    getQuotes() {
      const quotes = [];
      const quoteElements = document.querySelectorAll('blockquote, q, .quote, [data-type="quote"]');

      quoteElements.forEach((element, index) => {
        const text = element.textContent?.trim();
        if (text && text.length > 20 && text.length < 1000) {
          quotes.push({
            text: text,
            author: this.getQuoteAuthor(element),
            id: `quote_${index}`
          });
        }
      });

      return quotes.slice(0, 5);
    }

    // Extract quote author if available
    getQuoteAuthor(quoteElement) {
      // Look for author information near the quote
      const siblings = [
        quoteElement.nextElementSibling,
        quoteElement.previousElementSibling,
        ...Array.from(quoteElement.querySelectorAll('*'))
      ];

      for (const sibling of siblings) {
        if (sibling) {
          const text = sibling.textContent?.trim();
          const className = sibling.className?.toString() || '';

          if (text &&
              (className.includes('author') ||
               className.includes('cite') ||
               text.startsWith('—') ||
               text.startsWith('-') ||
               text.match(/^[A-Z][a-z]+ [A-Z][a-z]+/))) { // Looks like a name
            return text.replace(/^[-—]\s*/, '').trim();
          }
        }
      }

      return '';
    }

    // Extract important links
    getImportantLinks() {
      const links = [];
      const linkElements = document.querySelectorAll('a[href]');

      linkElements.forEach((link, index) => {
        const href = link.href;
        const text = link.textContent?.trim();

        if (text && text.length > 0 && text.length < 100 &&
            href && href !== window.location.href &&
            !href.includes('#') && // Skip anchor links
            !href.includes('javascript:') &&
            !this.isNavigationLink(href, text)) {

          links.push({
            text: text,
            url: href,
            id: `link_${index}`
          });
        }
      });

      return links.slice(0, 10);
    }

    // Check if link looks like navigation
    isNavigationLink(href, text) {
      const navPatterns = [
        /home/i, /about/i, /contact/i, /privacy/i, /terms/i,
        /login/i, /signup/i, /register/i, /menu/i, /navigation/i
      ];

      return navPatterns.some(pattern => pattern.test(text)) ||
             href.includes(window.location.hostname) === false; // External links might be important
    }

    // Extract images with better filtering
    getImages() {
      const images = [];
      const imgElements = document.querySelectorAll('img');

      imgElements.forEach((img, index) => {
        // More sophisticated image filtering
        if (img.width > 50 && img.height > 50 &&
            img.naturalWidth > 100 && img.naturalHeight > 100 &&
            !this.isIconImage(img)) {

          // Get image context
          const context = this.getImageContext(img);

          images.push({
            src: img.src,
            alt: img.alt || '',
            title: img.title || '',
            width: img.naturalWidth,
            height: img.naturalHeight,
            context: context,
            id: `img_${index}`
          });
        }
      });

      return images.slice(0, 8); // Limit to most relevant images
    }

    // Check if image is likely an icon
    isIconImage(img) {
      return (img.width < 100 && img.height < 100) ||
             img.src.includes('icon') ||
             img.src.includes('logo') ||
             img.className?.toString().includes('icon');
    }

    // Get context around an image
    getImageContext(img) {
      const context = {};

      // Find caption
      const siblings = [
        img.nextElementSibling,
        img.previousElementSibling,
        img.parentElement?.nextElementSibling,
        img.parentElement?.previousElementSibling
      ];

      for (const sibling of siblings) {
        if (sibling) {
          const text = sibling.textContent?.trim();
          const tagName = sibling.tagName?.toLowerCase();

          if (text && (tagName === 'figcaption' ||
                      sibling.className?.toString().includes('caption') ||
                      text.length < 200)) {
            context.caption = text;
            break;
          }
        }
      }

      return context;
    }

    // Extract code blocks
    getCodeBlocks() {
      const codeBlocks = [];
      const codeElements = document.querySelectorAll('pre, code, .code, .syntax-highlight, [data-lang]');

      codeElements.forEach((element, index) => {
        const text = element.textContent?.trim();
        if (text && text.length > 10 && text.length < 2000) {
          codeBlocks.push({
            code: text,
            language: this.detectCodeLanguage(element),
            id: `code_${index}`
          });
        }
      });

      return codeBlocks.slice(0, 5);
    }

    // Detect programming language from code element
    detectCodeLanguage(element) {
      const className = element.className?.toString() || '';
      const dataLang = element.getAttribute('data-lang') ||
                      element.getAttribute('lang') ||
                      element.parentElement?.getAttribute('data-lang');

      if (dataLang) return dataLang;

      // Try to detect from class names
      const langMatches = className.match(/(?:lang|language)-(\w+)/);
      if (langMatches) return langMatches[1];

      // Common language keywords detection
      const text = element.textContent || '';
      if (text.includes('function') && text.includes('{')) return 'javascript';
      if (text.includes('def ') && text.includes(':')) return 'python';
      if (text.includes('<?php')) return 'php';
      if (text.includes('public class') && text.includes('{')) return 'java';

      return 'text';
    }

    // Extract tables
    getTables() {
      const tables = [];
      const tableElements = document.querySelectorAll('table');

      tableElements.forEach((table, index) => {
        try {
          const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim() || '');
          const rows = Array.from(table.querySelectorAll('tr')).slice(1).map(tr =>
            Array.from(tr.querySelectorAll('td')).map(td => td.textContent?.trim() || '')
          );

          if (headers.length > 0 && rows.length > 0 && rows.length <= 20) {
            tables.push({
              headers: headers,
              rows: rows.slice(0, 10), // Limit rows
              id: `table_${index}`
            });
          }
        } catch (error) {
          // Skip problematic tables
        }
      });

      return tables.slice(0, 3);
    }

    // Extract key insights from content
    extractKeyInsights() {
      const insights = [];
      const content = this.getParagraphs();

      // Look for sentences that might be key insights
      content.forEach(paragraph => {
        const sentences = paragraph.text.split(/[.!?]+/).filter(s => s.trim().length > 20);

        sentences.forEach(sentence => {
          const trimmed = sentence.trim();
          // Look for sentences that start with numbers, contain keywords, or are relatively short but informative
          if (trimmed.length > 30 && trimmed.length < 200 &&
              (trimmed.match(/^\d+/) || // Numbered points
               trimmed.match(/(?:important|key|main|crucial|essential|significant)/i) ||
               trimmed.match(/(?:benefit|advantage|feature|solution|result)/i))) {
            insights.push({
              text: trimmed,
              type: 'insight',
              confidence: this.calculateInsightConfidence(trimmed)
            });
          }
        });
      });

      return insights.slice(0, 8).sort((a, b) => b.confidence - a.confidence);
    }

    // Calculate confidence score for insights
    calculateInsightConfidence(text) {
      let score = 0;

      // Keywords that indicate important information
      const keywords = ['important', 'key', 'main', 'crucial', 'essential', 'significant',
                       'benefit', 'advantage', 'feature', 'solution', 'result', 'best',
                       'recommend', 'should', 'must', 'need to'];

      keywords.forEach(keyword => {
        if (text.toLowerCase().includes(keyword)) score += 10;
      });

      // Length bonus (not too short, not too long)
      if (text.length > 50 && text.length < 150) score += 5;

      // Starts with number or bullet indicator
      if (text.match(/^\d+/) || text.match(/^[-•*]/)) score += 5;

      return score;
    }

    // Calculate reading time
    calculateReadingTime() {
      const content = this.getParagraphs();
      const totalWords = content.reduce((sum, para) => sum + para.wordCount, 0);
      const wordsPerMinute = 200; // Average reading speed

      return Math.max(1, Math.ceil(totalWords / wordsPerMinute));
    }

    // Detect content type
    detectContentType() {
      const url = window.location.href.toLowerCase();
      const title = document.title.toLowerCase();
      const content = this.getParagraphs();

      if (url.includes('/blog/') || url.includes('/article/') || title.includes('blog')) {
        return 'blog_post';
      }

      if (url.includes('/news/') || url.includes('/article/') || title.includes('news')) {
        return 'news_article';
      }

      if (url.includes('/tutorial/') || url.includes('/guide/') || title.includes('tutorial')) {
        return 'tutorial';
      }

      if (url.includes('/docs/') || url.includes('/documentation/') || title.includes('docs')) {
        return 'documentation';
      }

      if (content.length > 10 && content.some(p => p.text.includes('function') || p.text.includes('class'))) {
        return 'technical';
      }

      return 'general';
    }

    // Get structured content for presentation generation
    getStructuredContent() {
      const extracted = this.extract();

      // Create intelligent slide structure based on content analysis
      const slides = [];
      const usedContent = new Set(); // Track used content to avoid duplicates

      // Title slide - always first
      slides.push({
        title: extracted.title,
        type: 'title',
        content: {
          title: extracted.title,
          subtitle: extracted.description || extracted.url,
          author: extracted.author,
          publishedDate: extracted.publishedDate,
          readingTime: `${extracted.readingTime} min read`
        }
      });

      // Add image slides FIRST (before text content) - include all qualifying images
      extracted.images.forEach((image, index) => {
        // Include images that are substantial, not icons/logos
        if (image.width > 200 && image.height > 150 &&
            !image.src.includes('icon') && !image.src.includes('logo')) {
          const title = image.context.caption ||
                       image.alt ||
                       image.title ||
                       `Visual Content ${index + 1}`;

          slides.push({
            title: title,
            type: 'image',
            content: {
              src: image.src,
              alt: image.alt || title,
              caption: image.context.caption || image.alt,
              width: Math.min(image.width, 600), // Reasonable size
              height: Math.min(image.height, 400)
            }
          });
        }
      });

      // Process headings and create section slides - avoid duplicates
      const processedHeadings = [];
      extracted.headings.forEach((heading, index) => {
        if (heading.level <= 2 && heading.text.length < 80 && !usedContent.has(heading.text)) { // Only major headings
          // Find unique content under this heading
          const headingContent = this.getContentUnderHeading(heading, extracted);

          if (headingContent && !usedContent.has(headingContent.substring(0, 100))) {
            processedHeadings.push({
              title: heading.text,
              type: 'section',
              content: headingContent,
              level: heading.level,
              index: index
            });
            usedContent.add(heading.text);
            usedContent.add(headingContent.substring(0, 100));
          }
        }
      });

      // Add section slides (limit to avoid too many)
      processedHeadings.slice(0, 6).forEach(section => {
        slides.push({
          title: section.title,
          type: 'section',
          content: section.content
        });
      });

      // Add list slides for extracted lists - only if content is unique
      extracted.lists.forEach((list, index) => {
        if (list.items.length > 0 && list.items.length <= 8) {
          const listContent = list.items.join(' ').toLowerCase();
          if (!usedContent.has(listContent.substring(0, 50))) {
            slides.push({
              title: list.heading || `Key Points ${index + 1}`,
              type: 'list',
              content: {
                type: list.type,
                items: list.items.slice(0, 6) // Limit items per slide
              }
            });
            usedContent.add(listContent.substring(0, 50));
          }
        }
      });

      // Add key insights slide if we have insights and they're unique
      if (extracted.keyInsights.length > 0) {
        const insightsContent = extracted.keyInsights.map(i => i.text).join(' ').toLowerCase();
        if (!usedContent.has(insightsContent.substring(0, 100))) {
          slides.push({
            title: 'Key Insights',
            type: 'insights',
            content: extracted.keyInsights.slice(0, 4).map(insight => insight.text)
          });
          usedContent.add(insightsContent.substring(0, 100));
        }
      }

      // Add quotes slide if we have quotes
      if (extracted.quotes.length > 0) {
        const quotesContent = extracted.quotes.map(q => q.text).join(' ').toLowerCase();
        if (!usedContent.has(quotesContent.substring(0, 50))) {
          slides.push({
            title: 'Notable Quotes',
            type: 'quotes',
            content: extracted.quotes.slice(0, 3).map(quote => ({
              text: quote.text,
              author: quote.author
            }))
          });
          usedContent.add(quotesContent.substring(0, 50));
        }
      }

      // Add code slides for code blocks
      extracted.codeBlocks.forEach((codeBlock, index) => {
        const codePreview = codeBlock.code.substring(0, 100);
        if (!usedContent.has(codePreview)) {
          slides.push({
            title: `Code Example ${index + 1}`,
            type: 'code',
            content: {
              code: codeBlock.code.length > 800 ?
                    codeBlock.code.substring(0, 800) + '...' :
                    codeBlock.code,
              language: codeBlock.language
            }
          });
          usedContent.add(codePreview);
        }
      });

      // Add table slides for data tables
      extracted.tables.forEach((table, index) => {
        if (table.rows.length > 0) {
          const tableContent = table.headers.join(' ') + table.rows[0]?.join(' ');
          if (!usedContent.has(tableContent.substring(0, 50))) {
            slides.push({
              title: `Data Table ${index + 1}`,
              type: 'table',
              content: {
                headers: table.headers,
                rows: table.rows.slice(0, 6) // Limit rows
              }
            });
            usedContent.add(tableContent.substring(0, 50));
          }
        }
      });

      // Add important links slide (only if we have enough slides already)
      if (extracted.links.length >= 3 && slides.length < 8) {
        const linksContent = extracted.links.map(l => l.text).join(' ').toLowerCase();
        if (!usedContent.has(linksContent.substring(0, 50))) {
          slides.push({
            title: 'Related Links',
            type: 'links',
            content: extracted.links.slice(0, 5).map(link => ({
              text: link.text,
              url: link.url
            }))
          });
        }
      }

      // Limit to reasonable number of slides (8-12 is optimal for presentations)
      const finalSlides = slides.slice(0, 12);

      return {
        ...extracted,
        slides: finalSlides,
        slideCount: finalSlides.length
      };
    }

    // Get content that appears under a specific heading
    getContentUnderHeading(heading, extractedData) {
      const content = [];
      const headingIndex = extractedData.headings.findIndex(h =>
        h.id === heading.id || h.text === heading.text
      );

      if (headingIndex >= 0) {
        // Get paragraphs that appear after this heading
        const startPosition = heading.position.order;

        extractedData.paragraphs.forEach(para => {
          if (para.position.order > startPosition &&
              para.position.order < startPosition + 10) { // Within reasonable distance
            content.push(para.text);
          }
        });

        // Get lists that appear near this heading
        extractedData.lists.forEach(list => {
          // Simple heuristic: if list appears after heading, include it
          content.push(`• ${list.items.slice(0, 3).join('\n• ')}`);
        });
      }

      return content.slice(0, 3).join('\n\n'); // Limit content length
    }
  }

  // Initialize content extractor and store globally
  const extractor = new ContentExtractor();
  window.presentationBuilderContentExtractor = extractor;

  // Listen for messages from popup/background scripts
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
      // Simple ping to check if content script is available
      sendResponse({ status: 'ready' });
    } else if (request.action === 'extractContent') {
      try {
        const content = extractor.getStructuredContent();
        sendResponse(content);
      } catch (error) {
        console.error('Content extraction failed:', error);
        sendResponse({
          url: window.location.href,
          title: document.title || 'Untitled',
          error: error.message,
          timestamp: new Date().toISOString(),
          type: 'webpage'
        });
      }
    }
    return true; // Keep message channel open for async response
  });

  // Also make extraction function available globally for direct script execution
  window.extractPageContent = () => extractor.getStructuredContent();

  // Auto-run extraction when script loads (for debugging)
  if (window.location.hostname === 'localhost') {
    console.log('Content extraction ready. Call window.extractPageContent() to test.');
  }

})(); // End of IIFE
