'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Modal, Form, Input, Switch, Space, Button, Slider } from 'antd'
import { AudioOutlined } from '@ant-design/icons'

interface AudioElementProps {
  src?: string
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
  volume?: number
  onAudioChange?: (src: string, autoplay: boolean, controls: boolean, loop: boolean, muted: boolean, volume: number) => void
  style?: React.CSSProperties
  isSelected?: boolean
  onSelect?: () => void
}

export function AudioElement({
  src,
  autoplay = false,
  controls = true,
  loop = false,
  muted = false,
  volume = 1,
  onAudioChange,
  style = {}
}: AudioElementProps) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [audioSrc, setAudioSrc] = useState(src || '')
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    setAudioSrc(src || '')
  }, [src])

  const handleEditClick = () => {
    setIsModalVisible(true)
  }

  const handleModalOk = () => {
    onAudioChange?.(audioSrc, autoplay, controls, loop, muted, volume)
    setIsModalVisible(false)
  }

  const handleModalCancel = () => {
    setAudioSrc(src || '')
    setIsModalVisible(false)
  }

  const handleAudioMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'AUDIO' || target.closest('audio')) {
      e.stopPropagation()
    }
  }

  const hasAudio = audioSrc.trim().length > 0

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer'
        }}
        onDoubleClick={handleEditClick}
        onMouseDown={handleAudioMouseDown}
      >
        {hasAudio ? (
          <audio
            ref={audioRef}
            src={audioSrc}
            controls
            style={{
              width: '100%',
              height: '100%',
              minHeight: '40px',
              backgroundColor: '#f5f5f5',
              borderRadius: style.borderRadius || '4px'
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
              🎵
            </div>
            <div style={{
              fontSize: '10px',
              color: '#666',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              Double-click to add audio
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Edit Audio"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={500}
        okText="Save Audio"
      >
        <Form layout="vertical">
          <Form.Item label="Upload Local Audio">
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    const dataUrl = event.target?.result as string
                    setAudioSrc(dataUrl)
                  }
                  reader.readAsDataURL(file)
                }
              }}
              style={{
                width: '100%',
                padding: '4px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px'
              }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Select an audio file from your computer (MP3, WAV, OGG, etc.)
            </div>
          </Form.Item>

          <Form.Item label="Or Enter Audio URL">
            <Input
              value={audioSrc.startsWith('data:') ? '' : audioSrc}
              onChange={(e) => setAudioSrc(e.target.value)}
              placeholder="https://example.com/audio.mp3"
              prefix={<AudioOutlined />}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Paste a URL for an audio file hosted online, or use the file upload above
            </div>
          </Form.Item>

          {audioSrc && !audioSrc.startsWith('data:') && (
            <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
              <h4>Preview:</h4>
              <audio
                src={audioSrc}
                controls
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px'
                }}
              />
            </div>
          )}
        </Form>
      </Modal>
    </>
  )
}
