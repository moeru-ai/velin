import antfu from '@antfu/eslint-config'
import { importX } from 'eslint-plugin-import-x'

export default antfu({
  vue: true,
  rules: {
    'ts/ban-ts-comment': 'off',
    'antfu/import-dedupe': 'error',
    'style/padding-line-between-statements': 'error',
    'import-x/order': [
      'error',
      {
        'groups': [
          ['type'],
          ['builtin', 'external'],
          ['parent', 'sibling', 'index'],
        ],
        'newlines-between': 'always',
      },
    ],
  },
  plugins: {
    'import-x': importX,
  },
})
