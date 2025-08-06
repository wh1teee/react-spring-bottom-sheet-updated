import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const importFrom = resolve(__dirname, './defaults.json')

export default {
  plugins: {
    tailwindcss: {},
    'postcss-preset-env': { 
      importFrom, 
      stage: 2, // Balance between modern features and broad compatibility
    },
    'postcss-inline-svg': {
      paths: [resolve(__dirname, 'docs')],
      svgo: {
        plugins: [
          'preset-default',
          {
            name: 'removeUnknownsAndDefaults',
            params: {
              // On by default, disabled as it breaks the frame.svg
              unknownAttrs: false,
            },
          },
        ],
      },
    },
  },
}
