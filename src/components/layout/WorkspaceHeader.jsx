import React, { useState } from 'react';
import { 
  Box, Typography, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Tabs,
  Tab, Alert, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { createCollection, saveCollection } from '../../utils/collectionManager';
import axios from 'axios';

const WorkspaceHeader = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importType, setImportType] = useState(0); // 0 for Swagger, 1 for cURL
  const [importUrl, setImportUrl] = useState('');
  const [curlCommand, setCurlCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImportSwagger = async () => {
    if (!importUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch the Swagger/OpenAPI specification
      const response = await axios.get(importUrl);
      const spec = response.data;

      // Create a new collection with the API name
      const collectionName = spec.info?.title || 'Imported API';
      createCollection(collectionName);

      // Process paths and create requests
      Object.entries(spec.paths || {}).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, details]) => {
          const requestName = details.operationId || `${method.toUpperCase()} ${path}`;
          
          // Create request object
          const request = {
            id: crypto.randomUUID(),
            name: requestName,
            method: method.toUpperCase(),
            url: `${spec.servers?.[0]?.url || ''}${path}`,
            headers: {
              'Content-Type': 'application/json'
            },
            body: method !== 'get' && details.requestBody ? 
              JSON.stringify(details.requestBody?.content?.['application/json']?.example || {}, null, 2) : '',
            description: details.description || '',
            params: details.parameters?.filter(p => p.in === 'query')?.map(p => ({
              key: p.name,
              value: p.example || '',
              description: p.description || ''
            })) || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          // Save request to collection
          saveCollection(collectionName, request);
        });
      });

      setImportDialogOpen(false);
      setImportUrl('');
      alert('API imported successfully!');
    } catch (error) {
      console.error('Import error:', error);
      setError('Failed to import API: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportCurl = () => {
    if (!curlCommand.trim()) {
      setError('Please enter a cURL command');
      return;
    }

    try {
      // Parse cURL command
      const method = (curlCommand.match(/-X\s+(\w+)/) || ['', 'GET'])[1];
      const url = (curlCommand.match(/curl\s+['"]([^'"]+)['"]/) || curlCommand.match(/curl\s+([^\s]+)/))?.[1];
      
      if (!url) {
        setError('Invalid cURL command: URL not found');
        return;
      }

      // Parse headers
      const headers = {};
      const headerMatches = curlCommand.matchAll(/-H\s+['"]([^'"]+)['"]/g);
      for (const match of headerMatches) {
        const [key, value] = match[1].split(':').map(s => s.trim());
        headers[key] = value;
      }

      // Parse body
      const bodyMatch = curlCommand.match(/-d\s+['"]([^'"]+)['"]/);
      const body = bodyMatch ? bodyMatch[1] : '';

      // Create collection and request
      const collectionName = 'Imported cURL';
      createCollection(collectionName);

      const request = {
        id: crypto.randomUUID(),
        name: `${method} ${new URL(url).pathname}`,
        method,
        url,
        headers,
        body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveCollection(collectionName, request);
      setImportDialogOpen(false);
      setCurlCommand('');
      alert('cURL command imported successfully!');
    } catch (error) {
      console.error('Import error:', error);
      setError('Failed to import cURL: ' + error.message);
    }
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1">Workspace</Typography>
          <Button size="small" startIcon={<AddIcon />}>New</Button>
          <Button size="small" onClick={() => setImportDialogOpen(true)}>Import</Button>
        </Box>
      </Box>

      <Dialog 
        open={importDialogOpen} 
        onClose={() => {
          setImportDialogOpen(false);
          setImportUrl('');
          setCurlCommand('');
          setError('');
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import API</DialogTitle>
        <DialogContent>
          <Tabs 
            value={importType} 
            onChange={(e, newValue) => {
              setImportType(newValue);
              setError('');
            }}
            sx={{ mb: 2 }}
          >
            <Tab label="Swagger/OpenAPI" />
            <Tab label="cURL" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {importType === 0 ? (
            <TextField
              fullWidth
              label="Swagger/OpenAPI URL"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://api.example.com/swagger.json"
              helperText="Enter the URL of your Swagger/OpenAPI specification"
            />
          ) : (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="cURL Command"
              value={curlCommand}
              onChange={(e) => setCurlCommand(e.target.value)}
              placeholder={'curl -X POST "https://api.example.com/endpoint" -H "Content-Type: application/json" -d \'{"key": "value"}\''}
              helperText="Paste your cURL command here"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setImportDialogOpen(false);
              setImportUrl('');
              setCurlCommand('');
              setError('');
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={importType === 0 ? handleImportSwagger : handleImportCurl}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WorkspaceHeader; 