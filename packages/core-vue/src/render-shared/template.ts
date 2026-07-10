import type { SFCDescriptor } from '@vue/compiler-sfc'

// Check if we can use compile template as inlined render function
// inside <script setup>. This can only be done for build because
// inlined template cannot be individually hot updated.
export function isUseInlineTemplate(
  descriptor: SFCDescriptor,
): boolean {
  return (
    !!descriptor.scriptSetup
    && !descriptor.template?.src
  )
}
