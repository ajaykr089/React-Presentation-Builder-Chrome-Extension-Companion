import { SlideElement } from '@/types/presentation'

export interface SmartArtTemplate {
  id: string
  name: string
  category: 'process' | 'cycle' | 'hierarchy' | 'relationship' | 'matrix'
  thumbnail: string
  description: string
  layout: SmartArtLayout
  defaultItems: number
}

export interface SmartArtLayout {
  type: 'linear' | 'radial' | 'hierarchical' | 'matrix'
  direction?: 'horizontal' | 'vertical'
  spacing: number
  itemWidth: number
  itemHeight: number
}

export const smartArtTemplates: SmartArtTemplate[] = [
  {
    id: 'process-flow',
    name: 'Process Flow',
    category: 'process',
    thumbnail: '/smartart/process-flow.png',
    description: 'Show a sequence of steps or process flow',
    layout: {
      type: 'linear',
      direction: 'horizontal',
      spacing: 50,
      itemWidth: 120,
      itemHeight: 80
    },
    defaultItems: 4
  },
  {
    id: 'cycle-diagram',
    name: 'Cycle Diagram',
    category: 'cycle',
    thumbnail: '/smartart/cycle-diagram.png',
    description: 'Illustrate a continuous process or cycle',
    layout: {
      type: 'radial',
      spacing: 20,
      itemWidth: 100,
      itemHeight: 100
    },
    defaultItems: 4
  },
  {
    id: 'hierarchy-chart',
    name: 'Hierarchy Chart',
    category: 'hierarchy',
    thumbnail: '/smartart/hierarchy-chart.png',
    description: 'Display organizational structure or hierarchy',
    layout: {
      type: 'hierarchical',
      direction: 'vertical',
      spacing: 60,
      itemWidth: 140,
      itemHeight: 70
    },
    defaultItems: 5
  },
  {
    id: 'venn-diagram',
    name: 'Venn Diagram',
    category: 'relationship',
    thumbnail: '/smartart/venn-diagram.png',
    description: 'Show relationships and overlapping concepts',
    layout: {
      type: 'radial',
      spacing: 30,
      itemWidth: 120,
      itemHeight: 120
    },
    defaultItems: 3
  },
  {
    id: 'matrix-grid',
    name: 'Matrix Grid',
    category: 'matrix',
    thumbnail: '/smartart/matrix-grid.png',
    description: 'Compare options across multiple criteria',
    layout: {
      type: 'matrix',
      spacing: 20,
      itemWidth: 100,
      itemHeight: 60
    },
    defaultItems: 6
  }
]

export const getSmartArtByCategory = (category: string): SmartArtTemplate[] => {
  return smartArtTemplates.filter(template => template.category === category)
}

export const getAllSmartArtCategories = (): string[] => {
  return Array.from(new Set(smartArtTemplates.map(template => template.category)))
}

export const generateSmartArtElements = (
  template: SmartArtTemplate,
  x: number,
  y: number,
  items: string[]
): SlideElement[] => {
  const elements: SlideElement[] = []
  const { layout } = template

  items.forEach((item, index) => {
    let elementX = x
    let elementY = y

    // Calculate position based on layout type
    switch (layout.type) {
      case 'linear':
        if (layout.direction === 'horizontal') {
          elementX = x + index * (layout.itemWidth + layout.spacing)
        } else {
          elementY = y + index * (layout.itemHeight + layout.spacing)
        }
        break

      case 'radial':
        // Circular layout for cycles and relationships
        const angle = (index / items.length) * 2 * Math.PI
        const radius = 100
        elementX = x + Math.cos(angle) * radius - layout.itemWidth / 2
        elementY = y + Math.sin(angle) * radius - layout.itemHeight / 2
        break

      case 'hierarchical':
        // Simple hierarchy layout
        if (index === 0) {
          // Root node
          elementX = x + (layout.itemWidth + layout.spacing) * 1.5
        } else if (index <= 2) {
          // Second level
          elementX = x + (index - 1) * (layout.itemWidth + layout.spacing)
          elementY = y + layout.itemHeight + layout.spacing
        } else {
          // Third level
          elementX = x + (index - 3) * (layout.itemWidth + layout.spacing)
          elementY = y + (layout.itemHeight + layout.spacing) * 2
        }
        break

      case 'matrix':
        // Grid layout
        const cols = Math.ceil(Math.sqrt(items.length))
        const col = index % cols
        const row = Math.floor(index / cols)
        elementX = x + col * (layout.itemWidth + layout.spacing)
        elementY = y + row * (layout.itemHeight + layout.spacing)
        break
    }

    // Create the text element
    elements.push({
      id: `smartart-${template.id}-${index}`,
      type: 'text',
      content: item,
      x: elementX,
      y: elementY,
      width: layout.itemWidth,
      height: layout.itemHeight,
      style: {
        fontSize: '14px',
        textAlign: 'center',
        color: '#000000',
        backgroundColor: '#f0f0f0',
        border: '2px solid #1890ff',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px'
      }
    })

    // Add connecting lines for process flows
    if (layout.type === 'linear' && layout.direction === 'horizontal' && index < items.length - 1) {
      elements.push({
        id: `connector-${template.id}-${index}`,
        type: 'shape',
        content: '',
        x: elementX + layout.itemWidth,
        y: elementY + layout.itemHeight / 2 - 2,
        width: layout.spacing,
        height: 4,
        style: {
          backgroundColor: '#1890ff',
          borderRadius: '2px'
        }
      })
    }
  })

  return elements
}
