'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button, Progress } from 'antd'
import { LeftOutlined, RightOutlined, CloseOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons'
import { SlideElement, Theme } from '@/types/presentation'
import { SlideCanvas } from '@/components/canvas/SlideCanvas'

interface PresentationPreviewProps {
  slides: Array<{
    id: string
    elements: SlideElement[]
    backgroundColor?: string
    transition?: {
      type: 'fade' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'zoom' | 'rotate'
      duration: number
      easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
    }
  }>
  theme: Theme
  onClose: () => void
}

export function PresentationPreview({ slides, theme, onClose }: PresentationPreviewProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward')

  const currentSlide = slides[currentSlideIndex] || { elements: [], backgroundColor: '#ffffff' }

  const getTransitionClass = () => {
    if (!isTransitioning) return ''

    // Use slide-specific transition or default to fade
    const transition = currentSlide.transition
    if (!transition) return 'slide-transition-fade'

    switch (transition.type) {
      case 'fade':
        return 'slide-transition-fade'
      case 'slideLeft':
        return transitionDirection === 'forward' ? 'slide-transition-slide-out-left' : 'slide-transition-slide-in-left'
      case 'slideRight':
        return transitionDirection === 'forward' ? 'slide-transition-slide-out-right' : 'slide-transition-slide-in-right'
      case 'slideUp':
        return transitionDirection === 'forward' ? 'slide-transition-slide-out-up' : 'slide-transition-slide-in-up'
      case 'slideDown':
        return transitionDirection === 'forward' ? 'slide-transition-slide-out-down' : 'slide-transition-slide-in-down'
      case 'zoom':
        return transitionDirection === 'forward' ? 'slide-transition-zoom-out' : 'slide-transition-zoom-in'
      case 'rotate':
        return transitionDirection === 'forward' ? 'slide-transition-rotate-out' : 'slide-transition-rotate-in'
      default:
        return 'slide-transition-fade'
    }
  }

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1 && !isTransitioning) {
      setIsTransitioning(true)
      setTransitionDirection('forward')
      setTimeout(() => {
        setCurrentSlideIndex(currentSlideIndex + 1)
        setTimeout(() => setIsTransitioning(false), 300) // Match transition duration
      }, 150) // Half of transition duration for smooth effect
    }
  }, [currentSlideIndex, slides.length, isTransitioning])

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0 && !isTransitioning) {
      setIsTransitioning(true)
      setTransitionDirection('backward')
      setTimeout(() => {
        setCurrentSlideIndex(currentSlideIndex - 1)
        setTimeout(() => setIsTransitioning(false), 300) // Match transition duration
      }, 150) // Half of transition duration for smooth effect
    }
  }, [currentSlideIndex, isTransitioning])

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index)
    }
  }, [slides.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault()
          nextSlide()
          break
        case 'ArrowLeft':
        case 'Backspace':
          e.preventDefault()
          prevSlide()
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            toggleFullscreen()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [nextSlide, prevSlide, onClose])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (slides.length === 0) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <h2>No slides to preview</h2>
          <Button onClick={onClose} style={{ marginTop: '20px' }}>
            Close Preview
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with controls */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 10001
      }}>
        <div style={{ color: 'white', fontSize: '14px' }}>
          Slide {currentSlideIndex + 1} of {slides.length}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            style={{ color: 'white' }}
            size="small"
          />
          <Button
            type="text"
            icon={<RightOutlined />}
            onClick={nextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            style={{ color: 'white' }}
            size="small"
          />
          <Button
            type="text"
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={toggleFullscreen}
            style={{ color: 'white' }}
            size="small"
          />
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            style={{ color: 'white' }}
            size="small"
          />
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        zIndex: 10001
      }}>
        <Progress
          percent={(currentSlideIndex + 1) / slides.length * 100}
          showInfo={false}
          strokeColor="#1890ff"
          railColor="transparent"
          style={{ margin: 0 }}
        />
      </div>

      {/* Slide content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px 24px 20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          height: '100%',
          maxHeight: '675px', // 16:9 aspect ratio
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}
        className={getTransitionClass()}>
          <SlideCanvas
            width={1200}
            height={675}
            backgroundColor={currentSlide.backgroundColor || '#ffffff'}
            theme={theme}
            elements={currentSlide.elements}
            readOnly={true}
          />
        </div>
      </div>

      {/* Navigation hint */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '12px',
        textAlign: 'center'
      }}>
        Use arrow keys or spacebar to navigate • Press Escape to exit
      </div>
    </div>
  )
}
