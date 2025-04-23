import React, { useState } from 'react';
import { 
  Typography, Paper, Box, Tabs, Tab, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Tooltip,
  Chip, Alert, AlertTitle, Button,
  Collapse, Divider
} from '@mui/material';
import { 
  ContentCopy, Check, ExpandMore,
  Code, ListAlt, Http
} from '@mui/icons-material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const ResponseDisplay = ({ response }) => {
  const [activeTab, setActiveTab] = useState('body');
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

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
            <SyntaxHighlighter 
              language="json" 
              style={atomOneDark}
              customStyle={{ margin: 0, background: 'transparent' }}
            >
              {JSON.stringify(response.response, null, 2)}
            </SyntaxHighlighter>
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
          sx={{ fontWeight: 'bold' }}
        />
        <Button
          startIcon={<ExpandMore />}
          onClick={() => setExpanded(!expanded)}
          size="small"
          sx={{ ml: 'auto' }}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ minHeight: 'auto' }}
          >
            <Tab 
              label="Body" 
              value="body" 
              icon={<Code fontSize="small" />}
              sx={{ minHeight: 'auto', py: 1 }}
            />
            <Tab 
              label="Headers" 
              value="headers" 
              icon={<ListAlt fontSize="small" />}
              sx={{ minHeight: 'auto', py: 1 }}
            />
            {response.config && (
              <Tab 
                label="Request" 
                value="request" 
                icon={<Http fontSize="small" />}
                sx={{ minHeight: 'auto', py: 1 }}
              />
            )}
          </Tabs>
        </Box>

        {activeTab === 'body' && (
          <Box position="relative" mt={2}>
            <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
              <IconButton 
                sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
                onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
              >
                {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
              </IconButton>
            </Tooltip>
            <SyntaxHighlighter 
              language="json" 
              style={atomOneDark}
              customStyle={{ 
                margin: 0, 
                borderRadius: 4,
                fontSize: '0.85rem',
                maxHeight: '500px',
                overflow: 'auto'
              }}
            >
              {JSON.stringify(response.data, null, 2)}
            </SyntaxHighlighter>
          </Box>
        )}

        {activeTab === 'headers' && (
          <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Header</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(response.headers).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{key}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {Array.isArray(value) ? value.join(', ') : value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 'request' && response.config && (
          <Box position="relative" mt={2}>
            <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
              <IconButton 
                sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
                onClick={() => copyToClipboard(JSON.stringify(response.config, null, 2))}
              >
                {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
              </IconButton>
            </Tooltip>
            <SyntaxHighlighter 
              language="json" 
              style={atomOneDark}
              customStyle={{ 
                margin: 0, 
                borderRadius: 4,
                fontSize: '0.85rem'
              }}
            >
              {JSON.stringify({
                method: response.config.method,
                url: response.config.url,
                headers: response.config.headers,
                data: response.config.data
              }, null, 2)}
            </SyntaxHighlighter>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

export default ResponseDisplay;