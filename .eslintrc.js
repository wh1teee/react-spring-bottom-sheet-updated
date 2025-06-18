const { version: reactVersion } = require('react/package.json')

module.exports = {
  extends: ['next/core-web-vitals'],
  settings: { react: { version: reactVersion } },
  rules: {
    'jsx-a11y/anchor-is-valid': ['off'],
    'react/no-unescaped-entities': ['off'],
    '@next/next/no-img-element': ['warn'], // Keep as warning instead of error for playground
  },
}
