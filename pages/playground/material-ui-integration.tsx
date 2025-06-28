import React, { useState } from 'react'
import { BottomSheet } from '../../src'
import Button from '../../docs/fixtures/Button'

// This example demonstrates integration with Material UI components
// Note: This is a mock implementation since we don't have @mui/material as a dependency
// In a real project, you would import these from '@mui/material'

// Mock Material UI components for demonstration
const MockDrawer = ({ 
  open, 
  onClose, 
  disableEnforceFocus, 
  children 
}: {
  open: boolean
  onClose: () => void
  disableEnforceFocus?: boolean
  children: React.ReactNode
}) => {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform">
        <div className="p-4">
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              disableEnforceFocus: {String(disableEnforceFocus)}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

const MockSelect = ({ 
  value, 
  onChange, 
  children, 
  disabled 
}: {
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
}) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className="w-full p-2 border border-gray-300 rounded bg-white disabled:bg-gray-100"
  >
    {children}
  </select>
)

const MockMenuItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
)

export default function MaterialUIIntegrationExample() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectValue, setSelectValue] = useState('option1')
  const [focusTrapEnabled, setFocusTrapEnabled] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Material UI Integration Examples
        </h1>
        
        <div className="space-y-8">
          {/* Example 1: Focus Conflicts with Drawer */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              1. Focus Conflicts with Material UI Drawer
            </h2>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Problem:</h3>
              <p className="text-blue-700 text-sm">
                When both Drawer and BottomSheet try to manage focus, you get call stack overflow errors.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <h3 className="font-medium text-green-900 mb-2">Solution:</h3>
              <p className="text-green-700 text-sm mb-2">
                Set <code className="bg-green-100 px-1 rounded">disableEnforceFocus={`{sheetOpen}`}</code> on the Drawer when BottomSheet is open.
              </p>
              <pre className="bg-green-100 p-2 rounded text-sm font-mono overflow-x-auto">
{`<Drawer 
  open={drawerOpen}
  disableEnforceFocus={sheetOpen} // Disable when sheet is open
>
  {/* Drawer content */}
</Drawer>`}
              </pre>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setDrawerOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Open Drawer
              </Button>
              <Button
                onClick={() => setSheetOpen(true)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Open Bottom Sheet
              </Button>
            </div>
          </div>

          {/* Example 2: Portal Components Integration */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              2. Portal-Rendered Components (Select, Tooltips, etc.)
            </h2>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Problem:</h3>
              <p className="text-blue-700 text-sm">
                Components that render to portals (like Material UI Select) may not receive clicks properly.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <h3 className="font-medium text-green-900 mb-2">Solution:</h3>
              <p className="text-green-700 text-sm mb-2">
                Set <code className="bg-green-100 px-1 rounded">initialFocusRef={`{false}`}</code> on BottomSheet to disable focus trap.
              </p>
              <pre className="bg-green-100 p-2 rounded text-sm font-mono overflow-x-auto">
{`<BottomSheet 
  open={open}
  initialFocusRef={false} // Disable focus trap for portal components
>
  <Select>
    <MenuItem value="option1">Option 1</MenuItem>
  </Select>
</BottomSheet>`}
              </pre>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={focusTrapEnabled}
                  onChange={(e) => setFocusTrapEnabled(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Enable focus trap (try interacting with Select below)</span>
              </label>
            </div>

            <Button
              onClick={() => setSheetOpen(true)}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Open Sheet with Select Component
            </Button>
          </div>

          {/* Example 3: Performance Tips */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              3. Performance Optimization Tips
            </h2>
            
            <div className="space-y-4 text-sm text-gray-700">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h3 className="font-medium text-yellow-900 mb-2">Memory Management:</h3>
                <p className="text-yellow-700">
                  The library automatically unmounts when <code>open={`{false}`}</code> to prevent memory leaks.
                  Always provide an <code>onDismiss</code> callback for proper cleanup.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-900 mb-2">Best Practices:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Use <code>React.memo()</code> for heavy sheet content</li>
                  <li>Lazy load sheet content when possible</li>
                  <li>Customize <code>springConfig</code> for your use case</li>
                  <li>The component respects <code>prefers-reduced-motion</code> automatically</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Material UI Drawer */}
      <MockDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        disableEnforceFocus={sheetOpen}
      >
        <h3 className="font-medium mb-4">Drawer Content</h3>
        <p className="text-sm text-gray-600 mb-4">
          This drawer has disableEnforceFocus set to {String(sheetOpen)}
        </p>
        <Button
          onClick={() => setDrawerOpen(false)}
          className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Close Drawer
        </Button>
      </MockDrawer>

      {/* Bottom Sheet with conditional focus trap */}
      <BottomSheet
        open={sheetOpen}
        onDismiss={() => setSheetOpen(false)}
        initialFocusRef={focusTrapEnabled ? undefined : false}
        snapPoints={({ maxHeight }) => [maxHeight * 0.4, maxHeight * 0.8]}
        header={
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Integration Example
            </h3>
            <p className="text-sm text-gray-600">
              Focus trap: {focusTrapEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        }
      >
        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material UI Select (Portal-rendered):
              </label>
              <MockSelect
                value={selectValue}
                onChange={setSelectValue}
                disabled={focusTrapEnabled}
              >
                <MockMenuItem value="option1">Option 1</MockMenuItem>
                <MockMenuItem value="option2">Option 2</MockMenuItem>
                <MockMenuItem value="option3">Option 3</MockMenuItem>
              </MockSelect>
              {focusTrapEnabled && (
                <p className="text-xs text-red-600 mt-1">
                  Select is disabled because focus trap is enabled. 
                  Uncheck the checkbox above to test portal component interaction.
                </p>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-medium text-blue-900 mb-2">How this works:</h4>
              <p className="text-blue-700 text-sm">
                With <code>initialFocusRef={`{false}`}</code>, the focus trap is disabled, 
                allowing you to interact with portal-rendered components like Material UI Select, 
                Tooltips, and Popovers.
              </p>
            </div>

            <Button
              onClick={() => setSheetOpen(false)}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close Sheet
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}