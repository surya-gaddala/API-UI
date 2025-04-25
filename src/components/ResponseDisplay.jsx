// import React, { useState, useRef } from 'react';
// import { 
//   Typography, Paper, Box, Tabs, Tab, 
//   Table, TableBody, TableCell, TableContainer, 
//   TableHead, TableRow, IconButton, Tooltip,
//   Chip, Alert, AlertTitle, Slider, FormControlLabel,
//   Switch, ButtonGroup, Button
// } from '@mui/material';
// import { 
//   ContentCopy, 
//   Check, 
//   ZoomIn, 
//   ZoomOut, 
//   Height as HeightIcon,
//   Fullscreen,
//   FullscreenExit
// } from '@mui/icons-material';

// const ResponseDisplay = ({ response }) => {
//   const [activeTab, setActiveTab] = useState('body');
//   const [copied, setCopied] = useState(false);
//   const [fontSize, setFontSize] = useState(13);
//   const [height, setHeight] = useState(400);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [wordWrap, setWordWrap] = useState(true);
//   const containerRef = useRef(null);

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleZoom = (delta) => {
//     setFontSize(prev => Math.min(Math.max(prev + delta, 8), 24));
//   };

//   const handleHeightChange = (_, newValue) => {
//     setHeight(newValue);
//   };

//   const toggleFullscreen = () => {
//     if (!isFullscreen) {
//       if (containerRef.current?.requestFullscreen) {
//         containerRef.current.requestFullscreen();
//       }
//     } else {
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//       }
//     }
//     setIsFullscreen(!isFullscreen);
//   };

//   if (!response) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" height={200}>
//         <Typography variant="body1" color="text.secondary">
//           Send a request to see the response
//         </Typography>
//       </Box>
//     );
//   }

//   if (response.error) {
//     return (
//       <Alert severity="error" sx={{ mb: 2 }}>
//         <AlertTitle>Error {response.status && `(${response.status})`}</AlertTitle>
//         {response.error}
//         {response.response && (
//           <Box mt={2}>
//             <Typography variant="subtitle2" gutterBottom>
//               Server Response:
//             </Typography>
//             <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default' }}>
//               <pre style={{ margin: 0 }}>{JSON.stringify(response.response, null, 2)}</pre>
//             </Paper>
//           </Box>
//         )}
//       </Alert>
//     );
//   }

//   const renderControls = () => (
//     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
//       <ButtonGroup size="small">
//         <Tooltip title="Zoom out">
//           <Button onClick={() => handleZoom(-1)}>
//             <ZoomOut fontSize="small" />
//           </Button>
//         </Tooltip>
//         <Tooltip title="Zoom in">
//           <Button onClick={() => handleZoom(1)}>
//             <ZoomIn fontSize="small" />
//           </Button>
//         </Tooltip>
//       </ButtonGroup>
//       <FormControlLabel
//         control={
//           <Switch
//             size="small"
//             checked={wordWrap}
//             onChange={(e) => setWordWrap(e.target.checked)}
//           />
//         }
//         label="Word Wrap"
//       />
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
//         <HeightIcon fontSize="small" />
//         <Slider
//           size="small"
//           value={height}
//           min={200}
//           max={800}
//           onChange={handleHeightChange}
//           valueLabelDisplay="auto"
//           valueLabelFormat={(value) => `${value}px`}
//         />
//       </Box>
//       <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
//         <IconButton size="small" onClick={toggleFullscreen}>
//           {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
//         </IconButton>
//       </Tooltip>
//     </Box>
//   );

//   return (
//     <Box ref={containerRef}>
//       <Box display="flex" alignItems="center" gap={2} mb={2}>
//         <Chip 
//           label={`Status: ${response.status}`} 
//           color={
//             response.status >= 200 && response.status < 300 ? 'success' : 
//             response.status >= 400 ? 'error' : 'info'
//           }
//         />
//         <Tabs 
//           value={activeTab} 
//           onChange={(e, newValue) => setActiveTab(newValue)}
//           sx={{ flexGrow: 1 }}
//         >
//           <Tab label="Body" value="body" />
//           <Tab label="Headers" value="headers" />
//         </Tabs>
//         {activeTab === 'body' && (
//           <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
//             <IconButton onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}>
//               {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
//             </IconButton>
//           </Tooltip>
//         )}
//       </Box>

//       {renderControls()}

//       {activeTab === 'body' && (
//         <Paper 
//           elevation={2} 
//           sx={{ 
//             position: 'relative',
//             ...(isFullscreen && {
//               position: 'fixed',
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               zIndex: 1300,
//               borderRadius: 0,
//             })
//           }}
//         >
//           <Box
//             sx={{
//               height: isFullscreen ? '100vh' : height,
//               overflow: 'auto',
//               p: 2,
//             }}
//           >
//             <pre style={{ 
//               margin: 0, 
//               fontFamily: 'monospace',
//               fontSize: `${fontSize}px`,
//               whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
//               wordWrap: wordWrap ? 'break-word' : 'normal',
//             }}>
//               {JSON.stringify(response.data, null, 2)}
//             </pre>
//           </Box>
//         </Paper>
//       )}

//       {activeTab === 'headers' && (
//         <Paper elevation={2}>
//           <Box sx={{ height: height, overflow: 'auto' }}>
//             <TableContainer>
//               <Table size="small" stickyHeader>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell sx={{ fontWeight: 'bold', fontSize: fontSize }}>Header</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold', fontSize: fontSize }}>Value</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {Object.entries(response.headers).map(([key, value]) => (
//                     <TableRow key={key}>
//                       <TableCell sx={{ fontSize: fontSize }}>{key}</TableCell>
//                       <TableCell sx={{ 
//                         fontSize: fontSize,
//                         whiteSpace: wordWrap ? 'normal' : 'nowrap',
//                       }}>
//                         {Array.isArray(value) ? value.join(', ') : value}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Box>
//         </Paper>
//       )}
//     </Box>
//   );
// };

// export default ResponseDisplay;

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
 
const ResponseDisplay = ({ response }) => {
  const [activeTab, setActiveTab] = React.useState(0);
 
  if (!response) {
    return null;
  }
 
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };
 
  const formatResponse = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return String(data);
    }
  };
 
  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return '#4CAF50';
    if (status >= 300 && status < 400) return '#2196F3';
    if (status >= 400 && status < 500) return '#FF9800';
    return '#f44336';
  };
 
  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 1,
        p: 1,
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
      }}>
        <Typography
          variant="body1"
          sx={{
            color: getStatusColor(response.status),
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: getStatusColor(response.status),
            display: 'inline-block'
          }}></span>
          Status: {response.status} {response.statusText}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Time: {new Date(response.time).toLocaleTimeString()}
        </Typography>
      </Box>
 
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          minHeight: '36px',
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: '36px',
            padding: '6px 16px',
            textTransform: 'none',
            fontSize: '13px'
          }
        }}
      >
        <Tab label="Body" />
        <Tab label="Headers" />
      </Tabs>
 
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#1E1E1E',
          position: 'relative',
          mt: 1,
          maxHeight: '500px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          zIndex: 1
        }}>
          <IconButton
            size="small"
            onClick={() => handleCopy(
              activeTab === 0
                ? formatResponse(response.data)
                : formatResponse(response.headers)
            )}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>
 
        <Box
          sx={{
            overflow: 'auto',
            flex: 1,
            p: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
            }
          }}
        >
          <pre style={{
            margin: 0,
            color: 'white',
            fontSize: '13px',
            fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace',
            lineHeight: 1.5
          }}>
            {activeTab === 0
              ? formatResponse(response.data)
              : formatResponse(response.headers)
            }
          </pre>
        </Box>
 
        {activeTab === 0 && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '40px',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.3)',
              fontSize: '13px',
              fontFamily: 'monospace',
              textAlign: 'right',
              paddingRight: '8px',
              paddingTop: '8px',
              userSelect: 'none'
            }}
          >
            {formatResponse(response.data).split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};
 
export default ResponseDisplay;