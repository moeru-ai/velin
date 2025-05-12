// https://github.com/unocss/unocss/blob/6d94efc56b0c966f25f46d8988b3fd30ebc189aa/packages/shared-docs/src/config.ts#L5

export const AsyncFunction = Object.getPrototypeOf(async () => { }).constructor

// https://github.com/unocss/unocss/blob/main/packages/shared-docs/src/config.ts
export const importObjectRegex = /import\s*\{([\s\S]*?)\}\s*from\s*(['"])([\w@/.:-]+)\2/g
export const importDefaultRegex = /import\s(.*?)\sfrom\s*(['"])([\w@/.:-]+)\2/g
export const exportDefaultRegex = /export default /
export const exportRegex = /export\s(.*?)\s/g
export const importRegex = /\bimport\s*\(/g

// New regex to handle `as` to `:` transformation
export const importAsRegex = /(\w+)\s+as\s+(\w+)/g
