import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';
import { getApiToken } from 'utils/apiToken';

// Syntax highlighting styles
const codeStyle = {
  backgroundColor: '#f5f5f5',
  padding: '16px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '14px',
  overflow: 'auto',
  whiteSpace: 'pre',
  margin: '0',
  lineHeight: '1.5'
};

// Code snippets for different languages/frameworks
const codeExamples = {
  javascript: (token) => `// JavaScript fetch example
const apiToken = "${token || 'YOUR_API_TOKEN'}";

async function fetchData() {
  try {
    const response = await fetch('${process.env.REACT_APP_BASE_URL}/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`ApiKey \${apiToken}\`
      }
    });
    
    if (!response.ok) {
      throw new Error(\`API error: \${response.status}\`);
    }
    
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}`,

  nodejs: (token) => `// Node.js axios example
const axios = require('axios');

const apiToken = "${token || 'YOUR_API_TOKEN'}";
const baseUrl = "${process.env.REACT_APP_BASE_URL || 'https://your-api-url.com/api'}";

const apiClient = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`ApiKey \${apiToken}\`
  }
});

// Example: Get all users
async function getUsers() {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.message);
    throw error;
  }
}

// Example: Create a new product
async function createProduct(product) {
  try {
    const response = await apiClient.post('/products', product);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error.message);
    throw error;
  }
}`,

  python: (token) => `# Python requests example
import requests

api_token = "${token || 'YOUR_API_TOKEN'}"
base_url = "${process.env.REACT_APP_BASE_URL || 'https://your-api-url.com/api'}"

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'ApiKey {api_token}'
}

def get_users():
    try:
        response = requests.get(f'{base_url}/users', headers=headers)
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching users: {e}")
        return None

def create_product(product_data):
    try:
        response = requests.post(
            f'{base_url}/products',
            json=product_data,
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error creating product: {e}")
        return None`,

  curl: (token) => `# cURL example
curl -X GET "${process.env.REACT_APP_BASE_URL || 'https://your-api-url.com/api'}/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: ApiKey ${token || 'YOUR_API_TOKEN'}"

# Create a product
curl -X POST "${process.env.REACT_APP_BASE_URL || 'https://your-api-url.com/api'}/products" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: ApiKey ${token || 'YOUR_API_TOKEN'}" \\
  -d '{"name": "New Product", "price": 99.99, "description": "Product description"}'`
};

// Main component
const ApiClientExample = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('javascript');
  const [copied, setCopied] = useState(false);
  
  // Get the token if available
  const token = getApiToken();
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeTab](token));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Card
      elevation={3}
      sx={{
        mb: 3,
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        overflow: "visible"
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <CodeIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight="medium">
            API Usage Examples
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          These examples show how to use your API token to authenticate requests. Remember to keep your token secure and never expose it in client-side code that will be publicly accessible.
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="JavaScript" value="javascript" />
          <Tab label="Node.js" value="nodejs" />
          <Tab label="Python" value="python" />
          <Tab label="cURL" value="curl" />
        </Tabs>
        
        <Paper sx={{ position: 'relative', mb: 2 }}>
          <Tooltip 
            title={copied ? "Copied!" : "Copy to clipboard"}
            placement="top"
            arrow
          >
            <IconButton 
              size="small"
              onClick={handleCopyCode}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <pre style={codeStyle}>
            {codeExamples[activeTab](token)}
          </pre>
        </Paper>
        
        <Typography variant="caption" color="text.secondary">
          Note: Replace the token value with your actual API token in production environments. 
          {!token && " Generate an API token from the token management section above."}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ApiClientExample; 