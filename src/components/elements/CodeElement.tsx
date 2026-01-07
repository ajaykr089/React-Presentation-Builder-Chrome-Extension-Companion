'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, Select } from 'antd'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeElementProps {
  content?: string
  language?: string
  theme?: 'light' | 'dark'
  onContentChange?: (content: string, language: string, theme: string) => void
  width?: number
  height?: number
}

const supportedLanguages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' }
]

export function CodeElement({
  content: initialContent,
  language: initialLanguage,
  theme: initialTheme,
  onContentChange,
  width = 300,
  height = 200
}: CodeElementProps) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [codeContent, setCodeContent] = useState(initialContent || '')
  const [language, setLanguage] = useState(initialLanguage || 'javascript')
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme || 'dark')

  useEffect(() => {
    if (initialContent !== undefined) {
      setCodeContent(initialContent)
    }
  }, [initialContent])

  useEffect(() => {
    if (initialLanguage !== undefined) {
      setLanguage(initialLanguage)
    }
  }, [initialLanguage])

  useEffect(() => {
    if (initialTheme !== undefined) {
      setTheme(initialTheme)
    }
  }, [initialTheme])

  const handleEditClick = () => {
    setIsModalVisible(true)
  }

  const handleModalOk = () => {
    onContentChange?.(codeContent, language, theme)
    setIsModalVisible(false)
  }

  const handleModalCancel = () => {
    if (initialContent !== undefined) setCodeContent(initialContent)
    if (initialLanguage !== undefined) setLanguage(initialLanguage)
    if (initialTheme !== undefined) setTheme(initialTheme)
    setIsModalVisible(false)
  }

  const getSyntaxStyle = () => {
    return theme === 'dark' ? vscDarkPlus : vs
  }

  const hasData = codeContent.trim().length > 0

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
        {hasData ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f8f8f8',
              border: `1px solid ${theme === 'dark' ? '#3e3e3e' : '#e1e4e8'}`
            }}
          >
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              fontSize: '10px',
              color: theme === 'dark' ? '#cccccc' : '#666666',
              backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
              padding: '2px 6px',
              borderRadius: '3px',
              fontWeight: 'bold',
              zIndex: 2
            }}>
              {language.toUpperCase()}
            </div>

            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              display: 'flex',
              gap: '4px',
              zIndex: 2
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ff5f56'
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ffbd2e'
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#27ca3f'
              }}></div>
            </div>

            <SyntaxHighlighter
              language={language}
              style={getSyntaxStyle()}
              customStyle={{
                margin: 0,
                padding: '40px 16px 16px 16px',
                fontSize: '12px',
                lineHeight: '1.4',
                height: '100%',
                background: 'transparent'
              }}
              wrapLines={true}
              wrapLongLines={true}
            >
              {codeContent.length > 100 ? codeContent.substring(0, 100) + '...' : codeContent}
            </SyntaxHighlighter>

            {codeContent.length > 100 && (
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                fontSize: '10px',
                color: theme === 'dark' ? '#cccccc' : '#666666',
                backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
                padding: '2px 6px',
                borderRadius: '3px'
              }}>
                Double-click to edit
              </div>
            )}
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
              fontSize: '20px',
              marginBottom: '4px',
              textAlign: 'center'
            }}>
              💻
            </div>
            <div style={{
              fontSize: '10px',
              color: '#666',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              Double-click to edit code
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Edit Code"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
        okText="Save Code"
      >
        <Form layout="vertical">
          <Form.Item label="Language">
            <Select
              value={language}
              onChange={setLanguage}
              style={{ width: '200px' }}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={supportedLanguages}
            />
          </Form.Item>

          <Form.Item label="Theme">
            <Select
              value={theme}
              onChange={(value: 'light' | 'dark') => setTheme(value)}
              style={{ width: '200px' }}
            >
              <Select.Option value="light">Light</Select.Option>
              <Select.Option value="dark">Dark</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Code">
            <Input.TextArea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              rows={15}
              placeholder="Enter your code here..."
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f8f8f8',
                color: theme === 'dark' ? '#cccccc' : '#24292e'
              }}
            />
          </Form.Item>

          <div style={{ marginTop: 16 }}>
            <h4>Preview:</h4>
            <div style={{
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              overflow: 'hidden',
              maxHeight: '200px',
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f8f8f8'
            }}>
              <SyntaxHighlighter
                language={language}
                style={getSyntaxStyle()}
                customStyle={{
                  margin: 0,
                  padding: '16px',
                  fontSize: '12px',
                  maxHeight: '180px',
                  overflow: 'auto'
                }}
              >
                {codeContent}
              </SyntaxHighlighter>
            </div>
          </div>
        </Form>
      </Modal>
    </>
  )
}
