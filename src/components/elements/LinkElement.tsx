'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Switch, Space, Button } from 'antd'
import { LinkOutlined } from '@ant-design/icons'

interface LinkElementProps {
  content?: string
  href?: string
  openInNewTab?: boolean
  onLinkChange?: (content: string, href: string, openInNewTab: boolean) => void
  style?: React.CSSProperties
}

export function LinkElement({
  content: initialContent = 'Click here',
  href: initialHref = '',
  openInNewTab: initialOpenInNewTab = false,
  onLinkChange,
  style = {}
}: LinkElementProps) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [content, setContent] = useState(initialContent)
  const [href, setHref] = useState(initialHref)
  const [openInNewTab, setOpenInNewTab] = useState(initialOpenInNewTab)

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  useEffect(() => {
    setHref(initialHref)
  }, [initialHref])

  useEffect(() => {
    setOpenInNewTab(initialOpenInNewTab)
  }, [initialOpenInNewTab])

  const handleEditClick = () => {
    setIsModalVisible(true)
  }

  const handleModalOk = () => {
    onLinkChange?.(content, href, openInNewTab)
    setIsModalVisible(false)
  }

  const handleModalCancel = () => {
    setContent(initialContent)
    setHref(initialHref)
    setOpenInNewTab(initialOpenInNewTab)
    setIsModalVisible(false)
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    // Prevent the link from navigating during editing/preview
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        onDoubleClick={handleEditClick}
      >
        <a
          href={href || '#'}
          target={openInNewTab ? '_blank' : '_self'}
          rel={openInNewTab ? 'noopener noreferrer' : undefined}
          onClick={handleLinkClick}
          style={{
            color: style.color || '#1890ff',
            textDecoration: style.textDecoration || 'underline',
            fontSize: style.fontSize || '16px',
            fontWeight: style.fontWeight || 'normal',
            textAlign: style.textAlign || 'center',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          {content}
        </a>
      </div>

      <Modal
        title="Edit Link"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={500}
        okText="Save Link"
      >
        <Form layout="vertical">
          <Form.Item label="Link Text">
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter link text"
            />
          </Form.Item>

          <Form.Item label="URL">
            <Input
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="https://example.com"
              prefix={<LinkOutlined />}
            />
          </Form.Item>

          <Form.Item label="Open in New Tab">
            <Switch
              checked={openInNewTab}
              onChange={setOpenInNewTab}
              checkedChildren="Yes"
              unCheckedChildren="No"
            />
          </Form.Item>

          <div style={{ marginTop: 16, padding: '12px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
            <h4>Preview:</h4>
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  color: '#1890ff',
                  textDecoration: 'underline',
                  fontSize: '16px',
                  pointerEvents: 'none'
                }}
              >
                {content || 'Link Preview'}
              </a>
            </div>
          </div>
        </Form>
      </Modal>
    </>
  )
}
