'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, Typography } from 'antd'
import { SlideElement, SlideTemplate, Theme } from '@/types/presentation'
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
}

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

export function SlideCanvas({
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
  backgroundColor = '#ffffff',
  template,
  theme,
  elements: externalElements = [],
  onElementsChange,
  onElementSelect
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
  }, [selectedElement, displayElements, onElementSelect])

  const handleElementClick = useCallback((elementId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const element = displayElements.find(el => el.id === elementId)
    if (element && onElementSelect) {
      onElementSelect(element)
    }
    setSelectedElement(elementId)
  }, [displayElements, onElementSelect])

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
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card
        style={{
          width: width + 48,
          margin: '0 auto',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
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
          {displayElements.map((element) => (
            <div
              key={element.id}
              className={`slide-element ${selectedElement === element.id ? 'selected' : ''}`}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                position: 'absolute',
                ...element.style
              }}
              onClick={(e) => handleElementClick(element.id, e)}
              onMouseDown={(e) => handleMouseDown(element.id, e)}
            >
              {element.type === 'text' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {element.content}
                </div>
              )}
              {element.type === 'shape' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.style?.backgroundColor || '#1890ff',
                  borderRadius: element.style?.borderRadius || '0px'
                }} />
              )}
              {element.type === 'image' && (
                <img
                  src={element.content || '/placeholder-image.svg'}
                  alt="Slide image"
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
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.style?.backgroundColor || '#000000',
                  clipPath: 'polygon(0% 50%, 85% 0%, 85% 35%, 100% 50%, 85% 65%, 85% 100%)',
                }} />
              )}
              {element.type === 'chart' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.style?.backgroundColor || '#f5f5f5',
                  border: element.style?.border || '2px dashed #ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: element.style?.fontSize || '14px',
                  color: element.style?.color || '#999'
                }}>
                  📊
                </div>
              )}
              {element.type === 'table' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.style?.backgroundColor || '#f5f5f5',
                  border: element.style?.border || '2px dashed #ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: element.style?.fontSize || '14px',
                  color: element.style?.color || '#999'
                }}>
                  📋
                </div>
              )}
              {element.type === 'code' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.style?.backgroundColor || '#f6f8fa',
                  border: element.style?.border || '1px solid #e1e4e8',
                  fontFamily: element.style?.fontFamily || 'monospace',
                  fontSize: element.style?.fontSize || '12px',
                  padding: element.style?.padding || '8px',
                  color: element.style?.color || '#24292e',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto'
                }}>
                  {element.content || 'console.log("Hello World");'}
                </div>
              )}
              {element.type === 'quote' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: element.style?.fontSize || '18px',
                  fontStyle: element.style?.fontStyle || 'italic',
                  color: element.style?.color || '#666666',
                  textAlign: element.style?.textAlign || 'center',
                  padding: '16px'
                }}>
                  "{element.content || 'This is a quote'}"
                </div>
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
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: element.style?.fontSize || '24px'
                }}>
                  {element.content || '⭐'}
                </div>
              )}
              {element.type === 'link' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: element.style?.color || '#1890ff',
                  textDecoration: element.style?.textDecoration || 'underline',
                  cursor: 'pointer',
                  fontSize: element.style?.fontSize || '16px'
                }}>
                  {element.content || 'Click here'}
                </div>
              )}
              {element.type === 'video' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.style?.backgroundColor || '#000000',
                  color: element.style?.color || '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: element.style?.fontSize || '14px'
                }}>
                  🎥
                </div>
              )}
              {element.type === 'audio' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.style?.backgroundColor || '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: element.style?.fontSize || '12px',
                  color: element.style?.color || '#666'
                }}>
                  🎵
                </div>
              )}
              {element.type === 'diagram' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.style?.backgroundColor || '#f5f5f5',
                  border: element.style?.border || '2px dashed #ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: element.style?.fontSize || '14px',
                  color: element.style?.color || '#999'
                }}>
                  🔄
                </div>
              )}
              {element.type === 'form' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.style?.backgroundColor || '#f9f9f9',
                  border: element.style?.border || '1px solid #e1e4e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: element.style?.fontSize || '14px',
                  color: element.style?.color || '#666'
                }}>
                  📝
                </div>
              )}
              {element.type === 'draw' && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.style?.backgroundColor || '#ffffff',
                  border: element.style?.border || '2px solid #cccccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: element.style?.fontSize || '14px',
                  color: element.style?.color || '#999'
                }}>
                  ✏️
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
