import Link from 'next/link'
import Container from '../../docs/fixtures/Container'

export default function PlaygroundIndex() {
  const examples = [
    {
      href: '/playground/spring-config-example',
      title: 'Spring Configuration',
      description: 'Customize animation behavior with different spring configurations',
      tags: ['Animation', 'Configuration', 'New in 4.0.0'],
      color: 'blue'
    },
    {
      href: '/playground/material-ui-integration',
      title: 'Material UI Integration',
      description: 'Solutions for focus conflicts and portal component integration',
      tags: ['Material UI', 'Focus Management', 'Integration'],
      color: 'purple'
    },
    {
      href: '/playground/react19-compatibility',
      title: 'React 19 Compatibility',
      description: 'Demonstration of React 19 features and concurrent rendering',
      tags: ['React 19', 'Concurrent Features', 'Performance'],
      color: 'green'
    },
    {
      href: '/playground/memory-leak-prevention',
      title: 'Memory Leak Prevention',
      description: 'Enhanced cleanup patterns and memory management examples',
      tags: ['Memory Management', 'Best Practices', 'New in 4.0.0'],
      color: 'red'
    },
    {
      href: '/playground/favicons',
      title: 'Favicons Test',
      description: 'Testing page for favicon configurations',
      tags: ['Testing', 'Utility'],
      color: 'gray'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      gray: 'bg-gray-50 border-gray-200 text-gray-900'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const getTagColor = (tag: string) => {
    if (tag.includes('New in 4.0.0')) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (tag.includes('React 19')) return 'bg-green-100 text-green-800 border-green-300'
    if (tag.includes('Performance')) return 'bg-blue-100 text-blue-800 border-blue-300'
    if (tag.includes('Integration')) return 'bg-purple-100 text-purple-800 border-purple-300'
    return 'bg-gray-100 text-gray-800 border-gray-300'
  }

  return (
    <Container>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Playground & Examples
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Interactive examples demonstrating the features and capabilities of 
            react-spring-bottom-sheet-updated 4.0.0
          </p>
        </div>

        {/* What's New Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            🚀 What's New in 4.0.0
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">New Features</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• React 19 full compatibility</li>
                <li>• Enhanced spring configuration</li>
                <li>• Improved memory leak prevention</li>
                <li>• Better focus management</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Updated Dependencies</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• XState v5 integration</li>
                <li>• @react-spring/web v10</li>
                <li>• @use-gesture/react v10</li>
                <li>• Modern TypeScript support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Examples Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {examples.map((example) => (
            <Link 
              key={example.href} 
              href={example.href}
              className="group block"
            >
              <div className={`${getColorClasses(example.color)} border rounded-lg p-6 h-full transition-all duration-200 group-hover:shadow-lg group-hover:scale-105`}>
                <h3 className="text-lg font-semibold mb-3 group-hover:underline">
                  {example.title}
                </h3>
                
                <p className="text-sm opacity-80 mb-4 line-clamp-3">
                  {example.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {example.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-1 text-xs font-medium rounded border ${getTagColor(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="mt-4 text-sm font-medium opacity-70 group-hover:opacity-100">
                  View Example →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Core Fixtures Section */}
        <div className="mt-12 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Core Examples
          </h2>
          <p className="text-gray-600 mb-6">
            Fundamental usage patterns and feature demonstrations
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { href: '/fixtures/simple', title: 'Simple', desc: 'Basic usage patterns' },
              { href: '/fixtures/scrollable', title: 'Scrollable', desc: 'Multiple snap points' },
              { href: '/fixtures/sticky', title: 'Sticky', desc: 'Headers and footers' },
              { href: '/fixtures/aside', title: 'Non-blocking', desc: 'Aside mode' },
            ].map((fixture) => (
              <Link 
                key={fixture.href} 
                href={fixture.href}
                className="group block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
              >
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                  {fixture.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {fixture.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Advanced Examples */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Advanced Examples
          </h2>
          
          <div className="space-y-4">
            <Link 
              href="/fixtures/experiments"
              className="group block p-4 border border-gray-200 bg-white rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
            >
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 mb-2">
                Experiments & Edge Cases
              </h3>
              <p className="text-sm text-gray-600">
                Comprehensive testing suite with 12+ different scenarios including 
                performance optimization, custom configurations, and advanced usage patterns.
              </p>
              <div className="flex gap-2 mt-3">
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300 rounded">
                  Performance
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300 rounded">
                  Edge Cases
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300 rounded">
                  Testing
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <div className="flex justify-center gap-4">
            <Link 
              href="/fixtures/simple"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              View Simple Example
            </Link>
            <Link 
              href="/"
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Container>
  )
}