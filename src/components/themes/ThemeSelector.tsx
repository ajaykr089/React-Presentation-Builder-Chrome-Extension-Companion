'use client'

import { Card, Typography, Space, Button, Tooltip, Divider } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { presentationThemes } from '@/lib/themes'
import { Theme } from '@/types/presentation'

const { Title, Text } = Typography
const { Meta } = Card

interface ThemeSelectorProps {
  selectedTheme: Theme
  onThemeSelect: (theme: Theme) => void
}

export function ThemeSelector({ selectedTheme, onThemeSelect }: ThemeSelectorProps) {
  const renderThemeCard = (theme: Theme) => {
    const isSelected = selectedTheme.id === theme.id

    return (
      <Card
        key={theme.id}
        hoverable={!isSelected}
        style={{
          width: 200,
          margin: '8px',
          border: isSelected ? `2px solid ${theme.colors.primary}` : '1px solid #e8e8e8',
          position: 'relative'
        }}
        onClick={() => onThemeSelect(theme)}
      >
        {isSelected && (
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: theme.colors.primary,
            borderRadius: '50%',
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}>
            <CheckOutlined style={{ color: 'white', fontSize: '12px' }} />
          </div>
        )}

        {/* Theme Preview */}
        <div style={{
          height: 100,
          background: theme.colors.background,
          border: `1px solid ${theme.colors.secondary}`,
          borderRadius: 4,
          padding: '8px',
          marginBottom: '12px'
        }}>
          {/* Mock slide preview */}
          <div style={{
            background: theme.colors.secondary,
            height: '60%',
            borderRadius: 2,
            marginBottom: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '60%',
              height: 3,
              background: theme.colors.primary,
              borderRadius: 2
            }} />
          </div>
          <div style={{
            display: 'flex',
            gap: 2
          }}>
            <div style={{
              flex: 1,
              height: 2,
              background: theme.colors.accent,
              borderRadius: 1,
              opacity: 0.7
            }} />
            <div style={{
              flex: 1,
              height: 2,
              background: theme.colors.accent,
              borderRadius: 1,
              opacity: 0.5
            }} />
            <div style={{
              flex: 1,
              height: 2,
              background: theme.colors.accent,
              borderRadius: 1,
              opacity: 0.3
            }} />
          </div>
        </div>

        <Meta
          title={<Text strong style={{ fontSize: '14px' }}>{theme.name}</Text>}
          description={
            <div>
              <div style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: theme.colors.primary,
                      borderRadius: 2,
                      border: '1px solid #e8e8e8'
                    }}
                  />
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: theme.colors.secondary,
                      borderRadius: 2,
                      border: '1px solid #e8e8e8'
                    }}
                  />
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: theme.colors.accent,
                      borderRadius: 2,
                      border: '1px solid #e8e8e8'
                    }}
                  />
                </div>
              </div>
              <Text style={{ fontSize: '11px', color: '#666' }}>
                {theme.fonts.heading.split(',')[0]}
              </Text>
            </div>
          }
        />
      </Card>
    )
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Title level={4}>Themes</Title>
        <Text type="secondary">
          Choose a visual style for your presentation
        </Text>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start'
      }}>
        {presentationThemes.map(renderThemeCard)}
      </div>

      <Divider />

      <div style={{ marginTop: '16px' }}>
        <Title level={5}>Custom Theme</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Create your own custom theme with specific colors and fonts
          </Text>
          <Button type="dashed" block>
            Create Custom Theme
          </Button>
        </Space>
      </div>
    </div>
  )
}
