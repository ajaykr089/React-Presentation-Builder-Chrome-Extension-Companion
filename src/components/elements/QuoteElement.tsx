'use client'

import React, { useState, useRef, useEffect } from 'react'

interface QuoteElementProps {
  content?: string
  onContentChange?: (content: string) => void
  style?: React.CSSProperties
}

export function QuoteElement({
  content: initialContent = 'This is a quote',
  onContentChange,
  style = {}
}: QuoteElementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(initialContent)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true)
      setTimeout(() => {
        textareaRef.current?.focus()
        textareaRef.current?.setSelectionRange(content.length, content.length)
      }, 0)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    onContentChange?.(content)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleBlur()
    }
    if (e.key === 'Escape') {
      setContent(initialContent)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          height: '100%',
          border: '2px solid #1890ff',
          borderRadius: '6px',
          padding: '16px',
          fontSize: style.fontSize || '18px',
          fontStyle: style.fontStyle || 'italic',
          color: style.color || '#666666',
          textAlign: style.textAlign || 'center',
          backgroundColor: 'white',
          resize: 'none',
          outline: 'none',
          fontFamily: 'inherit'
        }}
        placeholder="Enter your quote..."
      />
    )
  }

  return (
    <div
      onClick={handleClick}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: style.fontSize || '18px',
        fontStyle: style.fontStyle || 'italic',
        color: style.color || '#666666',
        textAlign: style.textAlign || 'center',
        padding: '16px',
        cursor: 'pointer',
        border: '1px dashed transparent',
        borderRadius: '4px',
        transition: 'border-color 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#d9d9d9'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'transparent'
      }}
    >
      "{content}"
    </div>
  )
}
