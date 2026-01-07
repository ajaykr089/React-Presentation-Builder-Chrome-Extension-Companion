'use client'

import { Card, Tabs, Typography, Button, Tooltip, Modal, Input, Space, List } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { smartArtTemplates, getAllSmartArtCategories, generateSmartArtElements, SmartArtTemplate } from '@/lib/smartart'
import { SlideElement } from '@/types/presentation'

const { Title, Text } = Typography

const { TextArea } = Input

interface SmartArtGalleryProps {
  onSmartArtInsert: (elements: SlideElement[]) => void
}

export function SmartArtGallery({ onSmartArtInsert }: SmartArtGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<SmartArtTemplate | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [smartArtItems, setSmartArtItems] = useState<string[]>([])

  const categories = getAllSmartArtCategories()

  const handleTemplateSelect = (template: SmartArtTemplate) => {
    setSelectedTemplate(template)
    // Pre-populate with default items
    const defaultItems = Array.from(
      { length: template.defaultItems },
      (_, i) => `Item ${i + 1}`
    )
    setSmartArtItems(defaultItems)
    setIsModalVisible(true)
  }

  const handleModalOk = () => {
    if (selectedTemplate && smartArtItems.length > 0) {
      const elements = generateSmartArtElements(
        selectedTemplate,
        200, // Default x position
        150, // Default y position
        smartArtItems
      )
      onSmartArtInsert(elements)
      setIsModalVisible(false)
      setSelectedTemplate(null)
      setSmartArtItems([])
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setSelectedTemplate(null)
    setSmartArtItems([])
  }

  const updateItem = (index: number, value: string) => {
    const newItems = [...smartArtItems]
    newItems[index] = value
    setSmartArtItems(newItems)
  }

  const addItem = () => {
    setSmartArtItems([...smartArtItems, `Item ${smartArtItems.length + 1}`])
  }

  const removeItem = (index: number) => {
    if (smartArtItems.length > 1) {
      setSmartArtItems(smartArtItems.filter((_, i) => i !== index))
    }
  }

  const renderTemplateCard = (template: SmartArtTemplate) => (
    <Card
      key={template.id}
      hoverable
      style={{ width: 200, margin: '8px' }}
      cover={
        <div
          style={{
            height: 120,
            background: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e8e8e8'
          }}
        >
          <Text type="secondary">{template.name}</Text>
        </div>
      }
      actions={[
        <Tooltip title={`Insert ${template.name}`} key="insert">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={() => handleTemplateSelect(template)}
          >
            Insert
          </Button>
        </Tooltip>
      ].filter(Boolean)}
    >
      <Card.Meta
        title={<Text strong style={{ fontSize: '14px' }}>{template.name}</Text>}
        description={
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
            </Text>
            <br />
            <Text style={{ fontSize: '12px' }}>{template.description}</Text>
          </div>
        }
      />
    </Card>
  )

  return (
    <>
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Title level={4}>SmartArt Graphics</Title>
          <Text type="secondary">
            Add professional diagrams and charts to your slides
          </Text>
        </div>

        <Tabs
          defaultActiveKey={categories[0]}
          type="card"
          items={categories.map(category => ({
            key: category,
            label: category.charAt(0).toUpperCase() + category.slice(1),
            children: (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-start'
              }}>
                {smartArtTemplates
                  .filter(template => template.category === category)
                  .map(renderTemplateCard)}
              </div>
            )
          }))}
        />
      </div>

      <Modal
        title={`Customize ${selectedTemplate?.name}`}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={500}
        okText="Insert SmartArt"
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Enter the content for each item in your SmartArt graphic:</Text>
        </div>

        <List
          dataSource={smartArtItems}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                smartArtItems.length > 1 && (
                  <Button
                    danger
                    size="small"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </Button>
                )
              ].filter(Boolean)}
            >
              <TextArea
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={`Enter item ${index + 1} content`}
                autoSize={{ minRows: 1, maxRows: 3 }}
              />
            </List.Item>
          )}
        />

        <Button
          type="dashed"
          onClick={addItem}
          block
          style={{ marginTop: 16 }}
        >
          Add Item
        </Button>
      </Modal>
    </>
  )
}
