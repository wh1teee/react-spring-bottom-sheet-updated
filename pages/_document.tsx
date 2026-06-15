import { Head, Html, Main, NextScript } from 'next/document'
import type { ComponentType } from 'react'

const ga = process.env.NEXT_PUBLIC_GA

const HeadComponent = Head as unknown as ComponentType<
  React.PropsWithChildren<Record<string, unknown>>
>
const NextScriptComponent = NextScript as unknown as ComponentType<
  Record<string, unknown>
>

export default function _DocumentPage() {
  return (
    <Html>
      <HeadComponent>
        {ga && (
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
          />
        )}
        {ga && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga}');
          `,
            }}
          />
        )}
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Source+Sans+Pro&display=swap"
          rel="stylesheet"
        />
        <link
          rel="alternate icon"
          type="image/png"
          href="/favicon-rounded-64w.png"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon-rounded.svg" />
      </HeadComponent>
      <body>
        <Main />
        <NextScriptComponent />
      </body>
    </Html>
  )
}
