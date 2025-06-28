import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BottomSheet } from '../BottomSheet'

describe('BottomSheet Accessibility', () => {
  it('should render with proper ARIA attributes when open', () => {
    const { container } = render(
      <BottomSheet 
        open={true}
        onDismiss={() => {}}
        header={<h2>Accessible Header</h2>}
      >
        <p>This is accessible content with proper semantic markup.</p>
        <button type="button">Accessible Button</button>
      </BottomSheet>
    )

    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('should render complex content with proper semantic structure', () => {
    const { container } = render(
      <BottomSheet 
        open={true}
        onDismiss={() => {}}
        header={
          <header>
            <h1>Main Heading</h1>
            <p>Subtitle text</p>
          </header>
        }
        footer={
          <footer>
            <button type="button">Cancel</button>
            <button type="button">Confirm</button>
          </footer>
        }
      >
        <main>
          <section>
            <h2>Section Heading</h2>
            <p>Section content with <a href="#link">accessible link</a>.</p>
          </section>
        </main>
      </BottomSheet>
    )

    // Check that semantic elements are rendered
    expect(container.querySelector('header')).toBeTruthy()
    expect(container.querySelector('main')).toBeTruthy()
    expect(container.querySelector('section')).toBeTruthy()
    expect(container.querySelector('footer')).toBeTruthy()
  })

  it('should handle custom ARIA attributes correctly', () => {
    const { container } = render(
      <BottomSheet 
        open={true}
        onDismiss={() => {}}
        aria-label="Custom Bottom Sheet"
        aria-describedby="sheet-description"
      >
        <div id="sheet-description">
          This bottom sheet contains important information.
        </div>
        <div role="region" aria-labelledby="region-title">
          <h3 id="region-title">Important Section</h3>
          <p>Content here.</p>
        </div>
      </BottomSheet>
    )

    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toHaveAttribute('aria-label', 'Custom Bottom Sheet')
    expect(dialog).toHaveAttribute('aria-describedby', 'sheet-description')
  })

  it('should render with interactive elements', () => {
    const { container } = render(
      <BottomSheet 
        open={true}
        onDismiss={() => {}}
      >
        <div>
          <h2>Interactive Elements Test</h2>
          <button type="button">Button</button>
          <input type="text" placeholder="Text input" />
          <select>
            <option value="">Choose option</option>
            <option value="1">Option 1</option>
          </select>
        </div>
      </BottomSheet>
    )

    expect(container.querySelector('button')).toBeTruthy()
    expect(container.querySelector('input')).toBeTruthy()
    expect(container.querySelector('select')).toBeTruthy()
  })
})