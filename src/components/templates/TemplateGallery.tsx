'use client'

import { Card, Tabs, Typography, Space, Button, Tooltip } from 'antd'
import { PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { slideTemplates, getAllCategories } from '@/lib/templates'
import { SlideTemplate } from '@/types/presentation'

const { Title, Text } = Typography
const { Meta } = Card

interface TemplateGalleryProps {
  onTemplateSelect: (template: SlideTemplate) => void
  onPreviewTemplate?: (template: SlideTemplate) => void
}

export function TemplateGallery({ onTemplateSelect, onPreviewTemplate }: TemplateGalleryProps) {
  const categories = getAllCategories()

  const renderTemplateCard = (template: SlideTemplate) => (
    <Card
      key={template.id}
      hoverable
      style={{ width: 240, margin: '8px' }}
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
        <Tooltip title="Use this template" key="use">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={() => onTemplateSelect(template)}
          >
            Use
          </Button>
        </Tooltip>,
        onPreviewTemplate && (
          <Tooltip title="Preview template" key="preview">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onPreviewTemplate(template)}
            >
              Preview
            </Button>
          </Tooltip>
        )
      ].filter(Boolean)}
    >
      <Meta
        title={<Text strong style={{ fontSize: '14px' }}>{template.name}</Text>}
        description={
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {template.category}
            </Text>
            {template.description && (
              <div style={{ marginTop: 4 }}>
                <Text style={{ fontSize: '12px' }}>{template.description}</Text>
              </div>
            )}
          </div>
        }
      />
    </Card>
  )

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Title level={4}>Slide Templates</Title>
        <Text type="secondary">
          Choose from pre-designed layouts to quickly create professional slides
        </Text>
      </div>

      <Tabs
        defaultActiveKey={categories[0]}
        type="card"
        items={categories.map(category => ({
          key: category,
          label: category,
          children: (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-start'
            }}>
              {slideTemplates
                .filter(template => template.category === category)
                .map(renderTemplateCard)}
            </div>
          )
        }))}
      />
    </div>
  )
}
