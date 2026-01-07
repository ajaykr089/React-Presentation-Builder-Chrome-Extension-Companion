interface ArrowRendererProps {
  arrowType: 'straight' | 'curved' | 'double' | 'dashed' | 'thick'
  direction: 'right' | 'left' | 'up' | 'down'
  color: string
  thickness: number
  width: string
  height: string
}

export function ArrowRenderer({
  arrowType,
  direction,
  color,
  thickness,
  width,
  height
}: ArrowRendererProps) {
  const svgWidth = 100
  const svgHeight = 100

  const getArrowPath = () => {
    const shaftLength = 70
    const arrowHeadSize = 15
    const shaftStart = 10
    const shaftEnd = shaftStart + shaftLength
    const centerY = svgHeight / 2

    let pathData = ''

    switch (arrowType) {
      case 'straight':
        // Simple straight arrow
        pathData = `
          M ${shaftStart} ${centerY}
          L ${shaftEnd} ${centerY}
          M ${shaftEnd} ${centerY}
          L ${shaftEnd - arrowHeadSize} ${centerY - arrowHeadSize/2}
          M ${shaftEnd} ${centerY}
          L ${shaftEnd - arrowHeadSize} ${centerY + arrowHeadSize/2}
        `
        break

      case 'curved':
        // Curved arrow with arc
        const arcRadius = 25
        pathData = `
          M ${shaftStart} ${centerY}
          Q ${shaftStart + arcRadius} ${centerY - arcRadius} ${shaftStart + arcRadius * 2} ${centerY}
          L ${shaftEnd - arrowHeadSize} ${centerY}
          M ${shaftEnd} ${centerY}
          L ${shaftEnd - arrowHeadSize} ${centerY - arrowHeadSize/2}
          M ${shaftEnd} ${centerY}
          L ${shaftEnd - arrowHeadSize} ${centerY + arrowHeadSize/2}
        `
        break

      case 'double':
        // Double-headed arrow
        pathData = `
          M ${shaftStart} ${centerY}
          L ${shaftStart + arrowHeadSize} ${centerY - arrowHeadSize/2}
          M ${shaftStart} ${centerY}
          L ${shaftStart + arrowHeadSize} ${centerY + arrowHeadSize/2}
          M ${shaftStart} ${centerY}
          L ${shaftEnd} ${centerY}
          M ${shaftEnd} ${centerY}
          L ${shaftEnd - arrowHeadSize} ${centerY - arrowHeadSize/2}
          M ${shaftEnd} ${centerY}
          L ${shaftEnd - arrowHeadSize} ${centerY + arrowHeadSize/2}
        `
        break

      case 'dashed':
        // Dashed line arrow (we'll use stroke-dasharray in the path style)
        pathData = `
          M ${shaftStart} ${centerY}
          L ${shaftEnd} ${centerY}
          M ${shaftEnd} ${centerY}
          L ${shaftEnd - arrowHeadSize} ${centerY - arrowHeadSize/2}
          M ${shaftEnd} ${centerY}
          L ${shaftEnd - arrowHeadSize} ${centerY + arrowHeadSize/2}
        `
        break

      case 'thick':
        // Thick arrow (thicker line)
        pathData = `
          M ${shaftStart} ${centerY}
          L ${shaftEnd} ${centerY}
          M ${shaftEnd} ${centerY}
          L ${shaftEnd - arrowHeadSize} ${centerY - arrowHeadSize/2}
          M ${shaftEnd} ${centerY}
          L ${shaftEnd - arrowHeadSize} ${centerY + arrowHeadSize/2}
        `
        break

      default:
        pathData = `
          M ${shaftStart} ${centerY}
          L ${shaftEnd} ${centerY}
          M ${shaftEnd} ${centerY}
          L ${shaftEnd - arrowHeadSize} ${centerY - arrowHeadSize/2}
          M ${shaftEnd} ${centerY}
          L ${shaftEnd - arrowHeadSize} ${centerY + arrowHeadSize/2}
        `
    }

    return pathData
  }

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return 'rotate(180 50 50)'
      case 'up':
        return 'rotate(-90 50 50)'
      case 'down':
        return 'rotate(90 50 50)'
      default:
        return 'rotate(0 50 50)'
    }
  }

  const getStrokeStyle = () => {
    if (arrowType === 'dashed') {
      return {
        strokeDasharray: '5,5'
      }
    }
    return {}
  }

  const strokeWidth = arrowType === 'thick' ? Math.max(thickness, 6) : thickness

  return (
    <svg width={width} height={height} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ display: 'block' }}>
      <path
        d={getArrowPath()}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        transform={getTransform()}
        style={getStrokeStyle()}
      />
    </svg>
  )
}
