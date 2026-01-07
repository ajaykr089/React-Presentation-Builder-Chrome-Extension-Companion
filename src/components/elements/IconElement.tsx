'use client'

import React, { useState } from 'react'
import { Modal, Select, ColorPicker, Space, Button } from 'antd'
import { SettingOutlined } from '@ant-design/icons'

interface IconElementProps {
  icon?: string
  color?: string
  size?: number
  onIconChange?: (icon: string, color: string, size: number) => void
}

const iconOptions = [
  { value: 'star', label: 'Star', svg: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { value: 'heart', label: 'Heart', svg: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
  { value: 'check', label: 'Check', svg: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' },
  { value: 'arrow-right', label: 'Arrow Right', svg: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z' },
  { value: 'home', label: 'Home', svg: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
  { value: 'user', label: 'User', svg: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
  { value: 'settings', label: 'Settings', svg: 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z' },
  { value: 'search', label: 'Search', svg: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' },
  { value: 'bell', label: 'Bell', svg: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z' },
  { value: 'camera', label: 'Camera', svg: 'M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm7-5h-1.17l-2.02-2.02C15.42 4.5 14.74 4 14 4h-4c-.74 0-1.42.5-1.81 1.25L6.17 7H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z' },
  { value: 'phone', label: 'Phone', svg: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z' },
  { value: 'mail', label: 'Mail', svg: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' },
  { value: 'calendar', label: 'Calendar', svg: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z' },
  { value: 'clock', label: 'Clock', svg: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z' },
  { value: 'location', label: 'Location', svg: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' },
  { value: 'download', label: 'Download', svg: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z' },
  { value: 'upload', label: 'Upload', svg: 'M5 4v3h5.5v12h3V7H19V4z' },
  { value: 'trash', label: 'Trash', svg: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' },
  { value: 'edit', label: 'Edit', svg: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z' },
  { value: 'share', label: 'Share', svg: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z' },
  { value: 'bookmark', label: 'Bookmark', svg: 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z' },
  { value: 'filter', label: 'Filter', svg: 'M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z' },
  { value: 'menu', label: 'Menu', svg: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z' },
  { value: 'grid', label: 'Grid', svg: 'M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z' },
  { value: 'list', label: 'List', svg: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z' },
  { value: 'plus', label: 'Plus', svg: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' },
  { value: 'minus', label: 'Minus', svg: 'M19 13H5v-2h14v2z' },
  { value: 'close', label: 'Close', svg: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' },
  { value: 'expand', label: 'Expand', svg: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z' },
  { value: 'compress', label: 'Compress', svg: 'M8 19h3v3h2v-5H8v2zm5-14H9V0H7v5h6V3zm-5 7h2v2h3v3h2v-5H8v-2zM3 9h2V6H3V5h5v2H5v2H3V9zm12 8h2v-2h-2v-3h-2v5h3v-2z' }
]

export function IconElement({
  icon = 'star',
  color = '#1890ff',
  size = 48,
  onIconChange
}: IconElementProps) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState(icon)
  const [selectedColor, setSelectedColor] = useState(color)
  const [selectedSize, setSelectedSize] = useState(size)

  const currentIcon = iconOptions.find(opt => opt.value === selectedIcon) || iconOptions[0]

  const handleEditClick = () => {
    setIsModalVisible(true)
  }

  const handleModalOk = () => {
    onIconChange?.(selectedIcon, selectedColor, selectedSize)
    setIsModalVisible(false)
  }

  const handleModalCancel = () => {
    setSelectedIcon(icon)
    setSelectedColor(color)
    setSelectedSize(size)
    setIsModalVisible(false)
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
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={selectedColor}
          style={{ display: 'block' }}
        >
          <path d={currentIcon.svg} />
        </svg>
      </div>

      <Modal
        title="Edit Icon"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={500}
        okText="Save Icon"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Icon
            </label>
            <Select
              value={selectedIcon}
              onChange={setSelectedIcon}
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false
              }
            >
              {iconOptions.map(icon => (
                <Select.Option key={icon.value} value={icon.value}>
                  {icon.label}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Color
            </label>
            <ColorPicker
              value={selectedColor}
              onChange={(color) => setSelectedColor(color.toHexString())}
              showText
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Size: {selectedSize}px
            </label>
            <input
              type="range"
              min="16"
              max="128"
              value={selectedSize}
              onChange={(e) => setSelectedSize(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
            <h4>Preview:</h4>
            <svg
              width={selectedSize}
              height={selectedSize}
              viewBox="0 0 24 24"
              fill={selectedColor}
              style={{ display: 'block', margin: '0 auto' }}
            >
              <path d={iconOptions.find(opt => opt.value === selectedIcon)?.svg || iconOptions[0].svg} />
            </svg>
          </div>
        </Space>
      </Modal>
    </>
  )
}
