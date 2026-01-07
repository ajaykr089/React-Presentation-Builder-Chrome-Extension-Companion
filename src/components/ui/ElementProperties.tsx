'use client'

import { Card, Typography, Form, Input, Slider, Select, ColorPicker, Space, Divider, Button } from 'antd'
import { SlideElement } from '@/types/presentation'

const { Title, Text } = Typography
const { TextArea } = Input

interface ElementPropertiesProps {
  selectedElement?: SlideElement
  onElementUpdate?: (element: SlideElement) => void
  onElementDelete?: (elementId: string) => void
}

export function ElementProperties({ selectedElement, onElementUpdate, onElementDelete }: ElementPropertiesProps) {
  if (!selectedElement) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Text type="secondary">
          Select an element on the canvas to edit its properties
        </Text>
      </div>
    )
  }

  const handlePropertyChange = (property: string, value: any) => {
    if (onElementUpdate) {
      const updatedElement = {
        ...selectedElement,
        [property]: value
      }
      onElementUpdate(updatedElement)
    }
  }

  const handleStyleChange = (property: string, value: any) => {
    if (onElementUpdate) {
      const updatedElement = {
        ...selectedElement,
        style: {
          ...selectedElement.style,
          [property]: value
        }
      }
      onElementUpdate(updatedElement)
    }
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <Title level={4} style={{ margin: 0 }}>Element Properties</Title>
        <Button
          danger
          size="small"
          onClick={() => onElementDelete?.(selectedElement.id)}
        >
          Delete Element
        </Button>
      </div>
      <Text type="secondary">ID: {selectedElement.id}</Text>

      <Divider />

      {/* Content */}
      <Card size="small" title="Content" style={{ marginBottom: '16px' }}>
        {selectedElement.type === 'text' && (
          <Form layout="vertical">
            <Form.Item label="Text Content">
              <TextArea
                value={selectedElement.content}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                rows={3}
                placeholder="Enter text content"
              />
            </Form.Item>
          </Form>
        )}

        {selectedElement.type === 'image' && (
          <Form layout="vertical">
            <Form.Item label="Upload Local Image">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const dataUrl = event.target?.result as string
                      handlePropertyChange('content', dataUrl)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                style={{
                  width: '100%',
                  padding: '4px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px'
                }}
              />
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                Select an image file from your computer (JPG, PNG, GIF, etc.)
              </Text>
            </Form.Item>

            <Form.Item label="Or Enter External Image URL">
              <Input
                value={selectedElement.content?.startsWith('data:') ? '' : selectedElement.content}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              />
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                Paste a URL for an image hosted online, or use the file upload above
              </Text>
            </Form.Item>
          </Form>
        )}

        {selectedElement.type === 'shape' && (
          <div style={{ padding: '8px', textAlign: 'center', color: '#666' }}>
            Shape elements don't have content - use styling properties below
          </div>
        )}
      </Card>

      {/* Position & Size */}
      <Card size="small" title="Position & Size" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>X Position:</Text>
            <Slider
              value={selectedElement.x}
              onChange={(value) => handlePropertyChange('x', value)}
              min={0}
              max={800}
              step={1}
            />
          </div>

          <div>
            <Text strong>Y Position:</Text>
            <Slider
              value={selectedElement.y}
              onChange={(value) => handlePropertyChange('y', value)}
              min={0}
              max={600}
              step={1}
            />
          </div>

          <div>
            <Text strong>Width:</Text>
            <Slider
              value={selectedElement.width}
              onChange={(value) => handlePropertyChange('width', value)}
              min={50}
              max={800}
              step={1}
            />
          </div>

          <div>
            <Text strong>Height:</Text>
            <Slider
              value={selectedElement.height}
              onChange={(value) => handlePropertyChange('height', value)}
              min={20}
              max={600}
              step={1}
            />
          </div>
        </Space>
      </Card>

      {/* Text Styling */}
      {selectedElement.type === 'text' && (
        <Card size="small" title="Text Styling" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Font Size:</Text>
              <Slider
                value={parseInt(selectedElement.style?.fontSize?.toString() || '16')}
                onChange={(value) => handleStyleChange('fontSize', `${value}px`)}
                min={8}
                max={72}
                step={1}
              />
            </div>

            <div>
              <Text strong>Color:</Text>
              <ColorPicker
                value={selectedElement.style?.color || '#000000'}
                onChange={(color) => handleStyleChange('color', color.toHexString())}
                showText
              />
            </div>

            <Form.Item label="Font Weight">
              <Select
                value={selectedElement.style?.fontWeight || 'normal'}
                onChange={(value) => handleStyleChange('fontWeight', value)}
              >
                <Select.Option value="normal">Normal</Select.Option>
                <Select.Option value="bold">Bold</Select.Option>
                <Select.Option value="lighter">Light</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Text Align">
              <Select
                value={selectedElement.style?.textAlign || 'left'}
                onChange={(value) => handleStyleChange('textAlign', value)}
              >
                <Select.Option value="left">Left</Select.Option>
                <Select.Option value="center">Center</Select.Option>
                <Select.Option value="right">Right</Select.Option>
                <Select.Option value="justify">Justify</Select.Option>
              </Select>
            </Form.Item>
          </Space>
        </Card>
      )}

      {/* Image Styling */}
      {selectedElement.type === 'image' && (
        <Card size="small" title="Image Styling" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Border Radius:</Text>
              <Slider
                value={parseInt(selectedElement.style?.borderRadius?.toString() || '0')}
                onChange={(value) => handleStyleChange('borderRadius', `${value}px`)}
                min={0}
                max={50}
                step={1}
              />
            </div>
          </Space>
        </Card>
      )}

      {/* Shape Styling */}
      {selectedElement.type === 'shape' && (
        <Card size="small" title="Shape Styling" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Background Color:</Text>
              <ColorPicker
                value={selectedElement.style?.backgroundColor || '#1890ff'}
                onChange={(color) => handleStyleChange('backgroundColor', color.toHexString())}
                showText
              />
            </div>

            <div>
              <Text strong>Border Radius:</Text>
              <Slider
                value={parseInt(selectedElement.style?.borderRadius?.toString() || '0')}
                onChange={(value) => handleStyleChange('borderRadius', `${value}px`)}
                min={0}
                max={50}
                step={1}
              />
            </div>
          </Space>
        </Card>
      )}
    </div>
  )
}
