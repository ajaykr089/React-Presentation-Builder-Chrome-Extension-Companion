'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'

// Dynamically import Froala Editor to avoid SSR issues
const FroalaEditorComponent = dynamic(() => import('react-froala-wysiwyg'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
})

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
}

export function RichTextEditor({ value, onChange, placeholder, readOnly = false }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          border: '1px dashed #d9d9d9',
          borderRadius: '4px'
        }}
      >
        Loading editor...
      </div>
    )
  }

  if (readOnly) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: '8px',
          cursor: 'pointer',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflow: 'hidden'
        }}
        dangerouslySetInnerHTML={{ __html: value || placeholder || 'Click to edit text' }}
      />
    )
  }

  const froalaConfig = {
    placeholderText: placeholder || 'Click to edit text',
    charCounterCount: false,
    toolbarInline: true,
    toolbarVisibleWithoutSelection: false,
    toolbarButtons: [
      'bold', 'italic', 'underline', 'strikeThrough',
      'color', 'fontSize', 'fontFamily',
      'align', 'formatOL', 'formatUL',
      'insertLink', 'insertHR'
    ],
    toolbarButtonsMD: [
      'bold', 'italic', 'underline', 'strikeThrough',
      'color', 'fontSize', 'fontFamily',
      'align', 'formatOL', 'formatUL',
      'insertLink', 'insertHR'
    ],
    toolbarButtonsSM: [
      'bold', 'italic', 'underline',
      'color', 'fontSize',
      'align', 'formatOL', 'formatUL'
    ],
    toolbarButtonsXS: [
      'bold', 'italic',
      'color', 'align'
    ],
    heightMin: 50,
    heightMax: 300,
    quickInsertTags: [],
    imageInsertButtons: [],
    videoInsertButtons: [],
    fileInsertButtons: [],
    paragraphFormat: {
      N: 'Normal',
      H1: 'Heading 1',
      H2: 'Heading 2',
      H3: 'Heading 3',
      H4: 'Heading 4',
      H5: 'Heading 5',
      H6: 'Heading 6'
    },
    paragraphFormatSelection: true,
    // Preserve line breaks and formatting
    enter: 'BR', // Use <br> tags instead of <p> for line breaks
    htmlUntouched: true, // Don't clean HTML on focus
    htmlRemoveTags: [], // Don't remove any tags
    htmlDoNotWrapTags: ['br'], // Don't wrap <br> tags
    fullPage: false, // Don't treat as full HTML page
    // Preserve whitespace and line breaks
    preserveLineBreaks: true,
    // Don't convert line breaks
    lineBreakerTags: ['br'],
    // Keep original HTML structure
    htmlExecuteScripts: false,
    // Events
    events: {
      'contentChanged': function() {
        // This will be handled by the onChange prop
      }
    }
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <FroalaEditorComponent
        tag="textarea"
        config={froalaConfig}
        model={value}
        onModelChange={onChange}
      />
    </div>
  )
}
