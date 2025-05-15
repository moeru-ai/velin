export class File {
  compiled = {
    js: '',
    css: '',
    ssr: '',
  }

  constructor(
    public filename: string,
    public code = '',
    public hidden = false,
  ) {}

  get language() {
    if (this.filename.endsWith('.vue')) {
      return 'vue'
    }
    if (this.filename.endsWith('.html')) {
      return 'html'
    }
    if (this.filename.endsWith('.css')) {
      return 'css'
    }
    if (this.filename.endsWith('.ts') || this.filename.endsWith('.mts')) {
      return 'typescript'
    }
    if (this.filename.endsWith('.js') || this.filename.endsWith('.mjs')) {
      return 'javascript'
    }

    return 'javascript'
  }
}
