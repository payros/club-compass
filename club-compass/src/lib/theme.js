import { createSystem, defaultConfig, defineConfig, defineRecipe, defineSlotRecipe } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: {
          DEFAULT: { value: '#1e5aa8' },
          light: { value: '#36c6f4' },
        },
        accent: {
          DEFAULT: { value: '#e89a2d' },
          light: { value: '#f4c542' },
        },
      },
    },
    semanticTokens: {
      colors: {
        // "brand" palette — maps colorPalette="brand" to the blue primary scale
        brand: {
          solid: { value: '#1e5aa8' },
          contrast: { value: '#f7fafc' },
          fg: { value: '#1e5aa8' },
          muted: { value: 'rgba(30, 90, 168, 0.15)' },
          subtle: { value: 'rgba(54, 198, 244, 0.15)' },
          emphasized: { value: '#1c3450' },
          focusRing: { value: '#1c3450' },
          placeholder: { value: '#1c3450' },
        },
        // "accent" palette — maps colorPalette="accent" to the amber accent
        accent: {
          solid: { value: '#2f7a6a' },
          contrast: { value: '#fff' },
          fg: { value: '#f4c542' },
          muted: { value: 'rgba(232, 154, 45, 0.15)' },
          subtle: { value: 'rgba(244, 197, 66, 0.15)' },
          emphasized: { value: '#f4c542' },
          focusRing: { value: '#f4c542' },
          placeholder: { value: 'rgba(244, 197, 66, 0.5)' },
        },
        'accent-2': {
          solid: { value: '#1e5aa8' },
          contrast: { value: '#fff' },
          fg: { value: '#f4c542' },
          muted: { value: 'rgba(232, 154, 45, 0.15)' },
          subtle: { value: 'rgba(244, 197, 66, 0.15)' },
          emphasized: { value: '#f4c542' },
          focusRing: { value: '#f4c542' },
          placeholder: { value: 'rgba(244, 197, 66, 0.5)' },
        },
        accentInverted: {
          solid: { value: '#f4c542' },
          contrast: { value: '#1e564a' },
          fg: { value: '#1e564a' },
          muted: { value: 'rgba(232, 154, 45, 0.15)' },
          subtle: { value: 'rgba(244, 197, 66, 0.15)' },
          emphasized: { value: '#2f7a6a' },
          focusRing: { value: '#2f7a6a' },
          placeholder: { value: 'rgba(244, 197, 66, 0.5)' },
        },
        // "glass" palette — for white-on-dark glass UI elements (buttons, borders)
        glass: {
          solid: { value: 'rgba(255,255,255,0.2)' },
          contrast: { value: '#ffffff' },
          fg: { value: '#ffffff' },
          muted: { value: 'rgba(255,255,255,0.08)' },
          subtle: { value: 'rgba(255,255,255,0.12)' },
          emphasized: { value: 'rgba(255,255,255,0.3)' },
          focusRing: { value: 'rgba(255,255,255,0.6)' },
          placeholder: { value: 'rgba(255,255,255,0.45)' },
        },
      },
    },
  },
})

const buttonRecipe = defineRecipe({
  base: {},
  variants: {
    variant: {
      outline: {
        borderWidth: 1,
        color: '{colors.brand.emphasized}',
        borderColor: '{colors.brand.emphasized}',
        _hover: {
          bg: '{colors.brand.emphasized}',
          borderColor: '{colors.brand.emphasized}',
          color: '{colors.brand.contrast}',
        },
      },
      solid: {
        _hover: {
          bg: '{colors.accent.emphasized}',
          borderColor: '{colors.accent.emphasized}',
          color: '{colors.brand.placeholder}',
        },
      },
      solidInverted: {
        borderWidth: 1,
        color: '{colors.contrast.solid}',
        borderColor: '{colors.accentInverted.solid}',
        backgroundColor: '{colors.accentInverted.solid}',
        _hover: {
          bg: '{colors.accentInverted.emphasized}',
          borderColor: '{colors.accentInverted.emphasized}',
          color: '{colors.accent.contrast}',
        },
      },
    },
  },
})

const selectRecipe = defineSlotRecipe({
  slots: ['trigger'],
  base: {
    trigger: {
      minH: '40px',
      h: '40px',
    },
  },
})

export const system = createSystem(defaultConfig, {
  ...config,
  theme: {
    ...config.theme,
    recipes: {
      button: buttonRecipe,
    },
    slotRecipes: {
      select: selectRecipe,
    },
  },
})
