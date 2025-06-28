import { aside, scrollable, simple, sticky } from '../docs/headings'
import Footer from '../docs/Footer'
import Hero from '../docs/Hero'
import MetaTags from '../docs/MetaTags'
import Nugget from '../docs/Nugget'
import StickyNugget from '../docs/StickyNugget'
import Link from 'next/link'
import type { NextPage } from 'next'
import type { GetStaticProps } from './_app'

export { getStaticProps } from './_app'

const IndexPage: NextPage<GetStaticProps> = ({
  name,
  version,
  description,
  homepage,
  meta,
  reactSpringVersion,
  reactUseGestureVersion,
}) => (
  <>
    <MetaTags
      {...meta}
      name={name}
      description={description}
      homepage={homepage}
    />
    <main>
      <Hero />
      <div className="max-w-5xl mx-auto py-20 px-8 grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-10">
        <Nugget
          heading="Modern"
          lead="Built on top of react-spring and @use-gesture/react, following best practices for minimal rerenders and only animating CSS properties that can be done on the GPU when possible."
        />
        <Nugget
          heading="Flexible"
          lead="Can be used like a blocking dialog that require the user to make a choice before it can be closed, or like floating bottom panel. It automatically adapts to the dimensions of the content you put in it."
        />
        <Nugget
          heading="CSS Variables"
          lead="By using CSS Custom Properties you're not limited by what is spring animated by default. You can change which elements animations are applied to without writing any JS."
        />
      </div>
      <div className="max-w-5xl mx-auto pt-20 px-8 grid grid-flow-row">
        <StickyNugget
          heading={simple}
          lead={[
            "It should be just as intuitive to close the bottom sheet no matter if you're using touch, keyboard navigation, a screen reader or a mouse cursor.",
            'This example is setup to use a single snap point, set to the content height. The sheet adjusts itself accordingly if the content changes.',
          ]}
          example="/fixtures/simple"
        />
        <StickyNugget
          flip
          bg="bg-gray-200"
          heading={scrollable}
          lead={[
            "The snap points api lets you control exactly what positions the sheet can be in. If the user drag the sheet out of bounds you'll get a rubber band effect, and it gently slides into position on release. You can even flick it from top to bottom with some speed, if that's your jam.",
            'By default the sheet will try to use enough height to avoid a scrolling overflow.',
            "And finally, it shows how the sheet behaves when you don't provide the onDismiss callback, note how you can't close it.",
          ]}
          example="/fixtures/scrollable"
        />
        <StickyNugget
          bg="bg-gray-300"
          heading={sticky}
          lead={[
            "Can be really tricky to implement in a performant way. Luckily with this component you don't have to worry about that.",
            'By adding a header the touch hit target is much larger, making it more pleasant to use.',
            "For those big thicc phones they'll be happy to find that you can swipe on the sticky footer to adust the height, making one-handed usage a bit easier.",
            'On top of all that see how it remembers the last snap position it had when closing, and restore it when reopened.',
            'One more thing, the opening transition is interruptible, you can start dragging it right away.',
          ]}
          example="/fixtures/sticky"
        />
        <StickyNugget
          flip
          bg="bg-gray-400"
          text="text-900"
          heading={aside}
          lead={[
            "Examples so far have all been with blocking=true, which is the default state. It's comparable to a blocking modal dialog, you can't interract with the rest of the page until the dialog closes.",
            "This mode can be turned off and changes the look and feel of the sheet to fit scenarios where it's used as you would a draggable sidebar.",
            'Or as an search overlay over a map perhaps. ',
          ]}
          example="/fixtures/aside"
        />
      </div>
      
      {/* New Features Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-20">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🚀 New in Version 4.0.0
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Enhanced with React 19 support, improved memory management, and modern dependency updates
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">React 19 Compatible</h3>
              <p className="text-sm text-gray-600">Full support for concurrent features, enhanced ref handling, and modern React patterns</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">Memory Leak Prevention</h3>
              <p className="text-sm text-gray-600">Enhanced cleanup logic prevents timeout-related memory leaks and ensures proper resource management</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-900 mb-2">Spring Configuration</h3>
              <p className="text-sm text-gray-600">New springConfig prop allows fine-tuned control over animation behavior and feel</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Link 
              href="/playground" 
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Explore New Features
            </Link>
            <Link 
              href="/playground/material-ui-integration" 
              className="bg-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-600 transition-colors"
            >
              Integration Examples
            </Link>
          </div>
        </div>
      </div>
    </main>
    <Footer
      version={version}
      reactSpringVersion={reactSpringVersion}
      reactUseGestureVersion={reactUseGestureVersion}
    />
  </>
)

export default IndexPage
