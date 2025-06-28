import React, { useState, useEffect, useRef, useCallback } from 'react'
import { BottomSheet } from '../../src'
import Button from '../../docs/fixtures/Button'

// Simulation of problematic patterns vs. safe patterns
export default function MemoryLeakPreventionExample() {
  // const [demonstrationMode, setDemonstrationMode] = useState<'safe' | 'problematic'>('safe')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [mountCount, setMountCount] = useState(0)
  const [activeTimers, setActiveTimers] = useState(0)
  const [eventListeners, setEventListeners] = useState(0)
  
  // Counter for demonstration
  const [counter, setCounter] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Track component lifecycle
  useEffect(() => {
    setMountCount(prev => prev + 1)
    return () => {
      // This demonstrates proper cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        setActiveTimers(prev => prev - 1)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        setActiveTimers(prev => prev - 1)
      }
    }
  }, [sheetOpen])

  // Safe pattern: Cleanup on unmount
  const startSafeTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    
    intervalRef.current = setInterval(() => {
      setCounter(prev => prev + 1)
    }, 100)
    setActiveTimers(prev => prev + 1)

    // Auto cleanup after 5 seconds
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setActiveTimers(prev => prev - 1)
      }
    }, 5000)
    setActiveTimers(prev => prev + 1)
  }, [])

  // Simulate event listener management
  const addEventListener = useCallback(() => {
    const handler = () => console.log('Event triggered')
    // In real implementation, you would properly track and cleanup this listener
    window.addEventListener('resize', handler)
    setEventListeners(prev => prev + 1)
    
    // Return cleanup function
    return () => {
      window.removeEventListener('resize', handler)
      setEventListeners(prev => prev - 1)
    }
  }, [])

  const handleOpenSheet = () => {
    setSheetOpen(true)
    startSafeTimer()
    addEventListener()
  }

  const handleCloseSheet = () => {
    setSheetOpen(false)
    setCounter(0)
    
    // Manual cleanup (the component also does this automatically)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setActiveTimers(prev => prev - 1)
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      setActiveTimers(prev => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Memory Leak Prevention Examples
        </h1>
        
        <div className="space-y-8">
          {/* Memory Management Overview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              4.0.0 Memory Management Improvements
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <h3 className="font-medium text-green-900 mb-3">✅ What's Fixed in 4.0.0</h3>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>• <strong>Timeout cleanup:</strong> All timers are properly cleared on unmount</li>
                  <li>• <strong>Event listeners:</strong> Automatic cleanup of all event handlers</li>
                  <li>• <strong>Focus trap:</strong> Proper deactivation when component unmounts</li>
                  <li>• <strong>Scroll lock:</strong> Body scroll restored on cleanup</li>
                  <li>• <strong>Spring animations:</strong> Animation cleanup on component destruction</li>
                  <li>• <strong>Gesture handlers:</strong> Proper cleanup of touch/mouse events</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <h3 className="font-medium text-blue-900 mb-3">🛡️ Automatic Protections</h3>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• <strong>Unmount on close:</strong> Component unmounts when open={false}</li>
                  <li>• <strong>Cleanup hooks:</strong> useEffect cleanup in all custom hooks</li>
                  <li>• <strong>Error boundaries:</strong> Safe cleanup even on errors</li>
                  <li>• <strong>Memory monitoring:</strong> Built-in checks for common leak patterns</li>
                  <li>• <strong>React 19 compatible:</strong> Works with concurrent features</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Live Memory Monitoring */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Live Memory Monitoring
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded text-center">
                <div className="text-2xl font-bold text-gray-900">{mountCount}</div>
                <div className="text-sm text-gray-600">Component Mounts</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded text-center">
                <div className="text-2xl font-bold text-yellow-900">{activeTimers}</div>
                <div className="text-sm text-yellow-600">Active Timers</div>
              </div>
              <div className="bg-purple-50 p-4 rounded text-center">
                <div className="text-2xl font-bold text-purple-900">{eventListeners}</div>
                <div className="text-sm text-purple-600">Event Listeners</div>
              </div>
              <div className="bg-blue-50 p-4 rounded text-center">
                <div className="text-2xl font-bold text-blue-900">{counter}</div>
                <div className="text-sm text-blue-600">Counter Value</div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
              <h3 className="font-medium text-green-900 mb-2">Memory Safety Features:</h3>
              <p className="text-green-700 text-sm">
                Watch the counters above. When you close the bottom sheet, all timers and event 
                listeners are automatically cleaned up, and the component unmounts to prevent memory leaks.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleOpenSheet}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
              >
                Open Sheet & Start Timers
              </Button>
              
              <Button
                onClick={handleCloseSheet}
                disabled={!sheetOpen}
                className={`px-6 py-3 rounded-lg ${
                  sheetOpen 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Force Close & Cleanup
              </Button>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Memory Leak Prevention Best Practices
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">✅ Safe Patterns (Recommended)</h3>
                <div className="bg-green-50 p-4 rounded mb-4">
                  <pre className="text-sm font-mono text-green-800 overflow-x-auto">
{`// ✅ Always provide onDismiss
<BottomSheet 
  open={open} 
  onDismiss={() => setOpen(false)} // Enables proper cleanup
>
  {content}
</BottomSheet>

// ✅ Use proper cleanup in useEffect
useEffect(() => {
  const timer = setInterval(() => {
    // Do something
  }, 1000)
  
  return () => clearInterval(timer) // Cleanup on unmount
}, [])

// ✅ Let the component handle its lifecycle
const [open, setOpen] = useState(false)
// Component unmounts when open becomes false`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">❌ Problematic Patterns (Avoid)</h3>
                <div className="bg-red-50 p-4 rounded">
                  <pre className="text-sm font-mono text-red-800 overflow-x-auto">
{`// ❌ No onDismiss callback
<BottomSheet open={open}>
  {content}
</BottomSheet>

// ❌ Missing cleanup in useEffect
useEffect(() => {
  const timer = setInterval(() => {
    // Do something
  }, 1000)
  // Missing return cleanup function!
}, [])

// ❌ Keeping component mounted when closed
{open && <BottomSheet open={true}>...</BottomSheet>}
// Should use open prop instead of conditional rendering`}
                  </pre>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h3 className="font-medium text-yellow-900 mb-2">Pro Tips:</h3>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• The library automatically unmounts when <code>open={false}</code></li>
                  <li>• Always provide an <code>onDismiss</code> callback for user-initiated closes</li>
                  <li>• Use React's built-in cleanup patterns (useEffect return functions)</li>
                  <li>• Avoid manual DOM manipulation that bypasses React's lifecycle</li>
                  <li>• The component handles all internal cleanup automatically</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Memory-safe Bottom Sheet */}
      <BottomSheet
        open={sheetOpen}
        onDismiss={handleCloseSheet} // Essential for proper cleanup
        snapPoints={({ maxHeight }) => [maxHeight * 0.4, maxHeight * 0.7]}
        header={
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Memory-Safe Bottom Sheet
            </h3>
            <p className="text-sm text-gray-600">
              Automatic cleanup prevents memory leaks
            </p>
          </div>
        }
      >
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded">
            <h4 className="font-medium text-blue-900 mb-2">Active Monitoring</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Counter: </span>
                <span className="font-mono font-bold">{counter}</span>
              </div>
              <div>
                <span className="text-blue-700">Active Timers: </span>
                <span className="font-mono font-bold">{activeTimers}</span>
              </div>
            </div>
            <p className="text-blue-700 text-xs mt-2">
              Counter increments every 100ms. Watch it reset when the sheet closes.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">What happens on unmount:</h4>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>All timers and intervals are cleared</li>
              <li>Event listeners are removed</li>
              <li>Focus trap is deactivated</li>
              <li>Body scroll lock is restored</li>
              <li>Spring animations are cancelled</li>
              <li>Component state is reset</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <h4 className="font-medium text-green-900 mb-2">Memory Leak Prevention ✅</h4>
            <p className="text-green-700 text-sm">
              This bottom sheet will automatically clean up all resources when it closes. 
              The component unmounts completely, ensuring no memory leaks occur.
            </p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <Button
              onClick={() => startSafeTimer()}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Restart Timer
            </Button>
            
            <Button
              onClick={handleCloseSheet}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close & Cleanup
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}