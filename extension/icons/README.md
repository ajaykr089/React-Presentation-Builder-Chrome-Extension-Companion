# Chrome Extension Icons

This directory contains the icon files for the Presentation Builder Chrome extension.

## Current Status
- ✅ **icon.svg**: Source vector icon (128x128) - READY
- ❌ **icon16.png**: 16x16 PNG - NEEDS GENERATION
- ❌ **icon32.png**: 32x32 PNG - NEEDS GENERATION
- ❌ **icon48.png**: 48x48 PNG - NEEDS GENERATION
- ❌ **icon128.png**: 128x128 PNG - NEEDS GENERATION

## Icon Design
The icon represents a presentation slide with:
- Blue background (#1890ff) matching the app theme
- White slide with title bar and content
- Bullet points for list items
- Clean, professional appearance

## How to Generate PNG Files

### Option 1: ImageMagick (Recommended)
```bash
# Install ImageMagick
brew install imagemagick  # macOS
# or visit: https://imagemagick.org/

# Generate PNG files
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 32x32 icon32.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### Option 2: Online Converters
1. Visit any SVG to PNG converter (e.g., cloudconvert.com, convertio.co)
2. Upload `icon.svg`
3. Convert to PNG with sizes: 16x16, 32x32, 48x48, 128x128
4. Download and replace the placeholder files

### Option 3: Design Software
- Open `icon.svg` in Figma, Sketch, or Adobe Illustrator
- Export PNG files at required sizes
- Replace the placeholder files

## After Generating PNGs
1. Replace the empty placeholder files with actual PNGs
2. Uncomment the icon references in `../manifest.json`:
   ```json
   "action": {
     "default_icon": {
       "16": "icons/icon16.png",
       "32": "icons/icon32.png",
       "48": "icons/icon48.png",
       "128": "icons/icon128.png"
     }
   },
   "icons": {
     "16": "icons/icon16.png",
     "32": "icons/icon32.png",
     "48": "icons/icon48.png",
     "128": "icons/icon128.png"
   }
   ```
3. Reload the extension in Chrome

## Icon Usage
- **16x16**: Extension icon in toolbar
- **32x32**: Extension management page
- **48x48**: Chrome Web Store listing
- **128x128**: High-resolution displays
