'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/ui/AppLayout'
import { SlideCanvas } from '@/components/canvas/SlideCanvas'
import { PropertiesPanel } from '@/components/ui/PropertiesPanel'
import { PresentationPreview } from '@/components/ui/PresentationPreview'
import { SlideTemplate, Theme, SlideElement } from '@/types/presentation'
import { getDefaultTheme } from '@/lib/themes'

interface Slide {
  id: string
  elements: SlideElement[]
  backgroundColor?: string
  transition?: {
    type: 'fade' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'zoom' | 'rotate'
    duration: number
    easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  }
}

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<SlideTemplate | undefined>()
  const [selectedTheme, setSelectedTheme] = useState<Theme>(getDefaultTheme())
  const [propertiesVisible, setPropertiesVisible] = useState(false)
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 'slide-1',
      elements: [
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
      ],
      backgroundColor: '#ffffff'
    }
  ])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElement, setSelectedElement] = useState<SlideElement | undefined>()
  const [previewVisible, setPreviewVisible] = useState(false)

  const handleTemplateSelect = (template: SlideTemplate) => {
    setSelectedTemplate(template)
    // Add template elements to the current slide with unique IDs
    const templateElements = template.elements.map((element, index) => ({
      ...element,
      id: `template-${template.id}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))
    setSlides(prev => prev.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, elements: [...slide.elements, ...templateElements] }
        : slide
    ))
  }

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme)
    // Apply theme to existing elements on current slide
    setSlides(prev => prev.map((slide, index) =>
      index === currentSlideIndex
        ? {
            ...slide,
            elements: slide.elements.map(element => ({
              ...element,
              style: {
                ...element.style,
                color: element.style?.color === '#000000' ? theme.colors.text :
                       element.style?.color === '#666666' ? theme.colors.secondary : element.style?.color,
                fontFamily: element.style?.fontSize && parseInt(element.style.fontSize.toString()) > 24 ?
                           theme.fonts.heading : theme.fonts.body
              }
            }))
          }
        : slide
    ))
  }

  const currentSlide = slides[currentSlideIndex]
  const currentElements = currentSlide?.elements || []

  const handleElementsChange = (elements: SlideElement[]) => {
    setSlides(prev => prev.map((slide, index) =>
      index === currentSlideIndex ? { ...slide, elements } : slide
    ))
  }

  const handleElementSelect = (element: SlideElement | undefined) => {
    setSelectedElement(element)
  }

  const handleElementUpdate = (updatedElement: SlideElement) => {
    setSlides(prev => prev.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, elements: slide.elements.map(el => el.id === updatedElement.id ? updatedElement : el) }
        : slide
    ))
  }

  const handleElementDelete = (elementId: string) => {
    setSlides(prev => prev.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, elements: slide.elements.filter(el => el.id !== elementId) }
        : slide
    ))
    setSelectedElement(undefined) // Clear selection after deletion
  }

  const handleElementAdd = (element: Omit<SlideElement, 'id'>) => {
    // Add a new element to the current slide with unique ID
    const elementWithId: SlideElement = {
      ...element,
      id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    setSlides(prev => prev.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, elements: [...slide.elements, elementWithId] }
        : slide
    ))
  }

  const handleSmartArtInsert = (elements: SlideElement[]) => {
    // Add SmartArt elements to the current slide with unique IDs
    const elementsWithUniqueIds = elements.map(element => ({
      ...element,
      id: `${element.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))
    setSlides(prev => prev.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, elements: [...slide.elements, ...elementsWithUniqueIds] }
        : slide
    ))
  }

  const handleNewPresentation = () => {
    // Reset to empty presentation with one blank slide
    setSelectedTemplate(undefined)
    setSlides([{
      id: 'slide-1',
      elements: [],
      backgroundColor: '#ffffff'
    }])
    setCurrentSlideIndex(0)
    setSelectedTheme(getDefaultTheme())
  }

  const handleAddNewSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      elements: [],
      backgroundColor: '#ffffff'
    }
    setSlides(prev => [...prev, newSlide])
    setCurrentSlideIndex(slides.length)
  }

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
      setSelectedElement(undefined)
    }
  }

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
      setSelectedElement(undefined)
    }
  }

  const handleSlideTransitionUpdate = (transition: any) => {
    setSlides(prev => prev.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, transition }
        : slide
    ))
  }

  const handleSlideBackgroundUpdate = (color: string) => {
    setSlides(prev => prev.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, backgroundColor: color }
        : slide
    ))
  }

  const handlePreview = () => {
    setPreviewVisible(true)
  }

  const handlePreviewClose = () => {
    setPreviewVisible(false)
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
    <>
      <AppLayout
        onPropertiesClick={() => setPropertiesVisible(true)}
        onNewPresentation={handleNewPresentation}
        onPreview={handlePreview}
        onExport={handleExport}
        onSettings={handleSettings}
        onAddSlide={handleAddNewSlide}
        onNextSlide={handleNextSlide}
        onPrevSlide={handlePrevSlide}
        currentSlideIndex={currentSlideIndex}
        totalSlides={slides.length}
      >
        <SlideCanvas
          template={selectedTemplate}
          theme={selectedTheme}
          elements={currentElements}
          backgroundColor={currentSlide?.backgroundColor || '#ffffff'}
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
          onSlideTransitionUpdate={handleSlideTransitionUpdate}
          onSlideBackgroundUpdate={handleSlideBackgroundUpdate}
          currentSlideTransition={currentSlide?.transition}
          currentSlideBackground={currentSlide?.backgroundColor}
        />
      </AppLayout>

      {previewVisible && (
        <PresentationPreview
          slides={slides}
          theme={selectedTheme}
          onClose={handlePreviewClose}
        />
      )}
    </>
  )
}
