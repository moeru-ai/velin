import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    pnpm: true,
    ignores: [
      '**/*.md',
      '**/vue-global-types.d.ts',
    ],
    rules: {
      'vue/prefer-separate-static-class': 'off',
      'yaml/plain-scalar': 'off',
      'import/order': 'off',
      'antfu/import-dedupe': 'error',
      'style/padding-line-between-statements': 'error',
      'no-restricted-syntax': [
        'warn',
        // Catches the manual `error instanceof Error ? error.message : ...`
        // pattern AGENTS.md forbids. The selector matches a ConditionalExpression
        // whose test is `<x> instanceof Error` and whose consequent is `<x>.message`,
        // so it does NOT false-positive on `error instanceof Error ? error : new Error(...)`
        // (where the consequent is the error itself, not its `.message`). Antfu's
        // default no-restricted-syntax patterns are preserved alongside.
        {
          message: 'Avoid `error instanceof Error ? error.message : ...`. Use `errorMessageFrom(error)` from \'@moeru/std\' (or `errorMessageFromUnknown(error, fallback)` from \'@proj-airi/stage-shared\'). Pair with `?? \'fallback\'` when a default is needed.',
          selector: 'ConditionalExpression[test.type=\'BinaryExpression\'][test.operator=\'instanceof\'][test.right.name=\'Error\'][consequent.type=\'MemberExpression\'][consequent.property.name=\'message\']',
        },
        {
          message: 'Avoid hand-written clamp logic. Use `clamp(value, lower, upper)` from `es-toolkit` instead.',
          selector: 'FunctionDeclaration[id.name=/clamp/i] ReturnStatement CallExpression[callee.object.name=\'Math\'][callee.property.name=\'min\'] > CallExpression[callee.object.name=\'Math\'][callee.property.name=\'max\']:first-child',
        },
        {
          message: 'Avoid hand-written clamp logic. Use `clamp(value, lower, upper)` from `es-toolkit` instead.',
          selector: 'FunctionDeclaration[id.name=/clamp/i] ReturnStatement CallExpression[callee.object.name=\'Math\'][callee.property.name=\'max\'] > CallExpression[callee.object.name=\'Math\'][callee.property.name=\'min\']:first-child',
        },
        {
          message: 'Do not use namespace imports. Import the used APIs by name instead.',
          selector: 'ImportDeclaration[importKind!=\'type\'] ImportNamespaceSpecifier',
        },
        {
          message: 'Do not use namespace imports from `valibot`. Import the used Valibot APIs by name instead.',
          selector: 'ImportDeclaration[source.value=\'valibot\'] ImportNamespaceSpecifier',
        },
        'TSEnumDeclaration[const=true]',
        'TSExportAssignment',
      ],
    },
  },
  {
    ignores: [
      '**/*.md',
    ],
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [
            'type-builtin',
            'type-import',
            'type-internal',
            ['type-parent', 'type-sibling', 'type-index'],
            'default-value-builtin',
            'named-value-builtin',
            'value-builtin',
            'default-value-external',
            'named-value-external',
            'value-external',
            'default-value-internal',
            'named-value-internal',
            'value-internal',
            ['default-value-parent', 'default-value-sibling', 'default-value-index'],
            ['named-value-parent', 'named-value-sibling', 'named-value-index'],
            ['wildcard-value-parent', 'wildcard-value-sibling', 'wildcard-value-index'],
            ['value-parent', 'value-sibling', 'value-index'],
            'side-effect',
            'style',
          ],
          newlinesBetween: 1,
        },
      ],
    },
  },
)
