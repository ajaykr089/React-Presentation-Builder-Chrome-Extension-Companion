'use client'

import { Card, Typography, Button, Tooltip, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { ElementType, SlideElement } from '@/types/presentation'
import { v4 as uuidv4 } from 'uuid'

const { Title, Text } = Typography

interface ElementToolbarProps {
  onElementAdd: (element: Omit<SlideElement, 'id'>) => void
}

const elementTypes: Array<{
  type: ElementType
  name: string
  icon: string
  description: string
  defaultProps: Partial<SlideElement>
}> = [
  {
    type: 'text',
    name: 'Text',
    icon: '📝',
    description: 'Add text content',
    defaultProps: {
      content: 'Your text here',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      style: {
        fontSize: '16px',
        color: '#000000',
        textAlign: 'left'
      }
    }
  },
  {
    type: 'image',
    name: 'Image',
    icon: '🖼️',
    description: 'Add images',
    defaultProps: {
      content: '/placeholder-image.svg',
      x: 150,
      y: 150,
      width: 200,
      height: 150,
      style: {}
    }
  },
  {
    type: 'shape',
    name: 'Shape',
    icon: '⬜',
    description: 'Add shapes and rectangles',
    defaultProps: {
      content: '',
      x: 200,
      y: 200,
      width: 150,
      height: 100,
      style: {
        backgroundColor: '#1890ff',
        borderRadius: '4px'
      }
    }
  },
  {
    type: 'arrow',
    name: 'Arrow',
    icon: '➡️',
    description: 'Add arrows and connectors',
    defaultProps: {
      content: '',
      x: 250,
      y: 250,
      width: 100,
      height: 4,
      style: {
        backgroundColor: '#000000'
      }
    }
  },
  {
    type: 'chart',
    name: 'Chart',
    icon: '📊',
    description: 'Add charts and graphs',
    defaultProps: {
      content: 'Chart Placeholder',
      x: 300,
      y: 100,
      width: 250,
      height: 200,
      style: {
        backgroundColor: '#f5f5f5',
        border: '2px dashed #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        color: '#999'
      }
    }
  },
  {
    type: 'table',
    name: 'Table',
    icon: '📋',
    description: 'Add tables',
    defaultProps: {
      content: 'Table Placeholder',
      x: 350,
      y: 150,
      width: 300,
      height: 150,
      style: {
        backgroundColor: '#f5f5f5',
        border: '2px dashed #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        color: '#999'
      }
    }
  },
  {
    type: 'code',
    name: 'Code',
    icon: '💻',
    description: 'Add code snippets',
    defaultProps: {
      content: 'console.log("Hello World");',
      x: 400,
      y: 200,
      width: 250,
      height: 100,
      style: {
        backgroundColor: '#f6f8fa',
        border: '1px solid #e1e4e8',
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: '8px',
        color: '#24292e'
      }
    }
  },
  {
    type: 'quote',
    name: 'Quote',
    icon: '💬',
    description: 'Add quotes and testimonials',
    defaultProps: {
      content: '"This is a quote"',
      x: 450,
      y: 250,
      width: 200,
      height: 80,
      style: {
        fontSize: '18px',
        fontStyle: 'italic',
        color: '#666666',
        textAlign: 'center'
      }
    }
  },
  {
    type: 'divider',
    name: 'Divider',
    icon: '➖',
    description: 'Add dividers and separators',
    defaultProps: {
      content: '',
      x: 100,
      y: 300,
      width: 400,
      height: 2,
      style: {
        backgroundColor: '#cccccc'
      }
    }
  },
  {
    type: 'icon',
    name: 'Icon',
    icon: '⭐',
    description: 'Add icons and symbols',
    defaultProps: {
      content: '⭐',
      x: 500,
      y: 100,
      width: 50,
      height: 50,
      style: {
        fontSize: '24px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }
  },
  {
    type: 'link',
    name: 'Link',
    icon: '🔗',
    description: 'Add hyperlinks',
    defaultProps: {
      content: 'Click here',
      x: 550,
      y: 150,
      width: 100,
      height: 30,
      style: {
        color: '#1890ff',
        textDecoration: 'underline',
        cursor: 'pointer'
      }
    }
  },
  {
    type: 'video',
    name: 'Video',
    icon: '🎥',
    description: 'Add video players',
    defaultProps: {
      content: 'Video Placeholder',
      x: 600,
      y: 200,
      width: 250,
      height: 150,
      style: {
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px'
      }
    }
  },
  {
    type: 'audio',
    name: 'Audio',
    icon: '🎵',
    description: 'Add audio players',
    defaultProps: {
      content: 'Audio Placeholder',
      x: 650,
      y: 250,
      width: 200,
      height: 50,
      style: {
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#666'
      }
    }
  },
  {
    type: 'diagram',
    name: 'Diagram',
    icon: '🔄',
    description: 'Add diagrams and flowcharts',
    defaultProps: {
      content: 'Diagram Placeholder',
      x: 700,
      y: 100,
      width: 200,
      height: 200,
      style: {
        backgroundColor: '#f5f5f5',
        border: '2px dashed #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        color: '#999'
      }
    }
  },
  {
    type: 'form',
    name: 'Form',
    icon: '📝',
    description: 'Add interactive forms',
    defaultProps: {
      content: 'Form Placeholder',
      x: 750,
      y: 150,
      width: 250,
      height: 150,
      style: {
        backgroundColor: '#f9f9f9',
        border: '1px solid #e1e4e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        color: '#666'
      }
    }
  },
  {
    type: 'draw',
    name: 'Draw',
    icon: '✏️',
    description: 'Add drawing areas',
    defaultProps: {
      content: 'Drawing Area',
      x: 800,
      y: 200,
      width: 200,
      height: 150,
      style: {
        backgroundColor: '#ffffff',
        border: '2px solid #cccccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        color: '#999'
      }
    }
  }
]

export function ElementToolbar({ onElementAdd }: ElementToolbarProps) {
  const handleElementClick = (elementType: typeof elementTypes[0]) => {
    const newElement: Omit<SlideElement, 'id'> = {
      type: elementType.type,
      content: elementType.defaultProps.content || '',
      x: elementType.defaultProps.x || 100,
      y: elementType.defaultProps.y || 100,
      width: elementType.defaultProps.width || 150,
      height: elementType.defaultProps.height || 100,
      style: elementType.defaultProps.style || {}
    }
    onElementAdd(newElement)
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Title level={4}>Add Elements</Title>
        <Text type="secondary">
          Click any element below to add it to your slide
        </Text>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px'
      }}>
        {elementTypes.map((elementType) => (
          <Card
            key={elementType.type}
            hoverable
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              padding: '8px'
            }}
            onClick={() => handleElementClick(elementType)}
          >
            <div style={{
              fontSize: '24px',
              marginBottom: '8px',
              lineHeight: '1'
            }}>
              {elementType.icon}
            </div>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '4px'
            }}>
              {elementType.name}
            </div>
            <div style={{
              fontSize: '10px',
              color: '#666',
              lineHeight: '1.2'
            }}>
              {elementType.description}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
