import React, { useState } from 'react';
import { 
  Container, Typography, CssBaseline, 
  ThemeProvider, createTheme, Box, Paper
} from '@mui/material';
import RequestForm from './components/RequestForm';
import ResponseDisplay from './components/ResponseDisplay';
import CollectionViewer from "./components/collectionviewer";


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

function App() {
  const [response, setResponse] = useState(null);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleResponse = (responseData, requestConfig) => {
    setResponse(responseData);
    if (requestConfig) {
      setCurrentRequest({
        method: requestConfig.method,
        url: requestConfig.url,
        headers: requestConfig.headers,
        body: requestConfig.data || ''
      });
    }
  };

  const refreshCollections = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          API Tester
        </Typography>
        <Box display="flex" gap={4} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Collections Sidebar */}
          <Box width={{ md: 350 }} sx={{ width: { xs: '100%', md: 350 } }}>
            <Paper elevation={3} sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
              <CollectionViewer
                key={refreshKey}
                onSelectRequest={(request) => {
                  setCurrentRequest(request);
                  if (request.response) {
                    setResponse(request.response);
                  }
                }}
              />
            </Paper>
          </Box>

          {/* Main Content */}
          <Box flex={1} minWidth={0}>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <RequestForm 
                onResponse={handleResponse} 
                initialRequest={currentRequest}
                onSaveSuccess={refreshCollections}
              />
            </Paper>
            <Paper elevation={3} sx={{ p: 3 }}>
              <ResponseDisplay response={response} />
            </Paper>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;