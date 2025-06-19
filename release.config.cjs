module.exports = {
  repositoryUrl: 'https://github.com/wh1teee/react-spring-bottom-sheet-updated',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        tarballDir: 'release',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: 'release/*.tgz',
      },
    ],
    '@semantic-release/git',
  ],
  preset: 'angular',
  branches: [
    { name: 'main' },
    { name: 'develop', prerelease: 'beta' }
  ],
}
