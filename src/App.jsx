import React, { useState } from 'react';
import { 
  Container, Typography, CssBaseline, 
  ThemeProvider, createTheme, Box, Paper 
} from '@mui/material';
import RequestForm from './components/RequestForm';
import ResponseDisplay from './components/ResponseDisplay';
import RequestHistory from './components/RequestHistory';

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
  const [history, setHistory] = useState([]);

  const handleResponse = (responseData, requestConfig) => {
    setResponse(responseData);
    if (requestConfig) {
      setHistory(prev => [
        { 
          id: Date.now(), 
          method: requestConfig.method, 
          url: requestConfig.url,
          time: new Date().toLocaleTimeString(),
          config: requestConfig
        },
        ...prev.slice(0, 9) // Keep only last 10 items
      ]);
    }
  };

  const handleSelectHistory = (item) => {
    // This would need to be implemented to populate the request form
    console.log('Selected history item:', item);
    // You would need to pass this to RequestForm or lift state up
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          API Tester
        </Typography>
        <Box display="flex" gap={4} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
          <Box flex={1} minWidth={0}>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <RequestForm onResponse={handleResponse} />
            </Paper>
            <Paper elevation={3} sx={{ p: 3 }}>
              <ResponseDisplay response={response} />
            </Paper>
          </Box>
          <Box width={{ md: 350 }} sx={{ width: { xs: '100%', md: 350 } }}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Request History
              </Typography>
              <RequestHistory 
                history={history} 
                onSelect={handleSelectHistory}
              />
            </Paper>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;