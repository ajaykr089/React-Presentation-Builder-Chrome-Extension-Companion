import { Theme } from '@/types/presentation'

export const presentationThemes: Theme[] = [
  {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#1890ff',
      secondary: '#f0f0f0',
      accent: '#40a9ff',
      background: '#ffffff',
      text: '#000000'
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif'
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    colors: {
      primary: '#1f2937',
      secondary: '#f3f4f6',
      accent: '#3b82f6',
      background: '#ffffff',
      text: '#111827'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Arial, sans-serif'
    }
  },
  {
    id: 'modern',
    name: 'Modern',
    colors: {
      primary: '#7c3aed',
      secondary: '#f8fafc',
      accent: '#a855f7',
      background: '#ffffff',
      text: '#1e293b'
    },
    fonts: {
      heading: 'Poppins, sans-serif',
      body: 'Poppins, sans-serif'
    }
  },
  {
    id: 'nature',
    name: 'Nature',
    colors: {
      primary: '#059669',
      secondary: '#ecfdf5',
      accent: '#10b981',
      background: '#ffffff',
      text: '#064e3b'
    },
    fonts: {
      heading: 'Nunito, sans-serif',
      body: 'Nunito, sans-serif'
    }
  },
  {
    id: 'corporate',
    name: 'Corporate',
    colors: {
      primary: '#dc2626',
      secondary: '#fef2f2',
      accent: '#ef4444',
      background: '#ffffff',
      text: '#991b1b'
    },
    fonts: {
      heading: 'Roboto, sans-serif',
      body: 'Roboto, sans-serif'
    }
  },
  {
    id: 'creative',
    name: 'Creative',
    colors: {
      primary: '#ea580c',
      secondary: '#fff7ed',
      accent: '#fb923c',
      background: '#ffffff',
      text: '#9a3412'
    },
    fonts: {
      heading: 'Montserrat, sans-serif',
      body: 'Montserrat, sans-serif'
    }
  }
]

export const getThemeById = (id: string): Theme | undefined => {
  return presentationThemes.find(theme => theme.id === id)
}

export const getDefaultTheme = (): Theme => {
  return presentationThemes[0]
}
