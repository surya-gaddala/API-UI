import React, { useState, useRef } from 'react';
import {
  Box, Typography, List, ListItem, ListItemText,
  Accordion, AccordionSummary, AccordionDetails,
  IconButton, Menu, MenuItem, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Tooltip, Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  Upload as UploadIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { 
  getCollections, deleteCollection, deleteRequest,
  exportCollections, importCollections
} from '../utils/collectionManager';

const CollectionViewer = ({ onSelectRequest }) => {
  const [collections, setCollections] = useState(getCollections().collections);
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextMenu, setContextMenu] = useState({ collection: null, request: null });
  const [openDialog, setOpenDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const refreshCollections = () => {
    setCollections(getCollections().collections);
  };

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
      refreshCollections();
    }
    handleMenuClose();
  };

  const handleDeleteRequest = () => {
    if (contextMenu.collection && contextMenu.request) {
      deleteRequest(contextMenu.collection.name, contextMenu.request.id);
      refreshCollections();
    }
    handleMenuClose();
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      setError('Collection name is required');
      return;
    }
    
    try {
      saveCollection(newCollectionName.trim(), {
        name: 'New Request',
        method: 'GET',
        url: '',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
        body: ''
      });
      refreshCollections();
      setNewCollectionName('');
      setOpenDialog(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    
    try {
      await importCollections(file);
      refreshCollections();
    } catch (err) {
      setError(err.message || 'Failed to import collections');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleExport = () => {
    try {
      exportCollections();
    } catch (err) {
      setError('Failed to export collections');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2} pb={1}>
        <Typography variant="subtitle1" fontWeight="bold">
          Collections
        </Typography>
        <Box display="flex" gap={0.5}>
          <Tooltip title="Import Collections">
            <IconButton
              size="small"
              onClick={handleImportClick}
              disabled={importing}
            >
              <UploadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
            disabled={importing}
          />
          <Tooltip title="Export Collections">
            <IconButton
              size="small"
              onClick={handleExport}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="New Collection">
            <IconButton
              size="small"
              onClick={() => setOpenDialog(true)}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 2, mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {importing && <LinearProgress />}

      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        {collections.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No collections found. Create or import one.
            </Typography>
          </Box>
        ) : (
          collections.map((collection) => (
            <Accordion 
              key={collection.name} 
              defaultExpanded
              sx={{ 
                '&:before': { display: 'none' },
                boxShadow: 'none',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  minHeight: '48px !important',
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center'
                  }
                }}
              >
                <Box display="flex" alignItems="center" flexGrow={1}>
                  <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography noWrap sx={{ flexGrow: 1 }}>
                    {collection.name}
                  </Typography>
                  <Chip 
                    label={collection.requests.length} 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
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
                          cursor: 'pointer',
                          pr: 6
                        }}
                        onClick={() => onSelectRequest(request)}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              <Chip
                                label={request.method}
                                size="small"
                                sx={{ 
                                  mr: 1, 
                                  width: 70, 
                                  fontWeight: 'bold',
                                  backgroundColor: 
                                    request.method === 'GET' ? '#e8f5e9' :
                                    request.method === 'POST' ? '#e3f2fd' :
                                    request.method === 'PUT' ? '#fff8e1' :
                                    request.method === 'DELETE' ? '#ffebee' : '#f3e5f5',
                                  color: 'black'
                                }}
                              />
                              <Typography noWrap sx={{ fontWeight: 'medium' }}>
                                {request.name}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography noWrap variant="body2" color="text.secondary">
                              {request.url}
                            </Typography>
                          }
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
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
            error={Boolean(error)}
            helperText={error}
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