import React, { useState } from 'react';
import { 
  TextField, Button, Select, MenuItem, 
  FormControl, InputLabel, Tabs, Tab, 
  Box, IconButton, Tooltip, Paper, Divider,
  Typography
} from '@mui/material';
import { 
  Add, Delete, ContentCopy, Send,
  Code, Settings 
} from '@mui/icons-material';
import axios from 'axios';
import { saveCollection } from '../utils/collectionManager';

const RequestForm = ({ onResponse }) => {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts');
  const [method, setMethod] = useState('GET');
  const [body, setBody] = useState('{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}');
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [params, setParams] = useState([{ key: '', value: '' }]);
  const [activeTab, setActiveTab] = useState('body');
  const [isLoading, setIsLoading] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [requestName, setRequestName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
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
      onResponse({ 
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRequest = () => {
    const requestToSave = {
      name: requestName,
      method,
      url,
      headers,
      params,
      body,
    };
    saveCollection(collectionName, requestToSave);
    alert('Request saved to collection!');
  };

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const removeHeader = (index) => setHeaders(headers.filter((_, i) => i !== index));
  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addParam = () => setParams([...params, { key: '', value: '' }]);
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

  return (
    <form onSubmit={handleSubmit}>
      <Box display="flex" gap={2} alignItems="center" mb={3}>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Method</InputLabel>
          <Select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            label="Method"
          >
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map(m => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="URL"
          variant="outlined"
          fullWidth
          size="small"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
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
        <Tooltip title="Copy request as JSON">
          <IconButton onClick={copyToClipboard}>
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label="Params" value="params" icon={<Settings fontSize="small" />} />
        <Tab label="Headers" value="headers" icon={<Code fontSize="small" />} />
        <Tab label="Body" value="body" icon={<Code fontSize="small" />} />
      </Tabs>

      {activeTab === 'params' && (
        <Box>
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
              <IconButton onClick={() => removeParam(index)} size="small">
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<Add />} onClick={addParam} size="small">
            Add Param
          </Button>
        </Box>
      )}

      {activeTab === 'headers' && (
        <Box>
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
              <IconButton onClick={() => removeHeader(index)} size="small">
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<Add />} onClick={addHeader} size="small">
            Add Header
          </Button>
        </Box>
      )}

      {activeTab === 'body' && method !== 'GET' && (
        <TextField
          label="Request Body (JSON)"
          variant="outlined"
          fullWidth
          multiline
          minRows={8}
          maxRows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          sx={{ fontFamily: 'monospace' }}
        />
      )}

      <Divider sx={{ my: 3 }} />

      <Paper sx={{ p: 2, backgroundColor: '#f4f4f4' }} elevation={0}>
        <Typography variant="subtitle1" gutterBottom>Save Request</Typography>
        <Box display="flex" gap={2} mb={1}>
          <TextField
            label="Collection Name"
            variant="outlined"
            size="small"
            fullWidth
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
          <TextField
            label="Request Name"
            variant="outlined"
            size="small"
            fullWidth
            value={requestName}
            onChange={(e) => setRequestName(e.target.value)}
          />
          <Button 
            variant="outlined" 
            onClick={handleSaveRequest}
          >
            Save
          </Button>
        </Box>
      </Paper>
    </form>
  );
};

export default RequestForm;
