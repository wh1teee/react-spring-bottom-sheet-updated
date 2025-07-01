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
            onClick={() => setDrawerOpen(true)}
            startIcon={<MenuIcon />}
          >
            1. Open Drawer
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setSheetOpen(true)}
            disabled={!drawerOpen}
          >
            2. Open Bottom Sheet
          </Button>
          <Button
            variant="outlined"
            onClick={() => setDrawerOpen(false)}
            disabled={!drawerOpen || !sheetOpen}
          >
            3. Close Drawer
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setSheetOpen(false)}
            disabled={!sheetOpen || drawerOpen}
          >
            4. Close Bottom Sheet
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={() => setDialogOpen(true)}
            size="small"
          >
            Test Dialog
          </Button>
          <Button
            variant="outlined"
            onClick={() => setModalOpen(true)}
            size="small"
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
            size="small"
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
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bottom Sheet Content
          </Typography>
          <Typography variant="body1" paragraph>
            This bottom sheet tests scroll lock behavior with MUI components.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Current mode: {useProblematicBehavior ? "Problematic (old)" : "Fixed (new)"}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setDialogOpen(true)}
            >
              Open Dialog from Sheet
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSheetOpen(false)}
            >
              Close Sheet
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