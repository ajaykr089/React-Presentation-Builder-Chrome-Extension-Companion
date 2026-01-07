'use client'

import { Layout, Menu, Button, Space } from 'antd'
import {
  FileTextOutlined,
  PlayCircleOutlined,
  ExportOutlined,
  SettingOutlined,
  PlusOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons'
import { useState } from 'react'

const { Header, Sider, Content } = Layout

interface AppLayoutProps {
  children: React.ReactNode
  onPropertiesClick?: () => void
  onNewPresentation?: () => void
  onPreview?: () => void
  onExport?: () => void
  onSettings?: () => void
  onAddSlide?: () => void
  onNextSlide?: () => void
  onPrevSlide?: () => void
  currentSlideIndex?: number
  totalSlides?: number
}

export function AppLayout({
  children,
  onPropertiesClick,
  onNewPresentation,
  onPreview,
  onExport,
  onSettings,
  onAddSlide,
  onNextSlide,
  onPrevSlide,
  currentSlideIndex = 0,
  totalSlides = 1
}: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'new':
        onNewPresentation?.()
        break
      case 'preview':
        onPreview?.()
        break
      case 'export':
        onExport?.()
        break
      case 'settings':
        onSettings?.()
        break
    }
  }

  const menuItems = [
    {
      key: 'new',
      icon: <PlusOutlined />,
      label: 'New Presentation',
    },
    {
      key: 'slides',
      icon: <FileTextOutlined />,
      label: 'Slides',
    },
    {
      key: 'preview',
      icon: <PlayCircleOutlined />,
      label: 'Preview',
    },
    {
      key: 'export',
      icon: <ExportOutlined />,
      label: 'Export',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#001529',
      }}>
        <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
          Presentation Builder
        </div>
        <Space>
          <span style={{ color: 'white', fontSize: '14px' }}>
            Slide {currentSlideIndex + 1} of {totalSlides}
          </span>
          <Button
            icon={<LeftOutlined />}
            onClick={onPrevSlide}
            disabled={currentSlideIndex === 0}
            style={{ color: 'white' }}
          />
          <Button
            icon={<RightOutlined />}
            onClick={onNextSlide}
            disabled={currentSlideIndex === totalSlides - 1}
            style={{ color: 'white' }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddSlide}
          >
            New Slide
          </Button>
          <Button
            icon={<PlayCircleOutlined />}
            onClick={onPreview}
          >
            Preview
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={onExport}
          >
            Export
          </Button>
          <Button
            icon={<SettingOutlined />}
            onClick={onPropertiesClick}
          >
            Properties
          </Button>
        </Space>
      </Header>

      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{
            background: '#ffffff',
          }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={['slides']}
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
            style={{
              height: '100%',
              borderRight: 0,
            }}
          />
        </Sider>

        <Layout style={{ padding: '0 0 24px' }}>
          {children}
        </Layout>
      </Layout>
    </Layout>
  )
}
