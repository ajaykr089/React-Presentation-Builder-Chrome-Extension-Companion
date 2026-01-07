interface ShapeRendererProps {
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'hexagon' | 'star'
  backgroundColor: string
  borderColor: string
  borderWidth: string
  width: string
  height: string
}

export function ShapeRenderer({
  shapeType,
  backgroundColor,
  borderColor,
  borderWidth,
  width,
  height
}: ShapeRendererProps) {
  const borderWidthNum = parseInt(borderWidth) || 0
  const svgWidth = 100
  const svgHeight = 100

  const getShapePath = () => {
    switch (shapeType) {
      case 'circle':
        return <circle cx="50" cy="50" r="45" fill={backgroundColor} stroke={borderColor} strokeWidth={borderWidthNum} />
      case 'triangle':
        return <polygon points="50,10 10,90 90,90" fill={backgroundColor} stroke={borderColor} strokeWidth={borderWidthNum} />
      case 'diamond':
        return <polygon points="50,10 90,50 50,90 10,50" fill={backgroundColor} stroke={borderColor} strokeWidth={borderWidthNum} />
      case 'hexagon':
        return <polygon points="50,10 80,30 80,70 50,90 20,70 20,30" fill={backgroundColor} stroke={borderColor} strokeWidth={borderWidthNum} />
      case 'star':
        return <polygon points="50,10 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill={backgroundColor} stroke={borderColor} strokeWidth={borderWidthNum} />
      default: // rectangle
        return <rect x="10" y="10" width="80" height="80" fill={backgroundColor} stroke={borderColor} strokeWidth={borderWidthNum} rx="4" />
    }
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ display: 'block' }}>
      {getShapePath()}
    </svg>
  )
}
