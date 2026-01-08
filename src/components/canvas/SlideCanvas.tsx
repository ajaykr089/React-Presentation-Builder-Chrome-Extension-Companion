'use client'

import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { Card, Typography } from 'antd'
import { SlideElement, SlideTemplate, Theme } from '@/types/presentation'
import { RichTextEditor } from '@/components/elements/RichTextEditor'
import { ChartElement } from '@/components/elements/ChartElement'
import { TableElement } from '@/components/elements/TableElement'
import { CodeElement } from '@/components/elements/CodeElement'
import { ShapeRenderer } from '@/components/elements/ShapeRenderer'
import { ArrowRenderer } from '@/components/elements/ArrowRenderer'
import { QuoteElement } from '@/components/elements/QuoteElement'
import { IconElement } from '@/components/elements/IconElement'
import { LinkElement } from '@/components/elements/LinkElement'
import { VideoElement } from '@/components/elements/VideoElement'
import { AudioElement } from '@/components/elements/AudioElement'
import { DiagramElement } from '@/components/elements/DiagramElement'
import { DrawElement } from '@/components/elements/DrawElement'
import { applyAnimationToElement, generateAnimationCSS } from '@/lib/animations'
import { v4 as uuidv4 } from 'uuid'

const { Title, Paragraph } = Typography

interface SlideCanvasProps {
  width?: number
  height?: number
  backgroundColor?: string
  template?: SlideTemplate
  theme?: Theme
  elements?: SlideElement[]
  onElementsChange?: (elements: SlideElement[]) => void
  onElementSelect?: (element: SlideElement | undefined) => void
  readOnly?: boolean
}

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

const SlideCanvas = memo(function SlideCanvas({
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
  backgroundColor = '#ffffff',
  template,
  theme,
  elements: externalElements = [],
  onElementsChange,
  onElementSelect,
  readOnly = false
}: SlideCanvasProps) {
  // Use external elements (required now)
  const displayElements = externalElements

  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  // Notify parent when element selection changes
  useEffect(() => {
    if (onElementSelect) {
      if (selectedElement) {
        const element = displayElements.find(el => el.id === selectedElement)
        onElementSelect(element)
      } else {
        onElementSelect(undefined)
      }
    }
  }, [selectedElement, onElementSelect])

  // Keyboard delete functionality
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard events in editor mode (not readOnly)
      if (readOnly) return

      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedElement) {
        event.preventDefault()
        // Find the onElementDelete handler - we need to pass it from props
        // For now, we'll call the parent's onElementsChange to remove the element
        const updatedElements = displayElements.filter(el => el.id !== selectedElement)
        onElementsChange?.(updatedElements)
        setSelectedElement(null) // Clear selection after deletion
      }
    }

    // Add event listener to window to capture keyboard events
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [readOnly, selectedElement, displayElements, onElementsChange])

  const handleElementClick = useCallback((elementId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedElement(elementId)
  }, [])

  const handleCanvasClick = useCallback(() => {
    setSelectedElement(null)
  }, [])

  const handleMouseDown = useCallback((elementId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setIsDragging(true)
    setSelectedElement(elementId)

    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      // Find the element to get its current position
      const element = displayElements.find(el => el.id === elementId)
      if (element) {
        setDragStart({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          elementX: element.x,
          elementY: element.y
        })
      }
    }
  }, [displayElements])

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    // Calculate new position based on mouse movement from drag start
    const deltaX = mouseX - dragStart.x
    const deltaY = mouseY - dragStart.y

    const newX = Math.max(0, dragStart.elementX + deltaX)
    const newY = Math.max(0, dragStart.elementY + deltaY)

    const updatedElements = displayElements.map(el =>
      el.id === selectedElement
        ? { ...el, x: newX, y: newY }
        : el
    )

    onElementsChange?.(updatedElements)
  }, [isDragging, selectedElement, dragStart, displayElements, onElementsChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div
        style={{
          width: width,
          margin: '45px auto',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <div
          ref={canvasRef}
          className="presentation-canvas"
          style={{
            width,
            height,
            backgroundColor,
            position: 'relative',
            margin: '0 auto',
            cursor: isDragging ? 'grabbing' : 'default'
          }}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {displayElements.map((element) => {
            // Apply animation to element if it has animation properties
            // Show animations in both editor and preview modes
            const animatedElement = element.animation
              ? applyAnimationToElement(element, {
                  id: `anim-${element.id}`,
                  elementId: element.id,
                  type: element.animation.type,
                  duration: element.animation.duration,
                  delay: element.animation.delay,
                  easing: element.animation.easing,
                  direction: element.animation.direction
                })
              : element

            return (
              <div
                key={element.id}
                className={`slide-element ${!readOnly && selectedElement === element.id ? 'selected' : ''}`}
                style={{
                  left: animatedElement.x,
                  top: animatedElement.y,
                  width: animatedElement.width,
                  height: animatedElement.height,
                  position: 'absolute',
                  // For shapes and arrows, don't apply any styling to container - only to SVG content
                  ...(element.type === 'shape' || element.type === 'arrow' ? {} : animatedElement.style)
                }}
                onClick={!readOnly ? (e) => {
                  // Chart and audio elements handle their own clicks for selection
                  if (element.type !== 'chart' && element.type !== 'audio') {
                    handleElementClick(element.id, e)
                  }
                } : undefined}
                onMouseDown={!readOnly ? (e) => handleMouseDown(element.id, e) : undefined}
              >
              {element.type === 'text' && (
                <RichTextEditor
                  value={element.content || ''}
                  onChange={(value) => {
                    const updatedElements = displayElements.map(el =>
                      el.id === element.id ? { ...el, content: value } : el
                    )
                    onElementsChange?.(updatedElements)
                  }}
                  readOnly={selectedElement !== element.id}
                  placeholder="Click to edit text"
                />
              )}
              {element.type === 'shape' && (
                <ShapeRenderer
                  shapeType={(element as any).shapeType || 'rectangle'}
                  backgroundColor={element.style?.backgroundColor || '#1890ff'}
                  borderColor={element.style?.borderColor || '#000000'}
                  borderWidth={String(element.style?.borderWidth || '0px')}
                  width="100%"
                  height="100%"
                />
              )}
              {element.type === 'image' && (
                <img
                  src={element.content || '/placeholder-image.svg'}
                  alt="Slide image"
                  draggable="false"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: element.style?.borderRadius || '0px'
                  }}
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.src = '/placeholder-image.svg'
                  }}
                />
              )}
              {element.type === 'arrow' && (
                <ArrowRenderer
                  arrowType={(element as any).arrowType || 'straight'}
                  direction={(element as any).direction || 'right'}
                  color={element.style?.backgroundColor || '#000000'}
                  thickness={(element as any).arrowThickness || 4}
                  width="100%"
                  height="100%"
                />
              )}
              {element.type === 'chart' && (
                <ChartElement
                  data={element.data}
                  type={(element as any).chartType || 'bar'}
                  onDataChange={(data, type) => {
                    const updatedElements = displayElements.map(el =>
                      el.id === element.id
                        ? { ...el, data, chartType: type } as any
                        : el
                    )
                    onElementsChange?.(updatedElements)
                  }}
                  width={element.width}
                  height={element.height}
                  isDragging={selectedElement === element.id && isDragging}
                  isSelected={selectedElement === element.id}
                  onSelect={() => handleElementClick(element.id, {} as React.MouseEvent)}
                />
              )}
              {element.type === 'table' && (
                <TableElement
                  data={element.data}
                  onDataChange={(data) => {
                    const updatedElements = displayElements.map(el =>
                      el.id === element.id ? { ...el, data } : el
                    )
                    onElementsChange?.(updatedElements)
                  }}
                  width={element.width}
                  height={element.height}
                />
              )}
              {element.type === 'code' && (
                <CodeElement
                  content={element.content}
                  language={(element as any).language || 'javascript'}
                  theme={(element as any).codeTheme || 'dark'}
                  onContentChange={(content, language, theme) => {
                    const updatedElements = displayElements.map(el =>
                      el.id === element.id
                        ? { ...el, content, language, codeTheme: theme } as any
                        : el
                    )
                    onElementsChange?.(updatedElements)
                  }}
                  width={element.width}
                  height={element.height}
                />
              )}
              {element.type === 'quote' && (
                <QuoteElement
                  content={element.content}
                  onContentChange={(content) => {
                    const updatedElements = displayElements.map(el =>
                      el.id === element.id ? { ...el, content } : el
                    )
                    onElementsChange?.(updatedElements)
                  }}
                  style={element.style}
                />
              )}
              {element.type === 'divider' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.style?.backgroundColor || '#cccccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }} />
              )}
              {element.type === 'icon' && (
                <IconElement
                  icon={(element as any).iconType || 'star'}
                  color={(element as any).iconColor || '#1890ff'}
                  size={(element as any).iconSize || 48}
                  onIconChange={(icon, color, size) => {
                    const updatedElements = displayElements.map(el =>
                      el.id === element.id
                        ? { ...el, iconType: icon, iconColor: color, iconSize: size } as any
                        : el
                    )
                    onElementsChange?.(updatedElements)
                  }}
                />
              )}
              {element.type === 'link' && (
                <LinkElement
                  content={element.content}
                  href={(element as any).href}
                  openInNewTab={(element as any).openInNewTab}
                  onLinkChange={(content, href, openInNewTab) => {
                    const updatedElements = displayElements.map(el =>
                      el.id === element.id
                        ? { ...el, content, href, openInNewTab } as any
                        : el
                    )
                    onElementsChange?.(updatedElements)
                  }}
                  style={element.style}
                />
              )}
              {element.type === 'video' && (
                <VideoElement
                  src={element.content}
                  autoplay={(element as any).autoplay}
                  controls={(element as any).controls}
                  loop={(element as any).loop}
                  muted={(element as any).muted}
                  volume={(element as any).volume}
                  onVideoChange={(src, autoplay, controls, loop, muted, volume) => {
                    const updatedElements = displayElements.map(el =>
                      el.id === element.id
                        ? { ...el, content: src, autoplay, controls, loop, muted, volume } as any
                        : el
                    )
                    onElementsChange?.(updatedElements)
                  }}
                  style={element.style}
                />
              )}
              {element.type === 'audio' && (
                <AudioElement
                  src={element.content}
                  autoplay={(element as any).autoplay}
                  controls={(element as any).controls}
                  loop={(element as any).loop}
                  muted={(element as any).muted}
                  volume={(element as any).volume}
                  onAudioChange={(src, autoplay, controls, loop, muted, volume) => {
                    const updatedElements = displayElements.map(el =>
                      el.id === element.id
                        ? { ...el, content: src, autoplay, controls, loop, muted, volume } as any
                        : el
                    )
                    onElementsChange?.(updatedElements)
                  }}
                  style={element.style}
                  isSelected={selectedElement === element.id}
                  onSelect={() => handleElementClick(element.id, {} as React.MouseEvent)}
                />
              )}
              {element.type === 'diagram' && (
                <DiagramElement
                  data={element.data}
                  onDiagramChange={(data) => {
                    const updatedElements = displayElements.map(el =>
                      el.id === element.id ? { ...el, data } : el
                    )
                    onElementsChange?.(updatedElements)
                  }}
                  style={element.style}
                />
              )}

              {element.type === 'draw' && (
                <DrawElement
                  data={element.data}
                  onDrawChange={(data) => {
                    const updatedElements = displayElements.map(el =>
                      el.id === element.id ? { ...el, data } : el
                    )
                    onElementsChange?.(updatedElements)
                  }}
                  style={element.style}
                />
              )}
            </div>
          )})}
        </div>
      </div>
    </div>
  )
})

export { SlideCanvas }
