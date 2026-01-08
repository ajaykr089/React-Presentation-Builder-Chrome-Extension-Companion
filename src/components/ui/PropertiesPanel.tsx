'use client'

import { Tabs, Drawer, Button } from 'antd'
import { memo, useCallback } from 'react'
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
  onSlideTransitionUpdate?: (transition: any) => void
  onSlideBackgroundUpdate?: (color: string) => void
  currentSlideTransition?: any
  currentSlideBackground?: string
  activeTab?: string
  onTabChange?: (tab: string) => void
  width?: number
}

const PropertiesPanel = memo(function PropertiesPanel({
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
  onSlideTransitionUpdate,
  onSlideBackgroundUpdate,
  currentSlideTransition,
  currentSlideBackground,
  activeTab = 'templates',
  onTabChange,
  width = 400
}: PropertiesPanelProps) {
  console.log("PropertiesPanel rendered with activeTab:", activeTab, selectedElement);
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
      onClick={(e) => {
        // Prevent clicks on the drawer from bubbling up and potentially clearing element selection
        e.stopPropagation()
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          console.log('Tab changed to:', key);
          onTabChange?.(key)
        }}
        onTabClick={(key, e) => {
          // Prevent event propagation to avoid clearing element selection
          e.stopPropagation()
        }}
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
            key: 'slide-settings',
            label: 'Slide Settings',
            children: (
              <div style={{ padding: '16px' }}>
                <h3>Slide Transition</h3>
                <p>Configure the transition effect that plays when moving to the next slide.</p>

                <div style={{ marginTop: '16px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Transition Type
                    </label>
                    <select
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                      value={currentSlideTransition?.type || 'fade'}
                      onChange={(e) => onSlideTransitionUpdate?.({
                        ...currentSlideTransition,
                        type: e.target.value
                      })}
                    >
                      <option value="fade">Fade</option>
                      <option value="slideLeft">Slide Left</option>
                      <option value="slideRight">Slide Right</option>
                      <option value="slideUp">Slide Up</option>
                      <option value="slideDown">Slide Down</option>
                      <option value="zoom">Zoom</option>
                      <option value="rotate">Rotate</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Duration: {currentSlideTransition?.duration || 500}ms
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="2000"
                      value={currentSlideTransition?.duration || 500}
                      step="100"
                      style={{ width: '100%' }}
                      onChange={(e) => onSlideTransitionUpdate?.({
                        ...currentSlideTransition,
                        duration: parseInt(e.target.value)
                      })}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Easing
                    </label>
                    <select
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                      value={currentSlideTransition?.easing || 'easeOut'}
                      onChange={(e) => onSlideTransitionUpdate?.({
                        ...currentSlideTransition,
                        easing: e.target.value
                      })}
                    >
                      <option value="linear">Linear</option>
                      <option value="easeIn">Ease In</option>
                      <option value="easeOut">Ease Out</option>
                      <option value="easeInOut">Ease In Out</option>
                    </select>
                  </div>
                </div>

                <h3 style={{ marginTop: '24px' }}>Slide Background</h3>
                <p>Customize the background for this slide.</p>

                <div style={{ marginTop: '16px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={currentSlideBackground || '#ffffff'}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      onChange={(e) => onSlideBackgroundUpdate?.(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )
          },
          {
            key: 'animations',
            label: 'Animations',
            children: (
              <div style={{ padding: '16px' }}>
                <h3>Element Animations</h3>
                <p>Select individual elements and use the Elements tab to add animations to them.</p>
              </div>
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
})

export { PropertiesPanel }
