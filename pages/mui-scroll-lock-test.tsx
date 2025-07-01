'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Container,
  Alert,
  AlertTitle,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Modal,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { BottomSheet } from '../src'
import { ProblematicBottomSheet } from '../docs/fixtures/ProblematicBottomSheet'

const drawerWidth = 240

export default function MUIScrollLockTest() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [useProblematicBehavior, setUseProblematicBehavior] = useState(false)

  // Generate long content to test scrolling
  const longContent = Array.from({ length: 50 }, (_, i) => (
    <Typography key={i} variant="body1" paragraph>
      This is paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim 
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    </Typography>
  ))

  const drawerContent = (
    <Box sx={{ width: drawerWidth }} role="presentation">
      <Toolbar />
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Step 1 Complete: Drawer Open</AlertTitle>
          <Typography variant="body2">
            MUI has set overflow:hidden on body. Now open the Bottom Sheet.
          </Typography>
        </Alert>
        
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={() => setSheetOpen(true)}
          disabled={sheetOpen}
          sx={{ mb: 2 }}
        >
          2. Open Bottom Sheet
        </Button>
        
        <FormControlLabel
          control={
            <Switch
              checked={useProblematicBehavior}
              onChange={(e) => setUseProblematicBehavior(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="caption">
              Problematic Mode
            </Typography>
          }
        />
      </Box>
      
      <Divider />
      <List>
        {['Home', 'Settings', 'About'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index === 0 ? <HomeIcon /> : index === 1 ? <SettingsIcon /> : <InfoIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Button
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </Button>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            MUI + Bottom Sheet Scroll Lock Test
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        // Test problematic vs fixed behavior
        disableEnforceFocus={useProblematicBehavior ? false : sheetOpen}
        {...(useProblematicBehavior ? {} : {})} // In the fixed version, we don't need disableScrollLock
      >
        {drawerContent}
      </Drawer>

      <Container component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Scroll Lock Conflict Test
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Test Instructions - Reproduce Scroll Lock Conflict</AlertTitle>
          <Typography variant="body2">
            <strong>To reproduce the problematic behavior:</strong><br/>
            1. Enable "Problematic Behavior" toggle<br/>
            2. Open the Drawer (menu button) - MUI sets overflow:hidden<br/>
            3. Open the Bottom Sheet - saves MUI's overflow:hidden as "original"<br/>
            4. Close the Drawer first - MUI removes its styles<br/>
            5. Close the Bottom Sheet - restores the saved overflow:hidden ❌<br/>
            6. Page should be frozen (can't scroll) in problematic mode<br/>
            <br/>
            <strong>With the fix disabled:</strong> Same steps but page scroll works correctly ✅
          </Typography>
        </Alert>

        <Paper sx={{ p: 2, mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={useProblematicBehavior}
                onChange={(e) => setUseProblematicBehavior(e.target.checked)}
              />
            }
            label="Use Problematic Behavior (old scroll lock handling)"
          />
          <Typography variant="caption" display="block" color="text.secondary">
            When enabled, simulates the old behavior that caused scroll lock conflicts
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setDrawerOpen(true)}
            startIcon={<MenuIcon />}
            disabled={drawerOpen}
          >
            1. Start Test - Open Drawer
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => setDialogOpen(true)}
          >
            Test Dialog
          </Button>
          <Button
            variant="outlined"
            onClick={() => setModalOpen(true)}
          >
            Test Modal
          </Button>
          <Button
            variant="text"
            onClick={() => {
              setDrawerOpen(false)
              setSheetOpen(false)
              setDialogOpen(false)
              setModalOpen(false)
            }}
          >
            Reset All
          </Button>
        </Box>

        <Alert severity={useProblematicBehavior ? "warning" : "success"} sx={{ mb: 3 }}>
          <AlertTitle>
            {useProblematicBehavior ? "Problematic Mode Active" : "Fixed Mode Active"}
          </AlertTitle>
          {useProblematicBehavior 
            ? "This simulates the old scroll lock behavior that could cause conflicts."
            : "This uses the new scroll lock implementation with MutationObserver for conflict resolution."
          }
        </Alert>

        <Typography variant="h5" gutterBottom>
          Long Scrollable Content
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Scroll down to test that page scrolling works correctly after closing components.
        </Typography>

        {longContent}
      </Container>

      <ProblematicBottomSheet
        open={sheetOpen}
        onDismiss={() => setSheetOpen(false)}
        defaultSnap={({ maxHeight }) => maxHeight / 2}
        snapPoints={({ maxHeight }) => [maxHeight * 0.3, maxHeight * 0.6, maxHeight * 0.9]}
        useProblematic={useProblematicBehavior}
        style={{
          '--rsbs-z-index': '1400', // Higher than MUI Drawer (1200) and Modal (1300)
        } as React.CSSProperties}
      >
        <Box sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Step 2 Complete: Bottom Sheet Open</AlertTitle>
            <Typography variant="body2">
              {useProblematicBehavior 
                ? "🔴 Problematic: Saved MUI's overflow:hidden as 'original'. Now close drawer first!"
                : "✅ Fixed: Using new scroll lock with MutationObserver tracking."
              }
            </Typography>
          </Alert>
          
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="caption">
              ✅ Bottom Sheet is now on top of Drawer (z-index: 1400). 
              You can see the drawer content behind but this sheet should be fully interactive.
            </Typography>
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            Scroll Lock Conflict Test
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mode: {useProblematicBehavior ? "Problematic (old behavior)" : "Fixed (new behavior)"}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              color="warning"
              onClick={() => setDrawerOpen(false)}
              disabled={!drawerOpen}
              fullWidth
            >
              3. Close Drawer First
            </Button>
            
            <Button
              variant="contained"
              color="error"
              onClick={() => setSheetOpen(false)}
              disabled={drawerOpen}
              fullWidth
            >
              4. Close Bottom Sheet Last
            </Button>
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="caption" color="text.secondary">
              After step 4, check if page scroll works. In problematic mode, 
              page should be frozen (overflow:hidden restored incorrectly).
            </Typography>
            
            <Button
              variant="text"
              size="small"
              onClick={() => setDialogOpen(true)}
            >
              Test Dialog
            </Button>
          </Box>
        </Box>
      </ProblematicBottomSheet>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Test Dialog</DialogTitle>
        <DialogContent>
          <Typography>
            This dialog also manages focus and can conflict with other components.
            Test opening/closing in different orders with the drawer and bottom sheet.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
            Test Modal
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Another component that manages scroll locking and focus.
          </Typography>
          <Button
            onClick={() => setModalOpen(false)}
            sx={{ mt: 2 }}
            variant="contained"
          >
            Close Modal
          </Button>
        </Box>
      </Modal>
    </Box>
  )
}