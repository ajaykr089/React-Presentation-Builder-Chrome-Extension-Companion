'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { Modal, Tabs, Switch, Select, Input, Button, Divider, Space } from 'antd'
import { AppLayout } from '@/components/ui/AppLayout'
import { SlideCanvas } from '@/components/canvas/SlideCanvas'
import { PropertiesPanel } from '@/components/ui/PropertiesPanel'
import { PresentationPreview } from '@/components/ui/PresentationPreview'
import { SlideTemplate, Theme, SlideElement } from '@/types/presentation'
import { getDefaultTheme } from '@/lib/themes'
import { exportToPPTX, exportToPDF, exportToPNG, saveProject } from '@/lib/export'

interface Slide {
  id: string
  elements: SlideElement[]
  backgroundColor?: string
  layout: string
  transition?: {
    type: 'fade' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'zoom' | 'rotate'
    duration: number
    easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  }
}

const Home = memo(function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<SlideTemplate | undefined>()
  const [selectedTheme, setSelectedTheme] = useState<Theme>(getDefaultTheme())
  const [propertiesVisible, setPropertiesVisible] = useState(false)
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 'slide-1',
      layout: 'blank',
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
  const [activePropertiesTab, setActivePropertiesTab] = useState<string>('templates')
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [exportVisible, setExportVisible] = useState(false)

  // Presentations management
  const [presentations, setPresentations] = useState<Array<{
    id: string
    name: string
    slides: Slide[]
    theme: Theme
    lastModified: Date
  }>>([])
  const [currentPresentationId, setCurrentPresentationId] = useState<string | null>(null)
  const [presentationManagerVisible, setPresentationManagerVisible] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    // General
    slideSize: '16:9',
    language: 'en',
    appTheme: 'light',

    // Editor
    autoSave: true,
    showGrid: true,
    snapToGrid: true,
    showOutlines: false,
    gridSize: 20,

    // Export
    defaultFormat: 'pptx',
    imageQuality: 'high',
    includeNotes: true,
    embedFonts: true,

    // Advanced
    experimentalFeatures: false,
    analytics: true,
    aiSuggestions: false
  })

  const handleTemplateSelect = useCallback((template: SlideTemplate) => {
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
  }, [currentSlideIndex])

  const handleThemeSelect = useCallback((theme: Theme) => {
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
  }, [currentSlideIndex])

  const currentSlide = slides[currentSlideIndex]
  const currentElements = currentSlide?.elements || []

  const handleElementsChange = useCallback((elements: SlideElement[]) => {
    setSlides(prev => prev.map((slide, index) =>
      index === currentSlideIndex ? { ...slide, elements } : slide
    ))

    // Update current presentation if one is loaded
    if (currentPresentationId) {
      setPresentations(prev => prev.map(presentation =>
        presentation.id === currentPresentationId
          ? {
              ...presentation,
              slides: presentation.slides.map((slide, index) =>
                index === currentSlideIndex
                  ? { ...slide, elements }
                  : slide
              ),
              lastModified: new Date()
            }
          : presentation
      ))
    }
  }, [currentSlideIndex, currentPresentationId])

  const handleElementSelect = useCallback((element: SlideElement | undefined) => {
    setSelectedElement(element)
    // Auto-switch to Elements tab when element is selected
    if (element) {
      setActivePropertiesTab('elements')
    }
    // Note: When element is deselected, we keep the current tab
    // to avoid disrupting user workflow
  }, [])

  const handleTabChange = useCallback((tab: string) => {
    // Update tab immediately without setTimeout
    setActivePropertiesTab(tab);
  }, [])

  const handleElementUpdate = useCallback((updatedElement: SlideElement) => {
    setSlides(prev => prev.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, elements: slide.elements.map(el => el.id === updatedElement.id ? updatedElement : el) }
        : slide
    ))

    // Update current presentation if one is loaded
    if (currentPresentationId) {
      setPresentations(prev => prev.map(presentation =>
        presentation.id === currentPresentationId
          ? {
              ...presentation,
              slides: presentation.slides.map((slide, index) =>
                index === currentSlideIndex
                  ? { ...slide, elements: slide.elements.map(el => el.id === updatedElement.id ? updatedElement : el) }
                  : slide
              ),
              lastModified: new Date()
            }
          : presentation
      ))
    }
  }, [currentSlideIndex, currentPresentationId])

  const handleElementDelete = useCallback((elementId: string) => {
    setSlides(prev => prev.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, elements: slide.elements.filter(el => el.id !== elementId) }
        : slide
    ))
    setSelectedElement(undefined) // Clear selection after deletion

    // Update current presentation if one is loaded
    if (currentPresentationId) {
      setPresentations(prev => prev.map(presentation =>
        presentation.id === currentPresentationId
          ? {
              ...presentation,
              slides: presentation.slides.map((slide, index) =>
                index === currentSlideIndex
                  ? { ...slide, elements: slide.elements.filter(el => el.id !== elementId) }
                  : slide
              ),
              lastModified: new Date()
            }
          : presentation
      ))
    }
  }, [currentSlideIndex, currentPresentationId])

  const handleElementAdd = useCallback((element: Omit<SlideElement, 'id'>) => {
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

    // Update current presentation if one is loaded
    if (currentPresentationId) {
      setPresentations(prev => prev.map(presentation =>
        presentation.id === currentPresentationId
          ? {
              ...presentation,
              slides: presentation.slides.map((slide, index) =>
                index === currentSlideIndex
                  ? { ...slide, elements: [...slide.elements, elementWithId] }
                  : slide
              ),
              lastModified: new Date()
            }
          : presentation
      ))
    }
  }, [currentSlideIndex, currentPresentationId])

  const handleSmartArtInsert = useCallback((elements: SlideElement[]) => {
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

    // Update current presentation if one is loaded
    if (currentPresentationId) {
      setPresentations(prev => prev.map(presentation =>
        presentation.id === currentPresentationId
          ? {
              ...presentation,
              slides: presentation.slides.map((slide, index) =>
                index === currentSlideIndex
                  ? { ...slide, elements: [...slide.elements, ...elementsWithUniqueIds] }
                  : slide
              ),
              lastModified: new Date()
            }
          : presentation
      ))
    }
  }, [currentSlideIndex, currentPresentationId])

  // Load presentations from localStorage on mount
  useEffect(() => {
    const savedPresentations = localStorage.getItem('presentation-builder-presentations')
    if (savedPresentations) {
      try {
        const parsedPresentations = JSON.parse(savedPresentations)
        setPresentations(parsedPresentations)
      } catch (error) {
        console.warn('Failed to load presentations from localStorage:', error)
      }
    }
  }, [])

  // Save presentations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('presentation-builder-presentations', JSON.stringify(presentations))
  }, [presentations])

  const handleNewPresentation = useCallback(() => {
    // Reset to empty presentation with one blank slide
    setSelectedTemplate(undefined)
    setSlides([{
      id: 'slide-1',
      layout: 'blank',
      elements: [],
      backgroundColor: '#ffffff'
    }])
    setCurrentSlideIndex(0)
    setSelectedTheme(getDefaultTheme())
    setCurrentPresentationId(null)
  }, [])

  const handleSavePresentation = useCallback(() => {
    const presentationName = prompt('Enter presentation name:')
    if (!presentationName) return

    const presentation = {
      id: currentPresentationId || `presentation-${Date.now()}`,
      name: presentationName,
      slides,
      theme: selectedTheme,
      lastModified: new Date()
    }

    setPresentations(prev => {
      const existingIndex = prev.findIndex(p => p.id === presentation.id)
      if (existingIndex >= 0) {
        // Update existing presentation
        const updated = [...prev]
        updated[existingIndex] = presentation
        return updated
      } else {
        // Add new presentation
        return [...prev, presentation]
      }
    })

    setCurrentPresentationId(presentation.id)
    alert(`Presentation "${presentationName}" saved successfully!`)
  }, [slides, selectedTheme, currentPresentationId])

  const handleLoadPresentation = useCallback((presentationId: string) => {
    const presentation = presentations.find(p => p.id === presentationId)
    if (presentation) {
      setSlides(presentation.slides)
      setSelectedTheme(presentation.theme)
      setCurrentSlideIndex(0)
      setCurrentPresentationId(presentation.id)
      setSelectedElement(undefined)
      setPresentationManagerVisible(false)
    }
  }, [presentations])

  const handleDeletePresentation = useCallback((presentationId: string) => {
    if (confirm('Are you sure you want to delete this presentation?')) {
      setPresentations(prev => prev.filter(p => p.id !== presentationId))
      if (currentPresentationId === presentationId) {
        handleNewPresentation()
      }
    }
  }, [currentPresentationId, handleNewPresentation])

  const handleOpenPresentationManager = useCallback(() => {
    setPresentationManagerVisible(true)
  }, [])

  const handleAddNewSlide = useCallback(() => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      layout: 'blank',
      elements: [],
      backgroundColor: '#ffffff'
    }
    setSlides(prev => [...prev, newSlide])
    setCurrentSlideIndex(slides.length)

    // Update current presentation if one is loaded
    if (currentPresentationId) {
      setPresentations(prev => prev.map(presentation =>
        presentation.id === currentPresentationId
          ? {
              ...presentation,
              slides: [...presentation.slides, newSlide],
              lastModified: new Date()
            }
          : presentation
      ))
    }
  }, [slides.length, currentPresentationId])

  const handleDeleteSlide = useCallback(() => {
    if (slides.length <= 1) {
      alert('Cannot delete the last slide. Presentations must have at least one slide.')
      return
    }

    const newSlides = slides.filter((_, index) => index !== currentSlideIndex)
    let newCurrentIndex = currentSlideIndex

    // Adjust current slide index if we deleted the last slide
    if (currentSlideIndex >= newSlides.length) {
      newCurrentIndex = newSlides.length - 1
    }

    setSlides(newSlides)
    setCurrentSlideIndex(newCurrentIndex)
    setSelectedElement(undefined) // Clear selection after slide deletion

    // Update current presentation if one is loaded
    if (currentPresentationId) {
      setPresentations(prev => prev.map(presentation =>
        presentation.id === currentPresentationId
          ? {
              ...presentation,
              slides: newSlides,
              lastModified: new Date()
            }
          : presentation
      ))
    }
  }, [slides, currentSlideIndex, currentPresentationId])

  const handleNextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
      setSelectedElement(undefined)
    }
  }, [currentSlideIndex, slides.length])

  const handlePrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
      setSelectedElement(undefined)
    }
  }, [currentSlideIndex])

  const handleSlideTransitionUpdate = useCallback((transition: any) => {
    setSlides(prev => prev.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, transition }
        : slide
    ))

    // Update current presentation if one is loaded
    if (currentPresentationId) {
      setPresentations(prev => prev.map(presentation =>
        presentation.id === currentPresentationId
          ? {
              ...presentation,
              slides: presentation.slides.map((slide, index) =>
                index === currentSlideIndex
                  ? { ...slide, transition }
                  : slide
              ),
              lastModified: new Date()
            }
          : presentation
      ))
    }
  }, [currentSlideIndex, currentPresentationId])

  const handleSlideBackgroundUpdate = useCallback((color: string) => {
    setSlides(prev => prev.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, backgroundColor: color }
        : slide
    ))

    // Update current presentation if one is loaded
    if (currentPresentationId) {
      setPresentations(prev => prev.map(presentation =>
        presentation.id === currentPresentationId
          ? {
              ...presentation,
              slides: presentation.slides.map((slide, index) =>
                index === currentSlideIndex
                  ? { ...slide, backgroundColor: color }
                  : slide
              ),
              lastModified: new Date()
            }
          : presentation
      ))
    }
  }, [currentSlideIndex, currentPresentationId])

  const handlePreview = useCallback(() => {
    setPreviewVisible(true)
  }, [])

  const handlePreviewClose = useCallback(() => {
    setPreviewVisible(false)
  }, [])

  const handleExport = useCallback(async () => {
    try {
      // Use the default format from settings
      switch (settings.defaultFormat) {
        case 'pptx':
          await exportToPPTX(slides, selectedTheme)
          break
        case 'pdf':
          // For PDF, we need to get the canvas element
          const canvasElement = document.querySelector('.presentation-canvas') as HTMLElement
          if (canvasElement) {
            await exportToPDF(canvasElement)
          }
          break
        case 'png':
        case 'jpg':
          const canvasElement2 = document.querySelector('.presentation-canvas') as HTMLElement
          if (canvasElement2) {
            await exportToPNG(canvasElement2)
          }
          break
        default:
          await exportToPPTX(slides, selectedTheme)
      }
    } catch (error) {
      console.error('Export failed:', error)
      // Could show a notification here
    }
  }, [slides, selectedTheme, settings.defaultFormat])

  const handleSettings = useCallback(() => {
    setSettingsVisible(true)
  }, [])

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('presentation-builder-settings')
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsedSettings }))
      } catch (error) {
        console.warn('Failed to load settings from localStorage:', error)
      }
    }
  }, [])

  // Check for pending extension imports on mount
  useEffect(() => {
    const checkForPendingImports = async () => {
      try {
        const response = await fetch('/api/extension/import')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data && result.data.slides) {
            console.log('Found pending import:', result.data)

            // Add the imported slides to the current presentation
            const importedSlides = result.data.slides.map((slide: any) => ({
              id: slide.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              layout: slide.layout || 'blank',
              elements: slide.elements || [],
              backgroundColor: slide.backgroundColor || '#ffffff',
              transition: slide.transition
            }))

            setSlides(prev => [...prev, ...importedSlides])

            // Update current presentation if one is loaded
            if (currentPresentationId) {
              setPresentations(prev => prev.map(presentation =>
                presentation.id === currentPresentationId
                  ? {
                      ...presentation,
                      slides: [...presentation.slides, ...importedSlides],
                      lastModified: new Date()
                    }
                  : presentation
              ))
            }

            console.log(`Added ${importedSlides.length} slides from extension import`)
          }
        }
      } catch (error) {
        console.warn('Error checking for pending imports:', error)
      }
    }

    // Check immediately and then every 2 seconds for 30 seconds
    checkForPendingImports()
    const interval = setInterval(checkForPendingImports, 2000)
    const timeout = setTimeout(() => clearInterval(interval), 30000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [currentPresentationId])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('presentation-builder-settings', JSON.stringify(settings))
  }, [settings])

  // Settings handlers
  const handleSettingChange = useCallback((key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleSaveSettings = useCallback(() => {
    // Apply immediate settings that affect the UI
    if (settings.appTheme !== 'light') {
      // Apply theme changes if needed
      document.documentElement.setAttribute('data-theme', settings.appTheme)
    }

    setSettingsVisible(false)
  }, [settings.appTheme])

  const handleResetSettings = useCallback(() => {
    const defaultSettings = {
      slideSize: '16:9',
      language: 'en',
      appTheme: 'light',
      autoSave: true,
      showGrid: true,
      snapToGrid: true,
      showOutlines: false,
      gridSize: 20,
      defaultFormat: 'pptx',
      imageQuality: 'high',
      includeNotes: true,
      embedFonts: true,
      experimentalFeatures: false,
      analytics: true,
      aiSuggestions: false
    }
    setSettings(defaultSettings)
  }, [])

  return (
    <>
      <AppLayout
        onPropertiesClick={() => setPropertiesVisible(true)}
        onNewPresentation={handleNewPresentation}
        onPreview={handlePreview}
        onExport={handleExport}
        onSettings={handleSettings}
        onAddSlide={handleAddNewSlide}
        onDeleteSlide={handleDeleteSlide}
        onNextSlide={handleNextSlide}
        onPrevSlide={handlePrevSlide}
        onPresentationManager={handleOpenPresentationManager}
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
          activeTab={activePropertiesTab}
          onTabChange={handleTabChange}
        />
      </AppLayout>

      {previewVisible && (
        <PresentationPreview
          slides={slides}
          theme={selectedTheme}
          onClose={handlePreviewClose}
        />
      )}

      <Modal
        title="Settings"
        open={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setSettingsVisible(false)}>
            Cancel
          </Button>,
          <Button key="reset" danger onClick={handleResetSettings}>
            Reset All
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveSettings}>
            Save Settings
          </Button>
        ]}
        width={600}
      >
        <Tabs
          defaultActiveKey="general"
          size="small"
          items={[
            {
              key: 'general',
              label: 'General',
              children: (
                <div style={{ padding: '16px 0' }}>
                  <h4>Application Preferences</h4>
                  <Divider />

                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Default Slide Size
                      </label>
                      <Select
                        value={settings.slideSize}
                        onChange={(value) => handleSettingChange('slideSize', value)}
                        style={{ width: '200px' }}
                      >
                        <Select.Option value="4:3">4:3 (Standard)</Select.Option>
                        <Select.Option value="16:9">16:9 (Widescreen)</Select.Option>
                        <Select.Option value="16:10">16:10 (Widescreen)</Select.Option>
                        <Select.Option value="custom">Custom</Select.Option>
                      </Select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Language
                      </label>
                      <Select
                        value={settings.language}
                        onChange={(value) => handleSettingChange('language', value)}
                        style={{ width: '200px' }}
                      >
                        <Select.Option value="en">English</Select.Option>
                        <Select.Option value="es">Spanish</Select.Option>
                        <Select.Option value="fr">French</Select.Option>
                        <Select.Option value="de">German</Select.Option>
                        <Select.Option value="zh">Chinese</Select.Option>
                      </Select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Theme
                      </label>
                      <Select
                        value={settings.appTheme}
                        onChange={(value) => handleSettingChange('appTheme', value)}
                        style={{ width: '200px' }}
                      >
                        <Select.Option value="light">Light</Select.Option>
                        <Select.Option value="dark">Dark</Select.Option>
                        <Select.Option value="auto">Auto (System)</Select.Option>
                      </Select>
                    </div>
                  </Space>
                </div>
              )
            },
            {
              key: 'editor',
              label: 'Editor',
              children: (
                <div style={{ padding: '16px 0' }}>
                  <h4>Editor Preferences</h4>
                  <Divider />

                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        <Switch
                          checked={settings.autoSave}
                          onChange={(checked) => handleSettingChange('autoSave', checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Auto-save presentations
                      </label>
                      <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 16px 0' }}>
                        Automatically save your work every 30 seconds
                      </p>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        <Switch
                          checked={settings.showGrid}
                          onChange={(checked) => handleSettingChange('showGrid', checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Show grid
                      </label>
                      <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 16px 0' }}>
                        Display alignment grid on canvas
                      </p>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        <Switch
                          checked={settings.snapToGrid}
                          onChange={(checked) => handleSettingChange('snapToGrid', checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Snap to grid
                      </label>
                      <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 16px 0' }}>
                        Elements snap to grid lines when moving
                      </p>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        <Switch
                          checked={settings.showOutlines}
                          onChange={(checked) => handleSettingChange('showOutlines', checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Show element outlines
                      </label>
                      <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 16px 0' }}>
                        Display blue outlines around selected elements
                      </p>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Grid Size
                      </label>
                      <Select
                        value={settings.gridSize}
                        onChange={(value) => handleSettingChange('gridSize', Number(value))}
                        style={{ width: '200px' }}
                      >
                        <Select.Option value={10}>10px</Select.Option>
                        <Select.Option value={20}>20px</Select.Option>
                        <Select.Option value={25}>25px</Select.Option>
                        <Select.Option value={50}>50px</Select.Option>
                      </Select>
                    </div>
                  </Space>
                </div>
              )
            },
            {
              key: 'keyboard',
              label: 'Keyboard',
              children: (
                <div style={{ padding: '16px 0' }}>
                  <h4>Keyboard Shortcuts</h4>
                  <Divider />

                  <div style={{ marginBottom: '16px' }}>
                    <h5>General</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                      <div><code>Ctrl+N</code> - New Presentation</div>
                      <div><code>Ctrl+S</code> - Save</div>
                      <div><code>Ctrl+O</code> - Open</div>
                      <div><code>Ctrl+E</code> - Export</div>
                      <div><code>F11</code> - Fullscreen Preview</div>
                      <div><code>Ctrl+Z</code> - Undo</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <h5>Elements</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                      <div><code>Delete</code> - Delete Selected</div>
                      <div><code>Ctrl+C</code> - Copy</div>
                      <div><code>Ctrl+V</code> - Paste</div>
                      <div><code>Ctrl+D</code> - Duplicate</div>
                      <div><code>Ctrl+G</code> - Group</div>
                      <div><code>Ctrl+Shift+G</code> - Ungroup</div>
                    </div>
                  </div>

                  <div>
                    <h5>Slides</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                      <div><code>Page Up</code> - Previous Slide</div>
                      <div><code>Page Down</code> - Next Slide</div>
                      <div><code>Ctrl+M</code> - New Slide</div>
                      <div><code>Ctrl+Shift+N</code> - Duplicate Slide</div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              key: 'export',
              label: 'Export',
              children: (
                <div style={{ padding: '16px 0' }}>
                  <h4>Export Preferences</h4>
                  <Divider />

                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Default Export Format
                      </label>
                      <Select
                        value={settings.defaultFormat}
                        onChange={(value) => handleSettingChange('defaultFormat', value)}
                        style={{ width: '200px' }}
                      >
                        <Select.Option value="pptx">PowerPoint (.pptx)</Select.Option>
                        <Select.Option value="pdf">PDF (.pdf)</Select.Option>
                        <Select.Option value="png">PNG Images</Select.Option>
                        <Select.Option value="jpg">JPG Images</Select.Option>
                      </Select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Image Quality
                      </label>
                      <Select
                        value={settings.imageQuality}
                        onChange={(value) => handleSettingChange('imageQuality', value)}
                        style={{ width: '200px' }}
                      >
                        <Select.Option value="low">Low (Faster)</Select.Option>
                        <Select.Option value="medium">Medium</Select.Option>
                        <Select.Option value="high">High (Best Quality)</Select.Option>
                      </Select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        <Switch
                          checked={settings.includeNotes}
                          onChange={(checked) => handleSettingChange('includeNotes', checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Include speaker notes
                      </label>
                      <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 16px 0' }}>
                        Export slides with speaker notes when available
                      </p>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        <Switch
                          checked={settings.embedFonts}
                          onChange={(checked) => handleSettingChange('embedFonts', checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Embed fonts
                      </label>
                      <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 16px 0' }}>
                        Include fonts in exported files for consistent display
                      </p>
                    </div>
                  </Space>
                </div>
              )
            },
            {
              key: 'advanced',
              label: 'Advanced',
              children: (
                <div style={{ padding: '16px 0' }}>
                  <h4>Advanced Settings</h4>
                  <Divider />

                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        <Switch
                          checked={settings.experimentalFeatures}
                          onChange={(checked) => handleSettingChange('experimentalFeatures', checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Enable experimental features
                      </label>
                      <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 16px 0' }}>
                        Access beta features and new functionality
                      </p>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        <Switch
                          checked={settings.analytics}
                          onChange={(checked) => handleSettingChange('analytics', checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Enable analytics
                      </label>
                      <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 16px 0' }}>
                        Help improve the app by sharing anonymous usage data
                      </p>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        <Switch
                          checked={settings.aiSuggestions}
                          onChange={(checked) => handleSettingChange('aiSuggestions', checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Enable AI suggestions
                      </label>
                      <p style={{ color: '#666', fontSize: '12px', margin: '4px 0 16px 0' }}>
                        Get smart content suggestions while editing
                      </p>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                      <Button danger onClick={handleResetSettings}>Reset All Settings</Button>
                      <p style={{ color: '#666', fontSize: '12px', margin: '8px 0 0 0' }}>
                        This will restore all settings to their default values
                      </p>
                    </div>
                  </Space>
                </div>
              )
            }
          ]}
        />
      </Modal>

      <Modal
        title="Presentation Manager"
        open={presentationManagerVisible}
        onCancel={() => setPresentationManagerVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPresentationManagerVisible(false)}>
            Close
          </Button>,
          <Button key="new" type="primary" onClick={() => {
            handleNewPresentation()
            setPresentationManagerVisible(false)
          }}>
            New Presentation
          </Button>
        ]}
        width={700}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
            <Button
              onClick={handleSavePresentation}
              style={{ flex: 1 }}
            >
              Save Current Presentation
            </Button>
          </div>

          <Divider>Your Presentations</Divider>

          {presentations.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
              <p>No saved presentations yet.</p>
              <p>Create and save presentations to see them here.</p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {presentations.map((presentation) => (
                <div
                  key={presentation.id}
                  style={{
                    padding: '12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    backgroundColor: currentPresentationId === presentation.id ? '#f0f8ff' : '#fff',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleLoadPresentation(presentation.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>
                        {presentation.name}
                        {currentPresentationId === presentation.id && (
                          <span style={{ color: '#1890ff', marginLeft: '8px', fontSize: '12px' }}>
                            (Current)
                          </span>
                        )}
                      </h4>
                      <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>
                        {presentation.slides.length} slide{presentation.slides.length !== 1 ? 's' : ''}
                      </p>
                      <p style={{ margin: '0', color: '#999', fontSize: '12px' }}>
                        Last modified: {new Date(presentation.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      danger
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePresentation(presentation.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  )
})

export default Home
