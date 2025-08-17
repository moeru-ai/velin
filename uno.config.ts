import type { PresetOrFactoryAwaitable } from 'unocss'

import { flavors } from '@catppuccin/palette'
import { createExternalPackageIconLoader } from '@iconify/utils/lib/loader/external-pkg'
import { colorToString } from '@unocss/preset-mini/utils'
import { defineConfig, mergeConfigs, presetAttributify, presetIcons, presetTypography, presetWebFonts, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss'
import { presetScrollbar } from 'unocss-preset-scrollbar'
import { parseColor } from 'unocss/preset-mini'

function createColorSchemeConfig(hueOffset = 0) {
  return {
    DEFAULT: `oklch(62% var(--theme-colors-chroma) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    50: `color-mix(in srgb, oklch(95% var(--theme-colors-chroma-50) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha) 30%, oklch(100% 0 360 / %alpha))`,
    100: `color-mix(in srgb, oklch(95% var(--theme-colors-chroma-100) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha) 80%, oklch(100% 0 360 / %alpha))`,
    200: `oklch(90% var(--theme-colors-chroma-200) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    300: `oklch(85% var(--theme-colors-chroma-300) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    400: `oklch(74% var(--theme-colors-chroma-400) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    500: `oklch(62% var(--theme-colors-chroma) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    600: `oklch(54% var(--theme-colors-chroma-600) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    700: `oklch(49% var(--theme-colors-chroma-700) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    800: `oklch(42% var(--theme-colors-chroma-800) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    900: `oklch(37% var(--theme-colors-chroma-900) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    950: `oklch(29% var(--theme-colors-chroma-950) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
  }
}

export function presetStoryMockHover(): PresetOrFactoryAwaitable {
  return {
    name: 'story-mock-hover',
    variants: [
      (matcher) => {
        if (!matcher.includes('hover')) {
          return matcher
        }

        return {
          matcher,
          selector: (s) => {
            return `${s}, ${s.replace(/:hover$/, '')}._hover`
          },
        }
      },
    ],
  }
}

export function safelistAllPrimaryBackgrounds(): string[] {
  return [
    ...[undefined, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => {
      const prefix = shade ? `bg-primary-${shade}` : `bg-primary`
      return [
        prefix,
        ...[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(opacity => `${prefix}/${opacity}`),
      ]
    }).flat(),
  ]
}

export function sharedUnoConfig() {
  return defineConfig({
    presets: [
      presetWind3(),
      presetAttributify(),
      presetTypography({
        cssExtend: {
          'h1': {
            margin: '0.5em 0 0.5em 0',
          },
          'h2': {
            margin: '0.5em 0 0.5em 0',
          },
          'h3': {
            margin: '0',
          },
          'h4': {
            margin: '0',
          },
          'h5': {
            margin: '0',
          },
          'h6': {
            margin: '0',
          },
          'div': {
            'margin': '0',
            'line-height': 1.75,
          },
          'p': {
            'margin': '0',
            'line-height': 1.75,
          },
          'blockquote': {
            'margin': '0',
            'line-height': 1.25,
            'display': 'flex',
            'flex-direction': 'column',
            'gap': '12px',
            'padding': '1em 1em 1em 1em',
          },
          'blockquote p': {
            'line-height': 1,
          },
        },
      }),
      presetWebFonts({
        fonts: {
          sans: 'DM Sans',
          serif: 'DM Serif Display',
          mono: 'DM Mono',
          cute: 'Kiwi Maru',
          cuteen: 'Sniglet',
          jura: 'Jura',
          gugi: 'Gugi',
          quicksand: 'Quicksand',
        },
        timeouts: {
          warning: 5000,
          failure: 10000,
        },
      }),
      presetIcons({
        scale: 1.2,
        collections: {
          ...createExternalPackageIconLoader('@proj-airi/lobe-icons'),
        },
      }),
      presetScrollbar(),
    ],
    transformers: [
      transformerDirectives({
        applyVariable: ['--at-apply'],
      }),
      transformerVariantGroup(),
    ],
    safelist: [
      ...'prose prose-sm m-auto text-left'.split(' '),
    ],
    // hyoban/unocss-preset-shadcn: Use shadcn ui with UnoCSS
    // https://github.com/hyoban/unocss-preset-shadcn
    //
    // Thanks to
    // https://github.com/unovue/shadcn-vue/issues/34#issuecomment-2467318118
    // https://github.com/hyoban-template/shadcn-vue-unocss-starter
    //
    // By default, `.ts` and `.js` files are NOT extracted.
    // If you want to extract them, use the following configuration.
    // It's necessary to add the following configuration if you use shadcn-vue or shadcn-svelte.
    content: {
      pipeline: {
        include: [
          // the default
          /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
          // include js/ts files
          '(components|src)/**/*.{js,ts,vue}',
        ],
      },
    },
    rules: [
      [/^mask-\[(.*)\]$/, ([, suffix]) => ({ '-webkit-mask-image': suffix.replace(/_/g, ' ') })],
      [/^bg-dotted-\[(.*)\]$/, ([, color], { theme }) => {
        const parsedColor = parseColor(color, theme)
        // Util usage: https://github.com/unocss/unocss/blob/f57ef6ae50006a92f444738e50f3601c0d1121f2/packages-presets/preset-mini/src/_utils/utilities.ts#L186
        return {
          'background-image': `radial-gradient(circle at 1px 1px, ${colorToString(parsedColor?.cssColor ?? parsedColor?.color ?? color, 'var(--un-background-opacity)')} 1px, transparent 0)`,
          '--un-background-opacity': parsedColor?.cssColor?.alpha ?? parsedColor?.alpha ?? 1,
        }
      }],
    ],
    theme: {
      colors: {
        'primary': createColorSchemeConfig(),
        'complementary': createColorSchemeConfig(180),

        // Palette • Catppuccin
        // https://catppuccin.com/palette/
        'latte-rosewater': flavors.latte.colors.rosewater.hex,
        'latte-flamingo': flavors.latte.colors.flamingo.hex,
        'latte-pink': flavors.latte.colors.pink.hex,
        'latte-mauve': flavors.latte.colors.mauve.hex,
        'latte-red': flavors.latte.colors.red.hex,
        'latte-maroon': flavors.latte.colors.maroon.hex,
        'latte-peach': flavors.latte.colors.peach.hex,
        'latte-yellow': flavors.latte.colors.yellow.hex,
        'latte-green': flavors.latte.colors.green.hex,
        'latte-teal': flavors.latte.colors.teal.hex,
        'latte-sky': flavors.latte.colors.sky.hex,
        'latte-sapphire': flavors.latte.colors.sapphire.hex,
        'latte-blue': flavors.latte.colors.blue.hex,
        'latte-lavender': flavors.latte.colors.lavender.hex,
        'latte-text': flavors.latte.colors.text.hex,
        'latte-subtext-0': flavors.latte.colors.subtext0.hex,
        'latte-subtext-1': flavors.latte.colors.subtext1.hex,
        'latte-overlay-0': flavors.latte.colors.overlay0.hex,
        'latte-overlay-1': flavors.latte.colors.overlay1.hex,
        'latte-overlay-2': flavors.latte.colors.overlay2.hex,
        'latte-surface-0': flavors.latte.colors.surface0.hex,
        'latte-surface-1': flavors.latte.colors.surface1.hex,
        'latte-surface-2': flavors.latte.colors.surface2.hex,
        'latte-base': flavors.latte.colors.base.hex,
        'latte-mantle': flavors.latte.colors.mantle.hex,
        'latte-crust': flavors.latte.colors.crust.hex,

        'frappe-rosewater': flavors.frappe.colors.rosewater.hex,
        'frappe-flamingo': flavors.frappe.colors.flamingo.hex,
        'frappe-pink': flavors.frappe.colors.pink.hex,
        'frappe-mauve': flavors.frappe.colors.mauve.hex,
        'frappe-red': flavors.frappe.colors.red.hex,
        'frappe-maroon': flavors.frappe.colors.maroon.hex,
        'frappe-peach': flavors.frappe.colors.peach.hex,
        'frappe-yellow': flavors.frappe.colors.yellow.hex,
        'frappe-green': flavors.frappe.colors.green.hex,
        'frappe-teal': flavors.frappe.colors.teal.hex,
        'frappe-sky': flavors.frappe.colors.sky.hex,
        'frappe-sapphire': flavors.frappe.colors.sapphire.hex,
        'frappe-blue': flavors.frappe.colors.blue.hex,
        'frappe-lavender': flavors.frappe.colors.lavender.hex,
        'frappe-text': flavors.frappe.colors.text.hex,
        'frappe-subtext-0': flavors.frappe.colors.subtext0.hex,
        'frappe-subtext-1': flavors.frappe.colors.subtext1.hex,
        'frappe-overlay-0': flavors.frappe.colors.overlay0.hex,
        'frappe-overlay-1': flavors.frappe.colors.overlay1.hex,
        'frappe-overlay-2': flavors.frappe.colors.overlay2.hex,
        'frappe-surface-0': flavors.frappe.colors.surface0.hex,
        'frappe-surface-1': flavors.frappe.colors.surface1.hex,
        'frappe-surface-2': flavors.frappe.colors.surface2.hex,
        'frappe-base': flavors.frappe.colors.base.hex,
        'frappe-mantle': flavors.frappe.colors.mantle.hex,
        'frappe-crust': flavors.frappe.colors.crust.hex,

        'macchiato-rosewater': flavors.macchiato.colors.rosewater.hex,
        'macchiato-flamingo': flavors.macchiato.colors.flamingo.hex,
        'macchiato-pink': flavors.macchiato.colors.pink.hex,
        'macchiato-mauve': flavors.macchiato.colors.mauve.hex,
        'macchiato-red': flavors.macchiato.colors.red.hex,
        'macchiato-maroon': flavors.macchiato.colors.maroon.hex,
        'macchiato-peach': flavors.macchiato.colors.peach.hex,
        'macchiato-yellow': flavors.macchiato.colors.yellow.hex,
        'macchiato-green': flavors.macchiato.colors.green.hex,
        'macchiato-teal': flavors.macchiato.colors.teal.hex,
        'macchiato-sky': flavors.macchiato.colors.sky.hex,
        'macchiato-sapphire': flavors.macchiato.colors.sapphire.hex,
        'macchiato-blue': flavors.macchiato.colors.blue.hex,
        'macchiato-lavender': flavors.macchiato.colors.lavender.hex,
        'macchiato-text': flavors.macchiato.colors.text.hex,
        'macchiato-subtext-0': flavors.macchiato.colors.subtext0.hex,
        'macchiato-subtext-1': flavors.macchiato.colors.subtext1.hex,
        'macchiato-overlay-0': flavors.macchiato.colors.overlay0.hex,
        'macchiato-overlay-1': flavors.macchiato.colors.overlay1.hex,
        'macchiato-overlay-2': flavors.macchiato.colors.overlay2.hex,
        'macchiato-surface-0': flavors.macchiato.colors.surface0.hex,
        'macchiato-surface-1': flavors.macchiato.colors.surface1.hex,
        'macchiato-surface-2': flavors.macchiato.colors.surface2.hex,

        'mocha-rosewater': flavors.mocha.colors.rosewater.hex,
        'mocha-flamingo': flavors.mocha.colors.flamingo.hex,
        'mocha-pink': flavors.mocha.colors.pink.hex,
        'mocha-mauve': flavors.mocha.colors.mauve.hex,
        'mocha-red': flavors.mocha.colors.red.hex,
        'mocha-maroon': flavors.mocha.colors.maroon.hex,
        'mocha-peach': flavors.mocha.colors.peach.hex,
        'mocha-yellow': flavors.mocha.colors.yellow.hex,
        'mocha-green': flavors.mocha.colors.green.hex,
        'mocha-teal': flavors.mocha.colors.teal.hex,
        'mocha-sky': flavors.mocha.colors.sky.hex,
        'mocha-sapphire': flavors.mocha.colors.sapphire.hex,
        'mocha-blue': flavors.mocha.colors.blue.hex,
        'mocha-lavender': flavors.mocha.colors.lavender.hex,
        'mocha-text': flavors.mocha.colors.text.hex,
        'mocha-subtext-0': flavors.mocha.colors.subtext0.hex,
        'mocha-subtext-1': flavors.mocha.colors.subtext1.hex,
        'mocha-overlay-0': flavors.mocha.colors.overlay0.hex,
        'mocha-overlay-1': flavors.mocha.colors.overlay1.hex,
        'mocha-overlay-2': flavors.mocha.colors.overlay2.hex,
        'mocha-surface-0': flavors.mocha.colors.surface0.hex,
        'mocha-surface-1': flavors.mocha.colors.surface1.hex,
        'mocha-surface-2': flavors.mocha.colors.surface2.hex,
      },
    },
  })
}

export default mergeConfigs([
  sharedUnoConfig(),
])
