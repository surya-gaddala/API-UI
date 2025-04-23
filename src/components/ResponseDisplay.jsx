import React, { useState } from 'react';
import { 
  Typography, Paper, Box, Tabs, Tab, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Tooltip,
  Chip, Alert, AlertTitle
} from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';

const ResponseDisplay = ({ response }) => {
  const [activeTab, setActiveTab] = useState('body');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!response) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <Typography variant="body1" color="text.secondary">
          Send a request to see the response
        </Typography>
      </Box>
    );
  }

  if (response.error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Error {response.status && `(${response.status})`}</AlertTitle>
        {response.error}
        {response.response && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Server Response:
            </Typography>
            <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default' }}>
              <pre style={{ margin: 0 }}>{JSON.stringify(response.response, null, 2)}</pre>
            </Paper>
          </Box>
        )}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Chip 
          label={`Status: ${response.status}`} 
          color={
            response.status >= 200 && response.status < 300 ? 'success' : 
            response.status >= 400 ? 'error' : 'info'
          }
        />
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ flexGrow: 1 }}
        >
          <Tab label="Body" value="body" />
          <Tab label="Headers" value="headers" />
        </Tabs>
        {activeTab === 'body' && (
          <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
            <IconButton onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}>
              {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {activeTab === 'body' && (
        <Paper elevation={2} sx={{ p: 2, position: 'relative' }}>
          <pre style={{ 
            margin: 0, 
            fontFamily: 'monospace',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}>
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </Paper>
      )}

      {activeTab === 'headers' && (
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Header</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(response.headers).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{key}</TableCell>
                  <TableCell>{Array.isArray(value) ? value.join(', ') : value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ResponseDisplay;
