# React-Presentation-Builder-Chrome-Extension-Companion
React Presentation Builder + Chrome Extension Companion

## Features

- **Webpage Content Extraction**: Extract clean, structured content from web pages
- **Automatic Slide Generation**: Convert webpage content into presentation slides
- **Chrome Extension Integration**: Seamlessly import content from any webpage
- **Rich Presentation Editor**: Full-featured slide editor with templates, themes, and elements

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file based on `.env.example` (optional)
4. Run the development server: `npm run dev`

## Webpage Extraction Logic

The extension extracts webpage content following a three-step process:

### Step 1: Extract Raw Structured Data
- Page title
- Headings (H1-H4 only)
- Paragraphs (filtered for relevance)
- Lists (UL/OL with items)
- Tables (headers and rows)
- Images (alt text + src URL)
- Sections (content grouped by nearest heading)

### Step 2: Clean & Normalize Data
- Remove navigation, ads, footers, and boilerplate content
- Filter out short/unrelated content
- Preserve logical content order
- Group content by sections based on headings

### Step 3: Generate Presentation Slides
- Automatically creates slides from cleaned content
- Uses content structure to organize slide content
- Creates logical slide flow based on headings and sections

## API Endpoints

- `POST /api/extension/import` - Import webpage content and generate slides

## Chrome Extension

The extension can be loaded as an unpacked extension in Chrome for development:
1. Build the extension: `npm run build`
2. Open Chrome extensions page
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `extension/` folder
