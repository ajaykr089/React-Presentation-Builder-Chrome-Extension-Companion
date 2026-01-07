export type ElementType =
  | 'text'
  | 'shape'
  | 'image'
  | 'arrow'
  | 'audio'
  | 'chart'
  | 'code'
  | 'diagram'
  | 'divider'
  | 'draw'
  | 'form'
  | 'icon'
  | 'link'
  | 'quote'
  | 'table'
  | 'video'

export interface SlideElement {
  id: string
  type: ElementType
  content?: string
  x: number
  y: number
  width: number
  height: number
  style?: React.CSSProperties
  zIndex?: number
  // Additional properties for specific element types
  src?: string // for audio/video/images
  alt?: string // for images
  href?: string // for links
  rows?: number // for tables
  cols?: number // for tables
  data?: any // for charts/forms
  // Shape and arrow specific properties
  shapeType?: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'hexagon' | 'star'
  arrowType?: 'straight' | 'curved' | 'double' | 'dashed' | 'thick'
  direction?: 'right' | 'left' | 'up' | 'down'
  arrowThickness?: number
  language?: string
  codeTheme?: 'light' | 'dark'
  chartType?: 'bar' | 'line' | 'pie' | 'doughnut'
  // Icon specific properties
  iconType?: string
  iconColor?: string
  iconSize?: number
  // Link specific properties
  openInNewTab?: boolean
  // Video specific properties
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
  volume?: number
  // Animation properties
  animation?: {
    type: 'fadeIn' | 'slideIn' | 'bounce' | 'scale' | 'rotate'
    duration: number
    delay: number
    easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
    direction?: 'left' | 'right' | 'top' | 'bottom'
  }
}

export interface Slide {
  id: string
  elements: SlideElement[]
  backgroundColor?: string
  backgroundImage?: string
  layout: string
  transition?: {
    type: 'fade' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'zoom' | 'rotate'
    duration: number
    easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  }
}

export interface Presentation {
  id: string
  title: string
  slides: Slide[]
  theme: Theme
  createdAt: Date
  updatedAt: Date
}

export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  fonts: {
    heading: string
    body: string
  }
}

export interface SlideTemplate {
  id: string
  name: string
  category: string
  thumbnail: string
  elements: Omit<SlideElement, 'id'>[]
  description?: string
}
