import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Select, MenuItem, 
  FormControl, InputLabel, Tabs, Tab, 
  Box, IconButton, Tooltip, Divider,
  Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Alert, Collapse,
  Autocomplete, ListItemText
} from '@mui/material';
import { 
  Add, Delete, ContentCopy, Send,
  Code, Settings, Save, ExpandMore,
  KeyboardArrowDown, KeyboardArrowUp,
  History, List
} from '@mui/icons-material';
import axios from 'axios';
import { saveCollection } from '../utils/collectionManager';

const API_SUGGESTIONS = [
  'https://jsonplaceholder.typicode.com/posts',
  'https://jsonplaceholder.typicode.com/users',
  'https://api.github.com/users',
  'https://reqres.in/api/users',
  'https://dog.ceo/api/breeds/image/random'
];

const RequestForm = ({ onResponse, initialRequest, onSaveSuccess }) => {
  const [url, setUrl] = useState(initialRequest?.url || '');
  const [method, setMethod] = useState(initialRequest?.method || 'GET');
  const [body, setBody] = useState(initialRequest?.body || '');
  const [headers, setHeaders] = useState(
    initialRequest?.headers || [{ key: 'Content-Type', value: 'application/json' }]
  );
  const [params, setParams] = useState([{ key: '', value: '' }]);
  const [activeTab, setActiveTab] = useState('body');
  const [isLoading, setIsLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [requestName, setRequestName] = useState('');
  const [error, setError] = useState(null);
  const [expandedHeaders, setExpandedHeaders] = useState(false);
  const [expandedParams, setExpandedParams] = useState(false);

  useEffect(() => {
    if (initialRequest) {
      setUrl(initialRequest.url);
      setMethod(initialRequest.method);
      setBody(initialRequest.body || '');
      setHeaders(initialRequest.headers || []);
    }
  }, [initialRequest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const config = {
        method,
        url,
        headers: headers.reduce((acc, { key, value }) => {
          if (key) acc[key] = value;
          return acc;
        }, {}),
        params: params.reduce((acc, { key, value }) => {
          if (key) acc[key] = value;
          return acc;
        }, {})
      };

      if (method !== 'GET' && body) {
        try {
          config.data = JSON.parse(body);
        } catch (error) {
          throw new Error('Invalid JSON format in request body');
        }
      }

      const response = await axios(config);
      onResponse({
        data: response.data,
        status: response.status,
        headers: response.headers,
        config: response.config
      }, config);
    } catch (error) {
      setError(error.message);
      onResponse({ 
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addHeader = () => {
    if (headers.some(h => !h.key)) return; // Prevent adding empty headers
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index) => setHeaders(headers.filter((_, i) => i !== index));

  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addParam = () => {
    if (params.some(p => !p.key)) return;
    setParams([...params, { key: '', value: '' }]);
  };

  const removeParam = (index) => setParams(params.filter((_, i) => i !== index));

  const updateParam = (index, field, value) => {
    const newParams = [...params];
    newParams[index][field] = value;
    setParams(newParams);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify({
      method,
      url,
      headers: headers.reduce((acc, { key, value }) => {
        if (key) acc[key] = value;
        return acc;
      }, {}),
      params: params.reduce((acc, { key, value }) => {
        if (key) acc[key] = value;
        return acc;
      }, {}),
      body: method !== 'GET' ? JSON.parse(body) : undefined
    }, null, 2));
  };

  const handleSaveRequest = () => {
    try {
      if (!collectionName.trim() || !requestName.trim()) {
        throw new Error('Collection and request names are required');
      }

      const requestToSave = {
        name: requestName,
        method,
        url,
        headers: headers.filter(h => h.key),
        body: method !== 'GET' ? body : '',
        response: null
      };

      saveCollection(collectionName, requestToSave);
      setSaveDialogOpen(false);
      setCollectionName('');
      setRequestName('');
      onSaveSuccess?.();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatJson = () => {
    try {
      setBody(JSON.stringify(JSON.parse(body), null, 2));
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
    }
  };

  const getMethodColor = (method) => {
    switch(method) {
      case 'GET': return '#e8f5e9';
      case 'POST': return '#e3f2fd';
      case 'PUT': return '#fff8e1';
      case 'DELETE': return '#ffebee';
      default: return '#f3e5f5';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Request URL and Method */}
      <Box display="flex" gap={2} alignItems="center" mb={3}>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Method</InputLabel>
          <Select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            label="Method"
          >
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map(m => (
              <MenuItem key={m} value={m}>
                <Chip 
                  label={m} 
                  size="small" 
                  sx={{ 
                    width: 70, 
                    backgroundColor: getMethodColor(m),
                    color: 'black',
                    fontWeight: 'bold'
                  }}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Autocomplete
          freeSolo
          options={API_SUGGESTIONS}
          value={url}
          onChange={(_, newValue) => setUrl(newValue || '')}
          onInputChange={(_, newInputValue) => setUrl(newInputValue)}
          fullWidth
          size="small"
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="API URL" 
              required
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    <Tooltip title="API suggestions">
                      <IconButton size="small">
                        <List fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          startIcon={<Send />}
          disabled={isLoading}
          sx={{ height: 40 }}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </Box>

      <Collapse in={Boolean(error)}>
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      </Collapse>

      {/* Request Configuration Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Params" value="params" icon={<Settings fontSize="small" />} />
          <Tab label="Headers" value="headers" icon={<Code fontSize="small" />} />
          {method !== 'GET' && (
            <Tab label="Body" value="body" icon={<Code fontSize="small" />} />
          )}
        </Tabs>
      </Box>

      {/* Params Section */}
      <Box sx={{ display: activeTab === 'params' ? 'block' : 'none' }}>
        <Box 
          display="flex" 
          alignItems="center" 
          onClick={() => setExpandedParams(!expandedParams)}
          sx={{ cursor: 'pointer', mb: 1 }}
        >
          {expandedParams ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          <Typography variant="subtitle1">Query Parameters</Typography>
        </Box>
        <Collapse in={expandedParams}>
          {params.map((param, index) => (
            <Box key={index} display="flex" gap={1} mb={1}>
              <TextField
                label="Key"
                size="small"
                value={param.key}
                onChange={(e) => updateParam(index, 'key', e.target.value)}
                fullWidth
              />
              <TextField
                label="Value"
                size="small"
                value={param.value}
                onChange={(e) => updateParam(index, 'value', e.target.value)}
                fullWidth
              />
              <IconButton 
                onClick={() => removeParam(index)} 
                size="small"
                color="error"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button 
            startIcon={<Add />} 
            onClick={addParam} 
            size="small"
            variant="outlined"
            disabled={params.some(p => !p.key)}
          >
            Add Param
          </Button>
        </Collapse>
      </Box>

      {/* Headers Section */}
      <Box sx={{ display: activeTab === 'headers' ? 'block' : 'none' }}>
        <Box 
          display="flex" 
          alignItems="center" 
          onClick={() => setExpandedHeaders(!expandedHeaders)}
          sx={{ cursor: 'pointer', mb: 1 }}
        >
          {expandedHeaders ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          <Typography variant="subtitle1">Request Headers</Typography>
        </Box>
        <Collapse in={expandedHeaders}>
          {headers.map((header, index) => (
            <Box key={index} display="flex" gap={1} mb={1}>
              <TextField
                label="Header"
                size="small"
                value={header.key}
                onChange={(e) => updateHeader(index, 'key', e.target.value)}
                fullWidth
              />
              <TextField
                label="Value"
                size="small"
                value={header.value}
                onChange={(e) => updateHeader(index, 'value', e.target.value)}
                fullWidth
              />
              <IconButton 
                onClick={() => removeHeader(index)} 
                size="small"
                color="error"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button 
            startIcon={<Add />} 
            onClick={addHeader} 
            size="small"
            variant="outlined"
            disabled={headers.some(h => !h.key)}
          >
            Add Header
          </Button>
        </Collapse>
      </Box>

      {/* Body Section */}
      {method !== 'GET' && (
        <Box sx={{ display: activeTab === 'body' ? 'block' : 'none' }}>
          <TextField
            label="Request Body (JSON)"
            variant="outlined"
            fullWidth
            multiline
            minRows={8}
            maxRows={12}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            sx={{ 
              fontFamily: 'monospace',
              '& textarea': {
                fontFamily: '"Roboto Mono", monospace',
                fontSize: '0.875rem'
              }
            }}
          />
          <Box display="flex" justifyContent="flex-end" mt={1} gap={1}>
            <Button
              size="small"
              onClick={formatJson}
              variant="outlined"
              disabled={!body.trim()}
            >
              Format JSON
            </Button>
            <Tooltip title="Copy to clipboard">
              <IconButton 
                onClick={() => navigator.clipboard.writeText(body)}
                disabled={!body.trim()}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Action Buttons */}
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Tooltip title="Copy full request as JSON">
          <Button
            startIcon={<ContentCopy />}
            onClick={copyToClipboard}
            variant="outlined"
            size="small"
          >
            Copy Request
          </Button>
        </Tooltip>
        <Button
          startIcon={<Save />}
          onClick={() => setSaveDialogOpen(true)}
          variant="contained"
          color="secondary"
        >
          Save Request
        </Button>
      </Box>

      {/* Save Request Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Save Request to Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            fullWidth
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Request Name"
            fullWidth
            value={requestName}
            onChange={(e) => setRequestName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveRequest} 
            variant="contained"
            disabled={!collectionName.trim() || !requestName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default RequestForm;