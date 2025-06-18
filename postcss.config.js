import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const importFrom = resolve(__dirname, './defaults.json')

export default {
  plugins: {
    tailwindcss: {},
    'postcss-custom-properties-fallback': { importFrom },
    // @TODO add importFrom to preset-env when CSS snapshot testing is in place
    'postcss-preset-env': { importFrom, stage: 0 },
    'postcss-import-svg': {
      paths: [resolve(__dirname, 'docs')],
      svgo: {
        plugins: [
          {
            removeUnknownsAndDefaults: {
              // On by default, disabled as it breaks the frame.svg
              unknownAttrs: false,
            },
          },
        ],
      },
    },
    autoprefixer: {},
  },
}
