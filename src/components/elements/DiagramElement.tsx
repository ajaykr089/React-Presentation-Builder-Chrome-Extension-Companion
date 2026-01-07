'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Modal, Form, Input, Select, Space, Button, ColorPicker, Card } from 'antd'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'

interface DiagramNode {
  id: string
  type: 'rectangle' | 'circle' | 'diamond'
  x: number
  y: number
  width: number
  height: number
  text: string
  color: string
}

interface DiagramConnection {
  id: string
  fromId: string
  toId: string
  text?: string
}

interface DiagramData {
  nodes: DiagramNode[]
  connections: DiagramConnection[]
}

interface DiagramElementProps {
  data?: DiagramData
  onDiagramChange?: (data: DiagramData) => void
  style?: React.CSSProperties
}

const nodeTypes = [
  { value: 'rectangle', label: 'Rectangle', shape: 'rectangle' },
  { value: 'circle', label: 'Circle', shape: 'circle' },
  { value: 'diamond', label: 'Diamond', shape: 'diamond' }
]

export function DiagramElement({
  data,
  onDiagramChange,
  style = {}
}: DiagramElementProps) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [diagramData, setDiagramData] = useState<DiagramData>(data || { nodes: [], connections: [] })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<string | null>(null)
  const [isDraggingNode, setIsDraggingNode] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDiagramData(data || { nodes: [], connections: [] })
  }, [data])

  const handleEditClick = () => {
    setIsModalVisible(true)
  }

  const handleModalOk = () => {
    onDiagramChange?.(diagramData)
    setIsModalVisible(false)
  }

  const handleModalCancel = () => {
    setDiagramData(data || { nodes: [], connections: [] })
    setIsModalVisible(false)
  }

  const addNode = (type: 'rectangle' | 'circle' | 'diamond') => {
    const newNode: DiagramNode = {
      id: `node-${Date.now()}`,
      type,
      x: Math.random() * 200 + 50,
      y: Math.random() * 100 + 50,
      width: 80,
      height: 50,
      text: `Node ${diagramData.nodes.length + 1}`,
      color: '#1890ff'
    }
    setDiagramData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }))
  }

  const updateNode = (nodeId: string, updates: Partial<DiagramNode>) => {
    setDiagramData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }))
  }

  const deleteNode = (nodeId: string) => {
    setDiagramData(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn => conn.fromId !== nodeId && conn.toId !== nodeId)
    }))
  }

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isConnecting) {
      handleNodeClick(nodeId)
      return
    }

    setIsDraggingNode(true)
    setSelectedNodeId(nodeId)
    const node = diagramData.nodes.find(n => n.id === nodeId)
    if (node) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left - node.x,
          y: e.clientY - rect.top - node.y
        })
      }
    }
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingNode || !selectedNodeId || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset.x
    const y = e.clientY - rect.top - dragOffset.y

    updateNode(selectedNodeId, { x: Math.max(0, x), y: Math.max(0, y) })
  }, [isDraggingNode, selectedNodeId, dragOffset, updateNode])

  const handleMouseUp = useCallback(() => {
    setIsDraggingNode(false)
  }, [])

  const handleNodeClick = (nodeId: string) => {
    if (isConnecting) {
      if (connectionStart && connectionStart !== nodeId) {
        // Create connection
        const newConnection: DiagramConnection = {
          id: `conn-${Date.now()}`,
          fromId: connectionStart,
          toId: nodeId
        }
        setDiagramData(prev => ({
          ...prev,
          connections: [...prev.connections, newConnection]
        }))
        setIsConnecting(false)
        setConnectionStart(null)
      } else {
        setConnectionStart(nodeId)
      }
    } else {
      setSelectedNodeId(nodeId)
    }
  }

  const renderNode = (node: DiagramNode) => {
    const isSelected = selectedNodeId === node.id
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: node.x,
      top: node.y,
      width: node.width,
      height: node.height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: isConnecting ? 'crosshair' : 'pointer',
      border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
      backgroundColor: node.color,
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold',
      textAlign: 'center',
      userSelect: 'none'
    }

    let shapeStyle: React.CSSProperties = {}

    if (node.type === 'circle') {
      shapeStyle.borderRadius = '50%'
    } else if (node.type === 'diamond') {
      shapeStyle.transform = 'rotate(45deg)'
      shapeStyle.width = node.height
      shapeStyle.height = node.width
    }

    return (
      <div
        key={node.id}
        style={{ ...baseStyle, ...shapeStyle }}
        onClick={() => handleNodeClick(node.id)}
      >
        <span style={node.type === 'diamond' ? { transform: 'rotate(-45deg)' } : {}}>
          {node.text}
        </span>
      </div>
    )
  }

  const renderConnection = (connection: DiagramConnection) => {
    const fromNode = diagramData.nodes.find(n => n.id === connection.fromId)
    const toNode = diagramData.nodes.find(n => n.id === connection.toId)

    if (!fromNode || !toNode) return null

    const fromX = fromNode.x + fromNode.width / 2
    const fromY = fromNode.y + fromNode.height / 2
    const toX = toNode.x + toNode.width / 2
    const toY = toNode.y + toNode.height / 2

    const length = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2)
    const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI

    return (
      <div
        key={connection.id}
        style={{
          position: 'absolute',
          left: fromX,
          top: fromY,
          width: length,
          height: 2,
          backgroundColor: '#666',
          transform: `rotate(${angle}deg)`,
          transformOrigin: '0 50%',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -5,
            top: -4,
            width: 0,
            height: 0,
            borderLeft: '5px solid #666',
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent'
          }}
        />
      </div>
    )
  }

  const hasDiagram = diagramData.nodes.length > 0

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
        {hasDiagram ? (
          <div
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              backgroundColor: '#f9f9f9',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            {diagramData.connections.map(renderConnection)}
            {diagramData.nodes.map(renderNode)}
          </div>
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
              🔄
            </div>
            <div style={{
              fontSize: '10px',
              color: '#666',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              Double-click to create diagram
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Edit Diagram"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText="Save Diagram"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Button onClick={() => addNode('rectangle')} style={{ marginRight: 8 }}>
              <PlusOutlined /> Add Rectangle
            </Button>
            <Button onClick={() => addNode('circle')} style={{ marginRight: 8 }}>
              <PlusOutlined /> Add Circle
            </Button>
            <Button onClick={() => addNode('diamond')} style={{ marginRight: 8 }}>
              <PlusOutlined /> Add Diamond
            </Button>
            <Button
              onClick={() => setIsConnecting(!isConnecting)}
              type={isConnecting ? 'primary' : 'default'}
              style={{ marginRight: 8 }}
            >
              {isConnecting ? 'Cancel Connect' : 'Connect Nodes'}
            </Button>
            {selectedNodeId && (
              <Button danger onClick={() => deleteNode(selectedNodeId)}>
                <MinusOutlined /> Delete Selected
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{
              flex: 1,
              height: '400px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              position: 'relative',
              backgroundColor: '#f9f9f9',
              cursor: isDraggingNode ? 'grabbing' : 'default'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            >
              <div style={{
                position: 'absolute',
                top: 10,
                left: 10,
                fontSize: '12px',
                color: '#666',
                background: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}>
                {isConnecting ? 'Click nodes to connect' : isDraggingNode ? 'Dragging node...' : 'Click nodes to select'}
              </div>

              {diagramData.connections.map(renderConnection)}
              {diagramData.nodes.map(node => {
                const isSelected = selectedNodeId === node.id
                const baseStyle: React.CSSProperties = {
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  height: node.height,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isConnecting ? 'crosshair' : isDraggingNode && isSelected ? 'grabbing' : 'pointer',
                  border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  backgroundColor: node.color,
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  userSelect: 'none'
                }

                let shapeStyle: React.CSSProperties = {}

                if (node.type === 'circle') {
                  shapeStyle.borderRadius = '50%'
                } else if (node.type === 'diamond') {
                  shapeStyle.transform = 'rotate(45deg)'
                  shapeStyle.width = node.height
                  shapeStyle.height = node.width
                }

                return (
                  <div
                    key={node.id}
                    style={{ ...baseStyle, ...shapeStyle }}
                    onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                    onClick={() => !isDraggingNode && handleNodeClick(node.id)}
                  >
                    <span style={node.type === 'diamond' ? { transform: 'rotate(-45deg)' } : {}}>
                      {node.text}
                    </span>
                  </div>
                )
              })}
            </div>

            <div style={{ width: '250px' }}>
              {selectedNodeId && (
                <Card title="Selected Node" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item label="Text">
                      <Input
                        value={diagramData.nodes.find(n => n.id === selectedNodeId)?.text || ''}
                        onChange={(e) => updateNode(selectedNodeId, { text: e.target.value })}
                        placeholder="Node text"
                      />
                    </Form.Item>

                    <Form.Item label="Type">
                      <Select
                        value={diagramData.nodes.find(n => n.id === selectedNodeId)?.type || 'rectangle'}
                        onChange={(value: 'rectangle' | 'circle' | 'diamond') => updateNode(selectedNodeId, { type: value })}
                      >
                        {nodeTypes.map(type => (
                          <Select.Option key={type.value} value={type.value}>
                            {type.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item label="Color">
                      <ColorPicker
                        value={diagramData.nodes.find(n => n.id === selectedNodeId)?.color || '#1890ff'}
                        onChange={(color) => updateNode(selectedNodeId, { color: color.toHexString() })}
                        showText
                      />
                    </Form.Item>
                  </Space>
                </Card>
              )}

              <Card title="Diagram Info" size="small" style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <div>Nodes: {diagramData.nodes.length}</div>
                  <div>Connections: {diagramData.connections.length}</div>
                </div>
              </Card>
            </div>
          </div>
        </Space>
      </Modal>
    </>
  )
}
