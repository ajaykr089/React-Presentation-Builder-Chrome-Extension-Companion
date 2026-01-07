'use client'

import { Tabs, Drawer, Button } from 'antd'
import { SettingOutlined, CloseOutlined } from '@ant-design/icons'
import { TemplateGallery } from '@/components/templates/TemplateGallery'
import { ThemeSelector } from '@/components/themes/ThemeSelector'
import { SmartArtGallery } from '@/components/smartart/SmartArtGallery'
import { ElementProperties } from '@/components/ui/ElementProperties'
import { ElementToolbar } from '@/components/ui/ElementToolbar'
import { SlideTemplate, Theme, SlideElement } from '@/types/presentation'

interface PropertiesPanelProps {
  visible: boolean
  onClose: () => void
  onTemplateSelect: (template: SlideTemplate) => void
  onThemeSelect: (theme: Theme) => void
  onSmartArtInsert: (elements: SlideElement[]) => void
  onElementAdd: (element: Omit<SlideElement, 'id'>) => void
  selectedTheme: Theme
  selectedElement?: SlideElement
  onElementUpdate?: (element: SlideElement) => void
  onElementDelete?: (elementId: string) => void
  width?: number
}

export function PropertiesPanel({
  visible,
  onClose,
  onTemplateSelect,
  onThemeSelect,
  onSmartArtInsert,
  onElementAdd,
  selectedTheme,
  selectedElement,
  onElementUpdate,
  onElementDelete,
  width = 400
}: PropertiesPanelProps) {
  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Properties</span>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            size="small"
          />
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      size={width}
      styles={{
        body: { padding: 0 },
        header: { padding: '12px 16px' }
      }}
      mask={false}
      getContainer={false}
    >
      <Tabs
        defaultActiveKey="templates"
        size="small"
        items={[
          {
            key: 'templates',
            label: 'Templates',
            children: <TemplateGallery onTemplateSelect={onTemplateSelect} />
          },
          {
            key: 'add-elements',
            label: 'Add Elements',
            children: <ElementToolbar onElementAdd={onElementAdd} />
          },
          {
            key: 'smartart',
            label: 'SmartArt',
            children: <SmartArtGallery onSmartArtInsert={onSmartArtInsert} />
          },
          {
            key: 'themes',
            label: 'Themes',
            children: (
              <ThemeSelector
                selectedTheme={selectedTheme}
                onThemeSelect={onThemeSelect}
              />
            )
          },
          {
            key: 'elements',
            label: 'Elements',
            children: (
              <ElementProperties
                selectedElement={selectedElement}
                onElementUpdate={onElementUpdate}
                onElementDelete={onElementDelete}
              />
            )
          }
        ]}
      />
    </Drawer>
  )
}
