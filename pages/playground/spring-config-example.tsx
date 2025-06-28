import React, { useState } from 'react'
import { BottomSheet, type BottomSheetSpringConfig } from '../../src'
import Button from '../../docs/fixtures/Button'

export default function SpringConfigExample() {
  const [open, setOpen] = useState(false)
  const [configType, setConfigType] = useState<'default' | 'bouncy' | 'fast' | 'smooth'>('default')

  const springConfigs: Record<typeof configType, BottomSheetSpringConfig | undefined> = {
    default: undefined, // Use default config
    bouncy: {
      tension: 80,
      friction: 60,
      mass: 2,
    },
    fast: {
      tension: 300,
      friction: 30,
      mass: 0.8,
    },
    smooth: {
      tension: 120,
      friction: 50,
      mass: 1.5,
      precision: 0.001,
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Spring Config Example
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Try Different Spring Configurations
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.keys(springConfigs).map((config) => (
              <Button
                key={config}
                onClick={() => setConfigType(config as typeof configType)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
                  ${configType === config 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {config.charAt(0).toUpperCase() + config.slice(1)}
              </Button>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Current Config:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(springConfigs[configType] || 'Default', null, 2)}
            </pre>
          </div>

          <Button 
            onClick={() => setOpen(true)}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Open Bottom Sheet
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Configuration Details
          </h2>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <strong>Default:</strong> Uses the library's default spring configuration
            </div>
            <div>
              <strong>Bouncy:</strong> Lower tension and friction with higher mass for a bouncy effect
            </div>
            <div>
              <strong>Fast:</strong> High tension with low friction for quick, snappy animations
            </div>
            <div>
              <strong>Smooth:</strong> Balanced settings with higher precision for smooth motion
            </div>
          </div>
        </div>
      </div>

      <BottomSheet
        open={open}
        onDismiss={() => setOpen(false)}
        springConfig={springConfigs[configType]}
        snapPoints={({ maxHeight }) => [maxHeight * 0.3, maxHeight * 0.6, maxHeight * 0.9]}
        header={
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {configType.charAt(0).toUpperCase() + configType.slice(1)} Animation
            </h3>
            <p className="text-sm text-gray-600">
              This sheet uses {configType} spring configuration
            </p>
          </div>
        }
      >
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <h4 className="font-medium text-blue-900 mb-2">Spring Configuration Active</h4>
            <p className="text-blue-700 text-sm">
              Notice how the animation feels different based on the selected configuration.
              Try dragging the sheet up and down to feel the difference!
            </p>
          </div>

          {springConfigs[configType] && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Current Config Values:</h5>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(springConfigs[configType]!).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-mono text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <p className="text-gray-700">
              The spring configuration affects how the bottom sheet animates when:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
              <li>Opening and closing</li>
              <li>Snapping to different heights</li>
              <li>Responding to drag gestures</li>
              <li>Resizing due to content changes</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={() => setOpen(false)}
              className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Close Sheet
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
} 