'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/ui/AppLayout'
import { SlideCanvas } from '@/components/canvas/SlideCanvas'
import { PropertiesPanel } from '@/components/ui/PropertiesPanel'
import { SlideTemplate, Theme, SlideElement } from '@/types/presentation'
import { getDefaultTheme } from '@/lib/themes'

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<SlideTemplate | undefined>()
  const [selectedTheme, setSelectedTheme] = useState<Theme>(getDefaultTheme())
  const [propertiesVisible, setPropertiesVisible] = useState(false)
  const [currentElements, setCurrentElements] = useState<SlideElement[]>([
    {
      id: 'title',
      type: 'text',
      content: 'Your Presentation Title',
      x: 50,
      y: 50,
      width: 700,
      height: 80,
      style: {
        fontSize: '36px',
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000000'
      }
    },
    {
      id: 'subtitle',
      type: 'text',
      content: 'Add your subtitle here',
      x: 50,
      y: 150,
      width: 700,
      height: 40,
      style: {
        fontSize: '24px',
        textAlign: 'center',
        color: '#666666'
      }
    }
  ])
  const [selectedElement, setSelectedElement] = useState<SlideElement | undefined>()

  const handleTemplateSelect = (template: SlideTemplate) => {
    setSelectedTemplate(template)
    // Add template elements to the canvas with unique IDs
    const templateElements = template.elements.map((element, index) => ({
      ...element,
      id: `template-${template.id}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))
    setCurrentElements(templateElements)
  }

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme)
    // Apply theme to existing elements
    setCurrentElements(prev => prev.map(element => ({
      ...element,
      style: {
        ...element.style,
        color: element.style?.color === '#000000' ? theme.colors.text :
               element.style?.color === '#666666' ? theme.colors.secondary : element.style?.color,
        fontFamily: element.style?.fontSize && parseInt(element.style.fontSize.toString()) > 24 ?
                   theme.fonts.heading : theme.fonts.body
      }
    })))
  }

  const handleElementsChange = (elements: SlideElement[]) => {
    setCurrentElements(elements)
  }

  const handleElementSelect = (element: SlideElement | undefined) => {
    setSelectedElement(element)
  }

  const handleElementUpdate = (updatedElement: SlideElement) => {
    setCurrentElements(prev => prev.map(el =>
      el.id === updatedElement.id ? updatedElement : el
    ))
  }

  const handleElementDelete = (elementId: string) => {
    setCurrentElements(prev => prev.filter(el => el.id !== elementId))
    setSelectedElement(undefined) // Clear selection after deletion
  }

  const handleElementAdd = (element: Omit<SlideElement, 'id'>) => {
    // Add a new element to the canvas with unique ID
    const elementWithId: SlideElement = {
      ...element,
      id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    setCurrentElements(prev => [...prev, elementWithId])
  }

  const handleSmartArtInsert = (elements: SlideElement[]) => {
    // Add SmartArt elements to the canvas with unique IDs
    const elementsWithUniqueIds = elements.map(element => ({
      ...element,
      id: `${element.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))
    setCurrentElements(prev => [...prev, ...elementsWithUniqueIds])
  }

  const handleNewPresentation = () => {
    // Reset to empty presentation
    setSelectedTemplate(undefined)
    setCurrentElements([])
    setSelectedTheme(getDefaultTheme())
  }

  const handlePreview = () => {
    // Preview functionality not implemented yet
    console.log('Preview functionality not implemented yet')
  }

  const handleExport = () => {
    // Export functionality not implemented yet
    console.log('Export functionality not implemented yet')
  }

  const handleSettings = () => {
    // Settings functionality not implemented yet
    console.log('Settings functionality not implemented yet')
  }

  return (
    <AppLayout
      onPropertiesClick={() => setPropertiesVisible(true)}
      onNewPresentation={handleNewPresentation}
      onPreview={handlePreview}
      onExport={handleExport}
      onSettings={handleSettings}
    >
      <SlideCanvas
        template={selectedTemplate}
        theme={selectedTheme}
        elements={currentElements}
        onElementsChange={handleElementsChange}
        onElementSelect={handleElementSelect}
      />

      <PropertiesPanel
        visible={propertiesVisible}
        onClose={() => setPropertiesVisible(false)}
        onTemplateSelect={handleTemplateSelect}
        onThemeSelect={handleThemeSelect}
        onSmartArtInsert={handleSmartArtInsert}
        onElementAdd={handleElementAdd}
        selectedTheme={selectedTheme}
        selectedElement={selectedElement}
        onElementUpdate={handleElementUpdate}
        onElementDelete={handleElementDelete}
      />
    </AppLayout>
  )
}
