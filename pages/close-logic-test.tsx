'use client'

import { useState } from 'react'
import { BottomSheet } from '../src'
import { Box, Button, Typography, Paper, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Alert, Slider } from '@mui/material'

export default function CloseLogicTest() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [closeLogic, setCloseLogic] = useState<'original' | 'distance' | 'movement'>('distance')
  const [closeThreshold, setCloseThreshold] = useState(0.4)

  const logicDescriptions = {
    original: 'Distance + direction tolerance for imperfect mobile swipes',
    distance: 'Pure distance-based closing (recommended for mobile)',
    movement: 'Distance + cumulative movement validation'
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Close Logic Test
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Test the different close logic approaches on mobile devices. 
          Try swiping down but accidentally lifting your finger with slight upward movement.
        </Typography>
      </Alert>

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl>
          <FormLabel>Close Logic Mode</FormLabel>
          <RadioGroup
            value={closeLogic}
            onChange={(e) => setCloseLogic(e.target.value as any)}
          >
            <FormControlLabel value="original" control={<Radio />} label="Original" />
            <FormControlLabel value="distance" control={<Radio />} label="Distance" />
            <FormControlLabel value="movement" control={<Radio />} label="Movement" />
          </RadioGroup>
        </FormControl>
        
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          {logicDescriptions[closeLogic]}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <FormLabel>Close Threshold: {(closeThreshold * 100).toFixed(0)}% from top</FormLabel>
          <Slider
            value={closeThreshold}
            onChange={(_, value) => setCloseThreshold(value)}
            min={0.2}
            max={0.6}
            step={0.05}
            marks={[
              { value: 0.3, label: '30%' },
              { value: 0.4, label: '40%' },
              { value: 0.5, label: '50%' }
            ]}
            sx={{ mt: 2 }}
          />
        </FormControl>
        
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Threshold from top of modal (e.g., 25% = must swipe past 25% from top to close)
        </Typography>
      </Paper>

      <Button
        variant="contained"
        size="large"
        onClick={() => setSheetOpen(true)}
        disabled={sheetOpen}
        fullWidth
      >
        Open Bottom Sheet
      </Button>

      <BottomSheet
        open={sheetOpen}
        onDismiss={() => setSheetOpen(false)}
        closeLogic={closeLogic}
        closeThreshold={closeThreshold}
        snapPoints={({ maxHeight }) => [maxHeight * 0.4, maxHeight * 0.8]}
        style={{
          '--rsbs-bg': '#fff',
          '--rsbs-backdrop-bg': 'rgba(0, 0, 0, 0.5)',
        } as React.CSSProperties}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Mode: {closeLogic.toUpperCase()}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {logicDescriptions[closeLogic]}
          </Typography>

          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Test Instructions:</strong><br/>
              1. Swipe down to close<br/>
              2. Try imperfect swipes (end with slight upward movement)<br/>
              3. Notice the difference between modes
            </Typography>
          </Alert>

          <Button
            variant="outlined"
            onClick={() => setSheetOpen(false)}
            sx={{ mt: 2 }}
          >
            Close Sheet
          </Button>
        </Box>
      </BottomSheet>
    </Box>
  )
}