import React, { useRef, useState, useTransition, useDeferredValue, startTransition } from 'react'
import { BottomSheet, type BottomSheetRef } from '../../src'
import Button from '../../docs/fixtures/Button'

// React 19 features demonstration
export default function React19CompatibilityExample() {
  const [open, setOpen] = useState(false)
  const [heavyData, setHeavyData] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending] = useTransition()
  const sheetRef = useRef<BottomSheetRef>(null)
  
  // React 19: useDeferredValue for performance optimization
  const deferredSearchQuery = useDeferredValue(searchQuery)
  
  // Simulate heavy data processing
  const filteredData = heavyData.filter(item => 
    item.toLowerCase().includes(deferredSearchQuery.toLowerCase())
  )

  const generateHeavyData = () => {
    startTransition(() => {
      const data = Array.from({ length: 1000 }, (_, i) => `Item ${i + 1} - ${Math.random().toString(36).substr(2, 9)}`)
      setHeavyData(data)
      setOpen(true)
    })
  }

  const handleSnapToTop = () => {
    // React 19 compatible ref usage
    if (sheetRef.current) {
      sheetRef.current.snapTo(({ maxHeight }) => maxHeight * 0.9)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          React 19 Compatibility Examples
        </h1>
        
        <div className="space-y-8">
          {/* React 19 Features Overview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              React 19 Compatibility Features
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <h3 className="font-medium text-green-900 mb-2">✅ What's Supported</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Proper ref forwarding with RefObject</li>
                  <li>• useTransition for smooth interactions</li>
                  <li>• useDeferredValue for performance</li>
                  <li>• Automatic batching of state updates</li>
                  <li>• Concurrent rendering patterns</li>
                  <li>• Enhanced effect timing</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <h3 className="font-medium text-blue-900 mb-2">🚀 New Optimizations</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Improved memory leak prevention</li>
                  <li>• Better cleanup on unmount</li>
                  <li>• Enhanced gesture handling</li>
                  <li>• Smoother animations</li>
                  <li>• Reduced re-renders</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h3 className="font-medium text-yellow-900 mb-2">Migration Notes:</h3>
              <p className="text-yellow-700 text-sm">
                No code changes needed! The library handles React 19 compatibility automatically. 
                Just update your React version and @types/react.
              </p>
            </div>
          </div>

          {/* Concurrent Features Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Concurrent Features Demo
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">useTransition with Heavy Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This example uses <code className="bg-gray-100 px-1 rounded">useTransition</code> to 
                  generate 1000 items without blocking the UI, then opens a bottom sheet with the data.
                </p>
                
                <Button
                  onClick={generateHeavyData}
                  disabled={isPending}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isPending 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isPending ? 'Generating Data...' : 'Generate Heavy Data & Open Sheet'}
                </Button>
              </div>

              {heavyData.length > 0 && (
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-700">
                    ✅ Generated {heavyData.length} items using concurrent rendering
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Ref Forwarding Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Enhanced Ref Handling
            </h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-medium text-blue-900 mb-2">React 19 Ref Improvements:</h3>
                <p className="text-blue-700 text-sm mb-3">
                  React 19 has stricter ref forwarding rules. Our library properly implements 
                  <code className="bg-blue-100 mx-1 px-1 rounded">RefObject&lt;BottomSheetRef&gt;</code> 
                  for type-safe imperative access.
                </p>
                
                <pre className="bg-blue-100 p-3 rounded text-sm font-mono overflow-x-auto">
{`const sheetRef = useRef<BottomSheetRef>(null)

// Type-safe access to sheet methods
sheetRef.current?.snapTo(({ maxHeight }) => maxHeight)
sheetRef.current?.height // Current height`}
                </pre>
              </div>

              <Button
                onClick={handleSnapToTop}
                disabled={!open}
                className={`px-4 py-2 rounded transition-colors ${
                  open 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Snap to Top (Ref Method)
              </Button>
            </div>
          </div>

          {/* Performance Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Performance Optimizations
            </h2>
            
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-900 mb-2">Built-in Optimizations:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Automatic cleanup:</strong> Prevents memory leaks with improved timeout handling</li>
                <li>• <strong>Reduced renders:</strong> Optimized state updates and memoization</li>
                <li>• <strong>Gesture performance:</strong> Better integration with @use-gesture/react 10</li>
                <li>• <strong>Spring animations:</strong> Enhanced with @react-spring/web 10</li>
                <li>• <strong>Concurrent safety:</strong> Works perfectly with React 19's concurrent features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* React 19 Compatible Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        open={open}
        onDismiss={() => setOpen(false)}
        snapPoints={({ maxHeight }) => [maxHeight * 0.3, maxHeight * 0.6, maxHeight * 0.9]}
        header={
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              React 19 Features Demo
            </h3>
            <p className="text-sm text-gray-600">
              Using concurrent rendering and enhanced ref handling
            </p>
          </div>
        }
      >
        <div className="p-6 space-y-4">
          {/* useDeferredValue Demo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search with useDeferredValue:
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery !== deferredSearchQuery && (
              <p className="text-xs text-gray-500 mt-1">
                Filtering... (deferred value optimizes performance)
              </p>
            )}
          </div>

          {/* Filtered Results */}
          <div className="max-h-64 overflow-y-auto bg-gray-50 rounded p-3">
            <div className="text-sm text-gray-600 mb-2">
              Showing {filteredData.length} of {heavyData.length} items
            </div>
            
            {filteredData.length === 0 && searchQuery ? (
              <p className="text-gray-500 text-center py-4">No items match your search</p>
            ) : (
              <div className="space-y-1">
                {filteredData.slice(0, 50).map((item) => (
                  <div key={item} className="p-2 bg-white rounded text-sm">
                    {item}
                  </div>
                ))}
                {filteredData.length > 50 && (
                  <div className="text-xs text-gray-500 text-center py-2">
                    ... and {filteredData.length - 50} more items
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <h4 className="font-medium text-green-900 mb-2">React 19 Benefits in Action:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>useTransition:</strong> Non-blocking data generation</li>
              <li>• <strong>useDeferredValue:</strong> Smooth search without lag</li>
              <li>• <strong>Enhanced refs:</strong> Type-safe imperative API access</li>
              <li>• <strong>Automatic batching:</strong> Efficient state updates</li>
              <li>• <strong>Concurrent rendering:</strong> UI stays responsive</li>
            </ul>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <Button
              onClick={handleSnapToTop}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Snap to Top
            </Button>
            <Button
              onClick={() => setOpen(false)}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close Sheet
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}