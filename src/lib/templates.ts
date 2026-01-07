import { SlideTemplate } from '@/types/presentation'

export const slideTemplates: SlideTemplate[] = [
  {
    id: 'title-slide',
    name: 'Title Slide',
    category: 'Basic',
    thumbnail: '/templates/title-slide.png',
    description: 'Perfect for presentation titles and introductions',
    elements: [
      {
        type: 'text',
        content: 'Your Presentation Title',
        x: 50,
        y: 200,
        width: 700,
        height: 80,
        style: {
          fontSize: '48px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#000000'
        }
      },
      {
        type: 'text',
        content: 'Subtitle or additional information',
        x: 50,
        y: 320,
        width: 700,
        height: 40,
        style: {
          fontSize: '24px',
          textAlign: 'center',
          color: '#666666'
        }
      }
    ]
  },
  {
    id: 'content-slide',
    name: 'Content Slide',
    category: 'Basic',
    thumbnail: '/templates/content-slide.png',
    description: 'Standard slide for presenting information',
    elements: [
      {
        type: 'text',
        content: 'Slide Title',
        x: 50,
        y: 50,
        width: 700,
        height: 60,
        style: {
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#000000'
        }
      },
      {
        type: 'text',
        content: '• Key point 1\n• Key point 2\n• Key point 3',
        x: 50,
        y: 150,
        width: 350,
        height: 200,
        style: {
          fontSize: '18px',
          lineHeight: '1.6',
          color: '#333333'
        }
      }
    ]
  },
  {
    id: 'two-column',
    name: 'Two Column',
    category: 'Layout',
    thumbnail: '/templates/two-column.png',
    description: 'Compare information side by side',
    elements: [
      {
        type: 'text',
        content: 'Left Column Title',
        x: 50,
        y: 50,
        width: 325,
        height: 50,
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#000000'
        }
      },
      {
        type: 'text',
        content: 'Left column content goes here...',
        x: 50,
        y: 120,
        width: 325,
        height: 150,
        style: {
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#333333'
        }
      },
      {
        type: 'text',
        content: 'Right Column Title',
        x: 425,
        y: 50,
        width: 325,
        height: 50,
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#000000'
        }
      },
      {
        type: 'text',
        content: 'Right column content goes here...',
        x: 425,
        y: 120,
        width: 325,
        height: 150,
        style: {
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#333333'
        }
      }
    ]
  },
  {
    id: 'image-content',
    name: 'Image & Content',
    category: 'Media',
    thumbnail: '/templates/image-content.png',
    description: 'Combine images with descriptive text',
    elements: [
      {
        type: 'text',
        content: 'Image Title',
        x: 50,
        y: 50,
        width: 350,
        height: 50,
        style: {
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#000000'
        }
      },
      {
        type: 'text',
        content: 'Description text goes here explaining the image content...',
        x: 50,
        y: 120,
        width: 350,
        height: 100,
        style: {
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#333333'
        }
      },
      {
        type: 'image',
        content: '/placeholder-image.svg',
        x: 450,
        y: 80,
        width: 300,
        height: 200,
        style: {
          backgroundColor: '#f0f0f0',
          border: '2px dashed #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#999'
        }
      }
    ]
  }
]

export const getTemplatesByCategory = (category: string): SlideTemplate[] => {
  return slideTemplates.filter(template => template.category === category)
}

export const getAllCategories = (): string[] => {
  return Array.from(new Set(slideTemplates.map(template => template.category)))
}
