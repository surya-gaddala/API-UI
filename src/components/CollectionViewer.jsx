// src/components/CollectionViewer.jsx
import React, { useState } from 'react';
import {
  Box, Typography, List, ListItem, ListItemText,
  Accordion, AccordionSummary, AccordionDetails,
  IconButton, Menu, MenuItem, Paper, Divider,
  TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Add as AddIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { getCollections, deleteCollection, deleteRequest } from '../utils/collectionManager';

const CollectionViewer = ({ onSelectRequest }) => {
  const [collections, setCollections] = useState(getCollections().collections);
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextMenu, setContextMenu] = useState({ collection: null, request: null });
  const [openDialog, setOpenDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const handleMenuClick = (event, collection, request = null) => {
    setAnchorEl(event.currentTarget);
    setContextMenu({ collection, request });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setContextMenu({ collection: null, request: null });
  };

  const handleDeleteCollection = () => {
    if (contextMenu.collection) {
      deleteCollection(contextMenu.collection.name);
      setCollections(getCollections().collections);
    }
    handleMenuClose();
  };

  const handleDeleteRequest = () => {
    if (contextMenu.collection && contextMenu.request) {
      deleteRequest(contextMenu.collection.name, contextMenu.request.id);
      setCollections(getCollections().collections);
    }
    handleMenuClose();
  };

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      saveCollection(newCollectionName.trim(), {
        name: 'New Request',
        method: 'GET',
        url: '',
        headers: [],
        body: ''
      });
      setCollections(getCollections().collections);
      setNewCollectionName('');
      setOpenDialog(false);
    }
  };

  const refreshCollections = () => {
    setCollections(getCollections().collections);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Collections</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          size="small"
        >
          New Collection
        </Button>
      </Box>

      {collections.length === 0 ? (
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No collections yet. Create one to save your API requests.
          </Typography>
        </Paper>
      ) : (
        collections.map((collection) => (
          <Accordion key={collection.name} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" flexGrow={1}>
                <FolderIcon sx={{ mr: 1 }} />
                <Typography>{collection.name}</Typography>
                <Typography variant="caption" sx={{ ml: 1 }}>
                  ({collection.requests.length})
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuClick(e, collection);
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List dense>
                {collection.requests.map((request) => (
                  <React.Fragment key={request.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, collection, request)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      }
                      sx={{
                        '&:hover': { backgroundColor: 'action.hover' },
                        cursor: 'pointer'
                      }}
                      onClick={() => onSelectRequest(request)}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Chip
                              label={request.method}
                              size="small"
                              sx={{ mr: 1, width: 60, fontWeight: 'bold' }}
                            />
                            <Typography noWrap>{request.name}</Typography>
                          </Box>
                        }
                        secondary={request.url}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {contextMenu.request && (
          <MenuItem onClick={() => {
            onSelectRequest(contextMenu.request);
            handleMenuClose();
          }}>
            <SendIcon sx={{ mr: 1 }} /> Load Request
          </MenuItem>
        )}
        {contextMenu.request && (
          <MenuItem onClick={() => {
            // Implement edit functionality
            handleMenuClose();
          }}>
            <EditIcon sx={{ mr: 1 }} /> Edit
          </MenuItem>
        )}
        {contextMenu.request && (
          <MenuItem onClick={handleDeleteRequest}>
            <DeleteIcon sx={{ mr: 1 }} /> Delete Request
          </MenuItem>
        )}
        {contextMenu.collection && !contextMenu.request && (
          <MenuItem onClick={handleDeleteCollection}>
            <DeleteIcon sx={{ mr: 1 }} /> Delete Collection
          </MenuItem>
        )}
      </Menu>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            fullWidth
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCollection} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectionViewer;