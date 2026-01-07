import { SlideElement } from '@/types/presentation'

export interface Animation {
  id: string
  elementId: string
  type: 'fadeIn' | 'slideIn' | 'bounce' | 'scale' | 'rotate'
  duration: number
  delay: number
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  direction?: 'left' | 'right' | 'top' | 'bottom'
}

export interface AnimationSequence {
  id: string
  name: string
  animations: Animation[]
}

export const animationTypes = [
  { id: 'fadeIn', name: 'Fade In', description: 'Element fades into view' },
  { id: 'slideIn', name: 'Slide In', description: 'Element slides in from a direction' },
  { id: 'bounce', name: 'Bounce', description: 'Element bounces into position' },
  { id: 'scale', name: 'Scale', description: 'Element scales up from small size' },
  { id: 'rotate', name: 'Rotate', description: 'Element rotates into view' }
]

export const easingFunctions = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out'
}

export const createAnimation = (
  elementId: string,
  type: Animation['type'],
  options: Partial<Omit<Animation, 'id' | 'elementId' | 'type'>> = {}
): Animation => {
  return {
    id: `anim-${Date.now()}-${Math.random()}`,
    elementId,
    type,
    duration: 500,
    delay: 0,
    easing: 'easeOut',
    ...options
  }
}

export const applyAnimationToElement = (
  element: SlideElement,
  animation: Animation
): SlideElement => {
  const baseStyles = { ...element.style }

  let animationStyles: React.CSSProperties = {}

  switch (animation.type) {
    case 'fadeIn':
      animationStyles = {
        opacity: 0,
        animation: `fadeIn ${animation.duration}ms ${easingFunctions[animation.easing]} ${animation.delay}ms forwards`
      }
      break

    case 'slideIn':
      const direction = animation.direction || 'left'
      const translateValue = '100px'

      let transformOrigin = ''
      switch (direction) {
        case 'left':
          transformOrigin = `translateX(-${translateValue})`
          break
        case 'right':
          transformOrigin = `translateX(${translateValue})`
          break
        case 'top':
          transformOrigin = `translateY(-${translateValue})`
          break
        case 'bottom':
          transformOrigin = `translateY(${translateValue})`
          break
      }

      animationStyles = {
        opacity: 0,
        transform: transformOrigin,
        animation: `slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)} ${animation.duration}ms ${easingFunctions[animation.easing]} ${animation.delay}ms forwards`
      }
      break

    case 'bounce':
      animationStyles = {
        animation: `bounce ${animation.duration}ms ${easingFunctions[animation.easing]} ${animation.delay}ms forwards`
      }
      break

    case 'scale':
      animationStyles = {
        transform: 'scale(0)',
        transformOrigin: 'center',
        animation: `scaleIn ${animation.duration}ms ${easingFunctions[animation.easing]} ${animation.delay}ms forwards`
      }
      break

    case 'rotate':
      animationStyles = {
        transform: 'rotate(-180deg)',
        transformOrigin: 'center',
        animation: `rotateIn ${animation.duration}ms ${easingFunctions[animation.easing]} ${animation.delay}ms forwards`
      }
      break
  }

  return {
    ...element,
    style: {
      ...baseStyles,
      ...animationStyles
    }
  }
}

export const generateAnimationCSS = (): string => {
  return `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-100px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(100px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes slideInTop {
      from { opacity: 0; transform: translateY(-100px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideInBottom {
      from { opacity: 0; transform: translateY(100px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-30px); }
      60% { transform: translateY(-15px); }
    }

    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }

    @keyframes rotateIn {
      from { transform: rotate(-180deg); opacity: 0; }
      to { transform: rotate(0deg); opacity: 1; }
    }
  `
}

export const getAnimationSequence = (elementCount: number): AnimationSequence => {
  const animations: Animation[] = []

  // Create a staggered animation sequence
  for (let i = 0; i < elementCount; i++) {
    animations.push(createAnimation(
      `element-${i}`,
      'fadeIn',
      {
        delay: i * 200,
        duration: 600
      }
    ))
  }

  return {
    id: `sequence-${Date.now()}`,
    name: 'Staggered Fade In',
    animations
  }
}
