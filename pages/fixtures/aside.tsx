import type { NextPage } from 'next'
import {  useRef, useState } from 'react'
import { useIntersectionObserver } from '../../src/hooks/useIntersectionObserver'
import Button from '../../docs/fixtures/Button'
import Code from '../../docs/fixtures/Code'
import Container from '../../docs/fixtures/Container'
import SheetContent from '../../docs/fixtures/SheetContent'
import { aside } from '../../docs/headings'
import MetaTags from '../../docs/MetaTags'
import { BottomSheet } from '../../src'
import type { GetStaticProps } from '../_app'

export { getStaticProps } from '../_app'

const AsideFixturePage: NextPage<GetStaticProps> = ({
  description,
  homepage,
  meta,
  name,
}) => {
  const [open, setOpen] = useState(true)
  const focusRef = useRef<HTMLButtonElement>()

  useIntersectionObserver(({ isIntersecting }) => {
    if (isIntersecting) {
      focusRef.current?.focus()
    }
  }, [focusRef])

  return (
    <>
      <MetaTags
        {...meta}
        name={name}
        description={description}
        homepage={homepage}
        title={aside}
      />
      <Container>
        <Button onClick={() => setOpen((open) => !open)} ref={focusRef}>
          {open ? 'Close' : 'Open'}
        </Button>
        <BottomSheet
          open={open}
          onDismiss={() => setOpen(false)}
          blocking={false}
          springConfig={{ mass: 4  }}
          header={
            <input
              className="mt-1 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-300 focus:bg-white focus:ring-0"
              type="text"
              placeholder="Text input field in a sticky header"
            />
          }
          snapPoints={({ maxHeight }) => [maxHeight / 4, maxHeight * 0.6]}
        >
          <SheetContent>
            <p>
              When <Code>blocking</Code> is <Code>false</Code> it's possible to
              use the Bottom Sheet as an height adjustable sidebar/panel.
            </p>
            <p>
              You can combine this with <Code>onDismissable</Code> to fine-tune
              the behavior you want.
            </p>
          </SheetContent>
        </BottomSheet>
      </Container>
    </>
  )
}

export default AsideFixturePage
