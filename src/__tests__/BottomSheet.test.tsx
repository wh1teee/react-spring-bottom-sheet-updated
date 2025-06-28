import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BottomSheet, BottomSheetProps } from '../BottomSheet'

const defaultProps: BottomSheetProps = {
  open: false,
  onDismiss: vi.fn(),
  children: <div>Bottom Sheet Content</div>,
}

describe('BottomSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when closed', () => {
    render(<BottomSheet {...defaultProps} />)
    expect(screen.queryByText('Bottom Sheet Content')).not.toBeInTheDocument()
  })

  it('renders content when open', () => {
    render(<BottomSheet {...defaultProps} open={true} />)
    expect(screen.getByText('Bottom Sheet Content')).toBeInTheDocument()
  })

  it('calls onDismiss when backdrop is clicked', async () => {
    const onDismiss = vi.fn()
    render(<BottomSheet {...defaultProps} open={true} onDismiss={onDismiss} />)
    
    const backdrop = screen.getByTestId('backdrop')
    await userEvent.click(backdrop)
    
    expect(onDismiss).toHaveBeenCalledWith('backdrop')
  })

  it('calls onDismiss when Escape key is pressed', async () => {
    const onDismiss = vi.fn()
    render(<BottomSheet {...defaultProps} open={true} onDismiss={onDismiss} />)
    
    await userEvent.keyboard('{Escape}')
    
    expect(onDismiss).toHaveBeenCalledWith('escape')
  })

  it('applies custom className', () => {
    const customClass = 'custom-bottom-sheet'
    render(
      <BottomSheet 
        {...defaultProps} 
        open={true} 
        className={customClass}
      />
    )
    
    const sheet = screen.getByRole('dialog')
    expect(sheet).toHaveClass(customClass)
  })

  it('renders header when provided', () => {
    const header = <h2>Sheet Header</h2>
    render(
      <BottomSheet 
        {...defaultProps} 
        open={true} 
        header={header}
      />
    )
    
    expect(screen.getByText('Sheet Header')).toBeInTheDocument()
  })

  it('renders footer when provided', () => {
    const footer = <div>Sheet Footer</div>
    render(
      <BottomSheet 
        {...defaultProps} 
        open={true} 
        footer={footer}
      />
    )
    
    expect(screen.getByText('Sheet Footer')).toBeInTheDocument()
  })

  it('has proper ARIA attributes', () => {
    render(<BottomSheet {...defaultProps} open={true} />)
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('role', 'dialog')
  })

  it('focuses the sheet when opened', async () => {
    render(<BottomSheet {...defaultProps} open={true} />)
    
    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveFocus()
    })
  })

  it('supports custom snap points', () => {
    const snapPoints = ({ minHeight, maxHeight }: { minHeight: number; maxHeight: number }) => [
      minHeight,
      maxHeight * 0.6,
      maxHeight,
    ]
    
    render(
      <BottomSheet 
        {...defaultProps} 
        open={true} 
        snapPoints={snapPoints}
      />
    )
    
    // Verify the sheet renders (snapPoints function is called internally)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('supports custom spring configuration', () => {
    const springConfig = { tension: 400, friction: 40 }
    
    render(
      <BottomSheet 
        {...defaultProps} 
        open={true} 
        springConfig={springConfig}
      />
    )
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('prevents scroll when blocking scroll interaction', () => {
    render(
      <BottomSheet 
        {...defaultProps} 
        open={true} 
        blocking={true}
      />
    )
    
    // Document body should have scroll lock applied
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('allows scroll when not blocking', () => {
    render(
      <BottomSheet 
        {...defaultProps} 
        open={true} 
        blocking={false}
      />
    )
    
    // Document body should not have scroll lock
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})