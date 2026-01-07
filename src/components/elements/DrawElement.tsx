'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Modal, Space, Button, Slider, ColorPicker } from 'antd'
import { ClearOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons'

interface DrawData {
  strokes: Array<{
    points: Array<{ x: number; y: number }>
    color: string
    width: number
    tool: 'pen' | 'eraser'
  }>
}

interface DrawElementProps {
  data?: DrawData
  onDrawChange?: (data: DrawData) => void
  style?: React.CSSProperties
}

export function DrawElement({
  data,
  onDrawChange,
  style = {}
}: DrawElementProps) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [drawData, setDrawData] = useState<DrawData>(data || { strokes: [] })
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentStroke, setCurrentStroke] = useState<Array<{ x: number; y: number }>>([])
  const [selectedTool, setSelectedTool] = useState<'pen' | 'eraser'>('pen')
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modalCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setDrawData(data || { strokes: [] })
  }, [data])

  const redrawCanvas = useCallback((canvas: HTMLCanvasElement, data: DrawData) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    data.strokes.forEach(stroke => {
      if (stroke.points.length < 2) return

      ctx.strokeStyle = stroke.tool === 'eraser' ? 'white' : stroke.color
      ctx.lineWidth = stroke.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over'

      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
      }

      ctx.stroke()
    })

    ctx.globalCompositeOperation = 'source-over'
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      redrawCanvas(canvasRef.current, drawData)
    }
  }, [drawData, redrawCanvas])

  useEffect(() => {
    if (modalCanvasRef.current) {
      redrawCanvas(modalCanvasRef.current, drawData)
    }
  }, [drawData, redrawCanvas])

  const handleEditClick = () => {
    setIsModalVisible(true)
  }

  const handleModalOk = () => {
    onDrawChange?.(drawData)
    setIsModalVisible(false)
  }

  const handleModalCancel = () => {
    setDrawData(data || { strokes: [] })
    setIsModalVisible(false)
  }

  const getCanvasCoordinates = (canvas: HTMLCanvasElement, e: React.MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation() // Prevent event bubbling that might cause element dragging
    const canvas = e.currentTarget
    const { x, y } = getCanvasCoordinates(canvas, e)

    setIsDrawing(true)
    setCurrentStroke([{ x, y }])
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation() // Prevent event bubbling
    if (!isDrawing) return

    const canvas = e.currentTarget
    const { x, y } = getCanvasCoordinates(canvas, e)

    setCurrentStroke(prev => [...prev, { x, y }])

    // Draw current stroke in real-time
    const ctx = canvas.getContext('2d')
    if (ctx && currentStroke.length > 0) {
      const lastPoint = currentStroke[currentStroke.length - 1]
      ctx.strokeStyle = selectedTool === 'eraser' ? 'white' : selectedColor
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalCompositeOperation = selectedTool === 'eraser' ? 'destination-out' : 'source-over'

      ctx.beginPath()
      ctx.moveTo(lastPoint.x, lastPoint.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation() // Prevent event bubbling
    if (isDrawing && currentStroke.length > 0) {
      const newStroke = {
        points: [...currentStroke],
        color: selectedColor,
        width: strokeWidth,
        tool: selectedTool
      }

      setDrawData(prev => ({
        ...prev,
        strokes: [...prev.strokes, newStroke]
      }))
    }

    setIsDrawing(false)
    setCurrentStroke([])
  }

  const clearCanvas = () => {
    setDrawData({ strokes: [] })
    const canvas = modalCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const hasDrawing = drawData.strokes.length > 0

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer'
        }}
        onDoubleClick={handleEditClick}
      >
        {hasDrawing ? (
          <canvas
            ref={canvasRef}
            width={300}
            height={200}
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              border: '2px dashed #ccc',
              borderRadius: '4px',
              padding: '8px'
            }}
          >
            <div style={{
              fontSize: '24px',
              marginBottom: '4px',
              textAlign: 'center'
            }}>
              ✏️
            </div>
            <div style={{
              fontSize: '10px',
              color: '#666',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              Double-click to start drawing
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Draw Canvas"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
        okText="Save Drawing"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div>
              <Button
                type={selectedTool === 'pen' ? 'primary' : 'default'}
                onClick={() => setSelectedTool('pen')}
                style={{ marginRight: 8 }}
              >
                ✏️ Pen
              </Button>
              <Button
                type={selectedTool === 'eraser' ? 'primary' : 'default'}
                onClick={() => setSelectedTool('eraser')}
              >
                🧽 Eraser
              </Button>
            </div>

            <div>
              <span style={{ marginRight: 8 }}>Color:</span>
              <ColorPicker
                value={selectedColor}
                onChange={(color) => setSelectedColor(color.toHexString())}
                showText
              />
            </div>

            <div style={{ width: 120 }}>
              <span style={{ marginRight: 8 }}>Size:</span>
              <Slider
                value={strokeWidth}
                onChange={setStrokeWidth}
                min={1}
                max={20}
                style={{ width: 60, display: 'inline-block', marginLeft: 8 }}
              />
            </div>

            <Button danger onClick={clearCanvas}>
              <ClearOutlined /> Clear
            </Button>
          </div>

          <div style={{
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            padding: '16px',
            backgroundColor: '#f9f9f9'
          }}>
            <canvas
              ref={modalCanvasRef}
              width={600}
              height={400}
              style={{
                width: '100%',
                height: '400px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: selectedTool === 'eraser' ? 'crosshair' : 'crosshair'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
            Click and drag to draw. Use the pen tool to draw and eraser to remove.
          </div>
        </Space>
      </Modal>
    </>
  )
}
