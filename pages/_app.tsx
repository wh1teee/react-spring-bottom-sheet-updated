import { inspect } from '@xstate/inspect'
import type { InferGetStaticPropsType } from 'next'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { capitalize } from '../docs/utils'
import { debugging } from '../src/utils'
import theme from '../docs/theme'
import createEmotionCache from '../docs/createEmotionCache'

import '../docs/style.css'
import '../src/style.css'

// Setup XState debugging, but only when in dev mode
// Note: @xstate/inspect v0.8.0 has warnings with XState v5, but functionality works
if (debugging) {
  inspect({
    url: 'https://statecharts.io/inspect',
    iframe: false,
  })
  console.log(
    '@xstate/inspect setup and running! Open https://statecharts.io/inspect in another tab to see the nitty gritty details. It also works with the Redux DevTools, but it lacks chart visualization.'
  )
}

export async function getStaticProps() {
  const [
    { version, description, homepage, name, meta = {} },
    { version: reactSpringVersion },
    { version: reactUseGestureVersion },
  ] = await Promise.all([
    import('../package.json'),
    import('@react-spring/web/package.json'),
    import('@use-gesture/react/package.json'),
  ])
  if (!meta['og:site_name']) {
    meta['og:site_name'] = capitalize(name)
  }

  return {
    props: {
      version,
      description,
      homepage,
      name,
      meta,
      reactSpringVersion,
      reactUseGestureVersion,
    },
  }
}

export type GetStaticProps = InferGetStaticPropsType<typeof getStaticProps>

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

export default function _AppPage(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="width=device-width,viewport-fit=cover" />
        <meta name="emotion-insertion-point" content="" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  )
}
