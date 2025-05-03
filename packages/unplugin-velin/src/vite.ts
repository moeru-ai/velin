/**
 * This entry file is for Vite plugin.
 *
 * @module
 */

import { unplugin } from './'

/**
 * Vite plugin
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import Unused from 'unplugin-unused/vite'
 *
 * export default defineConfig({
 *   plugins: [Unused()],
 * })
 * ```
 */
const vite = unplugin.vite as typeof unplugin.vite
export default vite
export { vite as 'module.exports' }
export type { Options } from './types'
