'use client'

import { Card, Typography, Form, Input, Slider, Select, ColorPicker, Space, Divider, Button, Table as AntTable, InputNumber, Switch, Upload } from 'antd'
import { UploadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { SlideElement } from '@/types/presentation'

const { Title, Text } = Typography
const { TextArea } = Input

interface ElementPropertiesProps {
  selectedElement?: SlideElement
  onElementUpdate?: (element: SlideElement) => void
  onElementDelete?: (elementId: string) => void
}

const chartColors = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#13c2c2', '#fadb14', '#eb2f96', '#52c41a', '#fa8c16'
]

const iconOptions = [
  { value: 'star', label: 'Star' },
  { value: 'heart', label: 'Heart' },
  { value: 'check', label: 'Check' },
  { value: 'arrow-right', label: 'Arrow Right' },
  { value: 'home', label: 'Home' },
  { value: 'user', label: 'User' },
  { value: 'settings', label: 'Settings' },
  { value: 'search', label: 'Search' },
  { value: 'bell', label: 'Bell' },
  { value: 'camera', label: 'Camera' },
  { value: 'phone', label: 'Phone' },
  { value: 'mail', label: 'Mail' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'clock', label: 'Clock' },
  { value: 'location', label: 'Location' },
  { value: 'download', label: 'Download' },
  { value: 'upload', label: 'Upload' },
  { value: 'trash', label: 'Trash' },
  { value: 'edit', label: 'Edit' },
  { value: 'share', label: 'Share' },
  { value: 'bookmark', label: 'Bookmark' },
  { value: 'filter', label: 'Filter' },
  { value: 'menu', label: 'Menu' },
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'plus', label: 'Plus' },
  { value: 'minus', label: 'Minus' },
  { value: 'close', label: 'Close' },
  { value: 'expand', label: 'Expand' },
  { value: 'compress', label: 'Compress' }
]

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
    <div style={{ padding: '16px', maxHeight: '600px', overflow: 'auto' }}>
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
      <Text type="secondary">Type: {selectedElement.type} | ID: {selectedElement.id}</Text>

      <Divider />

      {/* Common Properties - Position & Size */}
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
              min={20}
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
        <Card size="small" title="Shape Properties" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item label="Shape Type">
              <Select
                value={(selectedElement as any).shapeType || 'rectangle'}
                onChange={(value) => handlePropertyChange('shapeType', value)}
              >
                <Select.Option value="rectangle">Rectangle</Select.Option>
                <Select.Option value="circle">Circle</Select.Option>
                <Select.Option value="triangle">Triangle</Select.Option>
                <Select.Option value="diamond">Diamond</Select.Option>
                <Select.Option value="hexagon">Hexagon</Select.Option>
                <Select.Option value="star">Star</Select.Option>
              </Select>
            </Form.Item>

            <div>
              <Text strong>Fill Color:</Text>
              <ColorPicker
                value={selectedElement.style?.backgroundColor || '#1890ff'}
                onChange={(color) => handleStyleChange('backgroundColor', color.toHexString())}
                showText
              />
            </div>

            <div>
              <Text strong>Border Color:</Text>
              <ColorPicker
                value={selectedElement.style?.borderColor || '#000000'}
                onChange={(color) => handleStyleChange('borderColor', color.toHexString())}
                showText
              />
            </div>

            <div>
              <Text strong>Border Width:</Text>
              <Slider
                value={parseInt(selectedElement.style?.borderWidth?.toString() || '0')}
                onChange={(value) => handleStyleChange('borderWidth', `${value}px`)}
                min={0}
                max={10}
                step={1}
              />
            </div>
          </Space>
        </Card>
      )}

      {/* Arrow Styling */}
      {selectedElement.type === 'arrow' && (
        <Card size="small" title="Arrow Properties" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item label="Arrow Type">
              <Select
                value={(selectedElement as any).arrowType || 'straight'}
                onChange={(value) => handlePropertyChange('arrowType', value)}
              >
                <Select.Option value="straight">Straight Arrow</Select.Option>
                <Select.Option value="curved">Curved Arrow</Select.Option>
                <Select.Option value="double">Double Arrow</Select.Option>
                <Select.Option value="dashed">Dashed Arrow</Select.Option>
                <Select.Option value="thick">Thick Arrow</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Direction">
              <Select
                value={(selectedElement as any).direction || 'right'}
                onChange={(value) => handlePropertyChange('direction', value)}
              >
                <Select.Option value="right">→ Right</Select.Option>
                <Select.Option value="left">← Left</Select.Option>
                <Select.Option value="up">↑ Up</Select.Option>
                <Select.Option value="down">↓ Down</Select.Option>
              </Select>
            </Form.Item>

            <div>
              <Text strong>Arrow Color:</Text>
              <ColorPicker
                value={selectedElement.style?.backgroundColor || '#000000'}
                onChange={(color) => handleStyleChange('backgroundColor', color.toHexString())}
                showText
              />
            </div>

            <div>
              <Text strong>Thickness:</Text>
              <Slider
                value={(selectedElement as any).arrowThickness || 4}
                onChange={(value) => handlePropertyChange('arrowThickness', value)}
                min={1}
                max={20}
                step={1}
              />
            </div>
          </Space>
        </Card>
      )}

      {/* Chart Properties */}
      {selectedElement.type === 'chart' && (
        <Card size="small" title="Chart Data" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item label="Chart Type">
              <Select
                value={(selectedElement as any).chartType || 'bar'}
                onChange={(value) => handlePropertyChange('chartType', value)}
              >
                <Select.Option value="bar">Bar Chart</Select.Option>
                <Select.Option value="line">Line Chart</Select.Option>
                <Select.Option value="pie">Pie Chart</Select.Option>
                <Select.Option value="doughnut">Doughnut Chart</Select.Option>
              </Select>
            </Form.Item>

            <div>
              <Text strong>Chart Data:</Text>
              <div style={{ marginTop: '8px', maxHeight: '300px', overflow: 'auto' }}>
                <AntTable
                  dataSource={(selectedElement.data as any)?.labels?.map((label: string, index: number) => ({
                    key: index,
                    label,
                    value: (selectedElement.data as any)?.datasets?.[0]?.data?.[index] || 0
                  })) || []}
                  columns={[
                    {
                      title: 'Label',
                      dataIndex: 'label',
                      render: (text: string, record: any) => (
                        <Input
                          value={text}
                          onChange={(e) => {
                            const newLabels = [...((selectedElement.data as any)?.labels || [])]
                            newLabels[record.key] = e.target.value
                            const newData = { ...selectedElement.data, labels: newLabels }
                            handlePropertyChange('data', newData)
                          }}
                        />
                      )
                    },
                    {
                      title: 'Value',
                      dataIndex: 'value',
                      render: (text: number, record: any) => (
                        <InputNumber
                          value={text}
                          onChange={(value) => {
                            const newData = [...((selectedElement.data as any)?.datasets?.[0]?.data || [])]
                            newData[record.key] = value || 0
                            const newDatasets = [{ ...((selectedElement.data as any)?.datasets?.[0] || {}), data: newData }]
                            handlePropertyChange('data', { ...selectedElement.data, datasets: newDatasets })
                          }}
                        />
                      )
                    }
                  ]}
                  pagination={false}
                  size="small"
                />
              </div>
            </div>
          </Space>
        </Card>
      )}

      {/* Table Properties */}
      {selectedElement.type === 'table' && (
        <Card size="small" title="Table Data" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Table Data:</Text>
              <div style={{ marginTop: '8px', maxHeight: '300px', overflow: 'auto' }}>
                <AntTable
                  dataSource={(selectedElement.data as any)?.rows?.map((row: string[], rowIndex: number) => ({
                    key: rowIndex,
                    ...row.reduce((acc, cell, colIndex) => ({ ...acc, [`col${colIndex}`]: cell }), {})
                  })) || []}
                  columns={(selectedElement.data as any)?.headers?.map((header: string, colIndex: number) => ({
                    title: header,
                    dataIndex: `col${colIndex}`,
                    render: (text: string, record: any) => (
                      <Input
                        value={text}
                        onChange={(e) => {
                          const newRows = [...((selectedElement.data as any)?.rows || [])]
                          newRows[record.key][colIndex] = e.target.value
                          handlePropertyChange('data', { ...selectedElement.data, rows: newRows })
                        }}
                      />
                    )
                  })) || []}
                  pagination={false}
                  size="small"
                />
              </div>
            </div>
          </Space>
        </Card>
      )}

      {/* Code Properties */}
      {selectedElement.type === 'code' && (
        <Card size="small" title="Code Properties" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item label="Language">
              <Select
                value={(selectedElement as any).language || 'javascript'}
                onChange={(value) => handlePropertyChange('language', value)}
              >
                <Select.Option value="javascript">JavaScript</Select.Option>
                <Select.Option value="typescript">TypeScript</Select.Option>
                <Select.Option value="python">Python</Select.Option>
                <Select.Option value="java">Java</Select.Option>
                <Select.Option value="cpp">C++</Select.Option>
                <Select.Option value="csharp">C#</Select.Option>
                <Select.Option value="php">PHP</Select.Option>
                <Select.Option value="ruby">Ruby</Select.Option>
                <Select.Option value="go">Go</Select.Option>
                <Select.Option value="rust">Rust</Select.Option>
                <Select.Option value="html">HTML</Select.Option>
                <Select.Option value="css">CSS</Select.Option>
                <Select.Option value="sql">SQL</Select.Option>
                <Select.Option value="bash">Bash</Select.Option>
                <Select.Option value="json">JSON</Select.Option>
                <Select.Option value="xml">XML</Select.Option>
                <Select.Option value="yaml">YAML</Select.Option>
                <Select.Option value="markdown">Markdown</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Theme">
              <Select
                value={(selectedElement as any).codeTheme || 'dark'}
                onChange={(value) => handlePropertyChange('codeTheme', value)}
              >
                <Select.Option value="light">Light</Select.Option>
                <Select.Option value="dark">Dark</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Code Content">
              <TextArea
                value={selectedElement.content}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                rows={10}
                placeholder="Enter your code here..."
              />
            </Form.Item>
          </Space>
        </Card>
      )}

      {/* Quote Properties */}
      {selectedElement.type === 'quote' && (
        <Card size="small" title="Quote Content" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item label="Quote Text">
              <TextArea
                value={selectedElement.content}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                rows={3}
                placeholder="Enter your quote here..."
              />
            </Form.Item>

            <div>
              <Text strong>Font Size:</Text>
              <Slider
                value={parseInt(selectedElement.style?.fontSize?.toString() || '18')}
                onChange={(value) => handleStyleChange('fontSize', `${value}px`)}
                min={12}
                max={48}
                step={1}
              />
            </div>

            <div>
              <Text strong>Text Color:</Text>
              <ColorPicker
                value={selectedElement.style?.color || '#666666'}
                onChange={(color) => handleStyleChange('color', color.toHexString())}
                showText
              />
            </div>
          </Space>
        </Card>
      )}

      {/* Icon Properties */}
      {selectedElement.type === 'icon' && (
        <Card size="small" title="Icon Properties" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item label="Icon">
              <Select
                value={(selectedElement as any).iconType || 'star'}
                onChange={(value) => handlePropertyChange('iconType', value)}
                showSearch
                filterOption={(input, option) =>
                  option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false
                }
              >
                {iconOptions.map(icon => (
                  <Select.Option key={icon.value} value={icon.value}>
                    {icon.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div>
              <Text strong>Icon Color:</Text>
              <ColorPicker
                value={(selectedElement as any).iconColor || '#1890ff'}
                onChange={(color) => handlePropertyChange('iconColor', color.toHexString())}
                showText
              />
            </div>

            <div>
              <Text strong>Icon Size:</Text>
              <Slider
                value={(selectedElement as any).iconSize || 48}
                onChange={(value) => handlePropertyChange('iconSize', value)}
                min={16}
                max={128}
                step={4}
              />
            </div>
          </Space>
        </Card>
      )}

      {/* Link Properties */}
      {selectedElement.type === 'link' && (
        <Card size="small" title="Link Properties" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item label="Link Text">
              <Input
                value={selectedElement.content}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                placeholder="Enter link text"
              />
            </Form.Item>

            <Form.Item label="URL">
              <Input
                value={(selectedElement as any).href}
                onChange={(e) => handlePropertyChange('href', e.target.value)}
                placeholder="https://example.com"
              />
            </Form.Item>

            <Form.Item label="Open in New Tab">
              <Switch
                checked={(selectedElement as any).openInNewTab || false}
                onChange={(checked) => handlePropertyChange('openInNewTab', checked)}
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>

            <div>
              <Text strong>Link Color:</Text>
              <ColorPicker
                value={selectedElement.style?.color || '#1890ff'}
                onChange={(color) => handleStyleChange('color', color.toHexString())}
                showText
              />
            </div>
          </Space>
        </Card>
      )}

      {/* Video Properties */}
      {selectedElement.type === 'video' && (
        <Card size="small" title="Video Properties" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item label="Upload Local Video">
              <input
                type="file"
                accept="video/*"
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
                Select a video file from your computer (MP4, WebM, OGV, etc.)
              </Text>
            </Form.Item>

            <Form.Item label="Or Enter Video URL">
              <Input
                value={selectedElement.content?.startsWith('data:') ? '' : selectedElement.content}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                Paste a URL for a video hosted online, or use the file upload above
              </Text>
            </Form.Item>

            <Form.Item label="Autoplay">
              <Switch
                checked={(selectedElement as any).autoplay || false}
                onChange={(checked) => handlePropertyChange('autoplay', checked)}
                checkedChildren="On"
                unCheckedChildren="Off"
              />
            </Form.Item>

            <Form.Item label="Show Controls">
              <Switch
                checked={(selectedElement as any).controls !== false}
                onChange={(checked) => handlePropertyChange('controls', checked)}
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>

            <Form.Item label="Loop Video">
              <Switch
                checked={(selectedElement as any).loop || false}
                onChange={(checked) => handlePropertyChange('loop', checked)}
                checkedChildren="On"
                unCheckedChildren="Off"
              />
            </Form.Item>

            <Form.Item label="Start Muted">
              <Switch
                checked={(selectedElement as any).muted || false}
                onChange={(checked) => handlePropertyChange('muted', checked)}
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>

            {!(selectedElement as any).muted && (
              <Form.Item label={`Volume: ${Math.round(((selectedElement as any).volume || 1) * 100)}%`}>
                <Slider
                  value={(selectedElement as any).volume || 1}
                  onChange={(value) => handlePropertyChange('volume', value)}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </Form.Item>
            )}
          </Space>
        </Card>
      )}

      {/* Diagram Properties */}
      {selectedElement.type === 'diagram' && (
        <Card size="small" title="Diagram Properties" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Diagram Info:</Text>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                <div>Nodes: {(selectedElement.data as any)?.nodes?.length || 0}</div>
                <div>Connections: {(selectedElement.data as any)?.connections?.length || 0}</div>
              </div>
            </div>
          </Space>
        </Card>
      )}

      {/* Draw Properties */}
      {selectedElement.type === 'draw' && (
        <Card size="small" title="Drawing Properties" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Drawing Info:</Text>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                <div>Strokes: {(selectedElement.data as any)?.strokes?.length || 0}</div>
              </div>
            </div>
          </Space>
        </Card>
      )}

      {/* Animation Properties */}
      <Card size="small" title="Animation" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item label="Animation Type">
            <Select
              value={(selectedElement as any).animation?.type || 'none'}
              onChange={(value) => {
                if (value === 'none') {
                  handlePropertyChange('animation', undefined)
                } else {
                  handlePropertyChange('animation', {
                    type: value,
                    duration: (selectedElement as any).animation?.duration || 500,
                    delay: (selectedElement as any).animation?.delay || 0,
                    easing: (selectedElement as any).animation?.easing || 'easeOut',
                    direction: (selectedElement as any).animation?.direction || 'left'
                  })
                }
              }}
            >
              <Select.Option value="none">No Animation</Select.Option>
              <Select.Option value="fadeIn">Fade In</Select.Option>
              <Select.Option value="slideIn">Slide In</Select.Option>
              <Select.Option value="bounce">Bounce</Select.Option>
              <Select.Option value="scale">Scale</Select.Option>
              <Select.Option value="rotate">Rotate</Select.Option>
            </Select>
          </Form.Item>

          {(selectedElement as any).animation?.type && (
            <>
              <div>
                <Text strong>Duration:</Text>
                <Slider
                  value={(selectedElement as any).animation?.duration || 500}
                  onChange={(value) => handlePropertyChange('animation', {
                    ...(selectedElement as any).animation,
                    duration: value
                  })}
                  min={100}
                  max={2000}
                  step={50}
                />
                <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                  {(selectedElement as any).animation?.duration || 500}ms
                </div>
              </div>

              <div>
                <Text strong>Delay:</Text>
                <Slider
                  value={(selectedElement as any).animation?.delay || 0}
                  onChange={(value) => handlePropertyChange('animation', {
                    ...(selectedElement as any).animation,
                    delay: value
                  })}
                  min={0}
                  max={2000}
                  step={50}
                />
                <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                  {(selectedElement as any).animation?.delay || 0}ms
                </div>
              </div>

              <Form.Item label="Easing">
                <Select
                  value={(selectedElement as any).animation?.easing || 'easeOut'}
                  onChange={(value) => handlePropertyChange('animation', {
                    ...(selectedElement as any).animation,
                    easing: value
                  })}
                >
                  <Select.Option value="linear">Linear</Select.Option>
                  <Select.Option value="easeIn">Ease In</Select.Option>
                  <Select.Option value="easeOut">Ease Out</Select.Option>
                  <Select.Option value="easeInOut">Ease In Out</Select.Option>
                </Select>
              </Form.Item>

              {(selectedElement as any).animation?.type === 'slideIn' && (
                <Form.Item label="Direction">
                  <Select
                    value={(selectedElement as any).animation?.direction || 'left'}
                    onChange={(value) => handlePropertyChange('animation', {
                      ...(selectedElement as any).animation,
                      direction: value
                    })}
                  >
                    <Select.Option value="left">From Left</Select.Option>
                    <Select.Option value="right">From Right</Select.Option>
                    <Select.Option value="top">From Top</Select.Option>
                    <Select.Option value="bottom">From Bottom</Select.Option>
                  </Select>
                </Form.Item>
              )}
            </>
          )}
        </Space>
      </Card>

      {/* Audio Properties */}
      {selectedElement.type === 'audio' && (
        <Card size="small" title="Audio Source" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item label="Upload Local Audio">
              <input
                type="file"
                accept="audio/*"
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
                Select an audio file from your computer (MP3, WAV, OGG, etc.)
              </Text>
            </Form.Item>

            <Form.Item label="Or Enter Audio URL">
              <Input
                value={selectedElement.content?.startsWith('data:') ? '' : selectedElement.content}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                placeholder="https://example.com/audio.mp3"
              />
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                Paste a URL for an audio file hosted online, or use the file upload above
              </Text>
            </Form.Item>

            {selectedElement.content && !selectedElement.content.startsWith('data:') && (
              <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
                <h4>Current Audio:</h4>
                <audio
                  src={selectedElement.content}
                  controls
                  style={{
                    width: '100%',
                    height: '40px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px'
                  }}
                />
              </div>
            )}
          </Space>
        </Card>
      )}

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
    </div>
  )
}
