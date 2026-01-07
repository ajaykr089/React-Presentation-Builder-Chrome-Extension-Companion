'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Modal, Form, Input, Switch, Space, Button, Slider } from 'antd'
import { VideoCameraOutlined } from '@ant-design/icons'

interface VideoElementProps {
  src?: string
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
  volume?: number
  onVideoChange?: (src: string, autoplay: boolean, controls: boolean, loop: boolean, muted: boolean, volume: number) => void
  style?: React.CSSProperties
}

export function VideoElement({
  src,
  autoplay = false,
  controls = true,
  loop = false,
  muted = false,
  volume = 1,
  onVideoChange,
  style = {}
}: VideoElementProps) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [videoSrc, setVideoSrc] = useState(src || '')
  const [videoAutoplay, setVideoAutoplay] = useState(autoplay)
  const [videoControls, setVideoControls] = useState(controls)
  const [videoLoop, setVideoLoop] = useState(loop)
  const [videoMuted, setVideoMuted] = useState(muted)
  const [videoVolume, setVideoVolume] = useState(volume)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setVideoSrc(src || '')
  }, [src])

  useEffect(() => {
    setVideoAutoplay(autoplay)
  }, [autoplay])

  useEffect(() => {
    setVideoControls(controls)
  }, [controls])

  useEffect(() => {
    setVideoLoop(loop)
  }, [loop])

  useEffect(() => {
    setVideoMuted(muted)
  }, [muted])

  useEffect(() => {
    setVideoVolume(volume)
  }, [volume])

  const handleEditClick = () => {
    setIsModalVisible(true)
  }

  const handleModalOk = () => {
    onVideoChange?.(videoSrc, videoAutoplay, videoControls, videoLoop, videoMuted, videoVolume)
    setIsModalVisible(false)
  }

  const handleModalCancel = () => {
    setVideoSrc(src || '')
    setVideoAutoplay(autoplay)
    setVideoControls(controls)
    setVideoLoop(loop)
    setVideoMuted(muted)
    setVideoVolume(volume)
    setIsModalVisible(false)
  }

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const hasVideo = videoSrc.trim().length > 0

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
        {hasVideo ? (
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay={videoAutoplay}
            controls={videoControls}
            loop={videoLoop}
            muted={videoMuted}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: '#000000',
              borderRadius: style.borderRadius || '4px'
            }}
            onClick={handleVideoClick}
            onLoadedData={() => {
              if (videoRef.current) {
                videoRef.current.volume = videoVolume
              }
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
              🎥
            </div>
            <div style={{
              fontSize: '10px',
              color: '#666',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              Double-click to add video
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Edit Video"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={500}
        okText="Save Video"
      >
        <Form layout="vertical">
          <Form.Item label="Video URL">
            <Input
              value={videoSrc}
              onChange={(e) => setVideoSrc(e.target.value)}
              placeholder="Enter video URL (MP4, WebM, OGV)"
              prefix={<VideoCameraOutlined />}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Supported formats: MP4, WebM, OGV. You can use local files or URLs.
            </div>
          </Form.Item>

          <Form.Item label="Autoplay">
            <Switch
              checked={videoAutoplay}
              onChange={setVideoAutoplay}
              checkedChildren="On"
              unCheckedChildren="Off"
            />
          </Form.Item>

          <Form.Item label="Show Controls">
            <Switch
              checked={videoControls}
              onChange={setVideoControls}
              checkedChildren="Yes"
              unCheckedChildren="No"
            />
          </Form.Item>

          <Form.Item label="Loop Video">
            <Switch
              checked={videoLoop}
              onChange={setVideoLoop}
              checkedChildren="On"
              unCheckedChildren="Off"
            />
          </Form.Item>

          <Form.Item label="Start Muted">
            <Switch
              checked={videoMuted}
              onChange={setVideoMuted}
              checkedChildren="Yes"
              unCheckedChildren="No"
            />
          </Form.Item>

          {!videoMuted && (
            <Form.Item label={`Volume: ${(videoVolume * 100).toFixed(0)}%`}>
              <Slider
                value={videoVolume}
                onChange={setVideoVolume}
                min={0}
                max={1}
                step={0.1}
                tooltip={{ formatter: (value) => value !== undefined ? `${(value * 100).toFixed(0)}%` : '0%' }}
              />
            </Form.Item>
          )}

          {videoSrc && (
            <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
              <h4>Preview:</h4>
              <video
                src={videoSrc}
                controls
                muted
                style={{
                  width: '100%',
                  maxHeight: '200px',
                  backgroundColor: '#000000',
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
