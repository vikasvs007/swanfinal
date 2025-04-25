import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import SecurityIcon from "@mui/icons-material/Security";
import { setApiToken, getApiToken, removeApiToken } from "utils/apiToken";

/**
 * Component for managing API tokens
 * Allows admins to view, generate, copy, and revoke API tokens
 */
const ApiTokenManager = () => {
  const [token, setToken] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [openDialog, setOpenDialog] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Load existing token on mount
  useEffect(() => {
    const currentToken = getApiToken();
    if (currentToken) {
      setToken(currentToken);
    }
  }, []);

  const handleGenerateToken = () => {
    // In a real application, this would call your backend to generate a token
    // For demo purposes, we'll create a random string
    const newToken = `api_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
    setApiToken(newToken);
    setToken(newToken);
    setShowToken(true);
    setSnackbar({
      open: true,
      message: "New API token generated successfully",
      severity: "success"
    });
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token).then(
      () => {
        setSnackbar({
          open: true,
          message: "Token copied to clipboard",
          severity: "success"
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        setSnackbar({
          open: true,
          message: "Failed to copy token",
          severity: "error"
        });
      }
    );
  };

  const handleRevokeToken = () => {
    setOpenDialog(false);
    removeApiToken();
    setToken("");
    setShowToken(false);
    setSnackbar({
      open: true,
      message: "API token revoked successfully",
      severity: "info"
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleToggleShowToken = () => {
    setShowToken(!showToken);
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
          <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" fontWeight="medium">
            API Token Management
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          API tokens allow programmatic access to the API without user login. 
          Keep your token secure and never share it in public repositories or client-side code.
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {token ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current API Token:
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={showToken ? token : "•".repeat(Math.min(24, token.length))}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Box>
                      <Tooltip title="Copy token">
                        <IconButton onClick={handleCopyToken} size="small">
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )
                }}
              />
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleToggleShowToken}
                sx={{ ml: 1, minWidth: "80px" }}
              >
                {showToken ? "Hide" : "Show"}
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            No API token is currently set. Generate a new token to begin using the API programmatically.
          </Typography>
        )}
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleGenerateToken}
          >
            {token ? "Regenerate Token" : "Generate Token"}
          </Button>
          
          {token && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Revoke Token
            </Button>
          )}
        </Stack>
      </CardContent>
      
      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Revoke API Token?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently revoke your current API token. Any applications or services using
            this token will no longer be able to access the API. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleRevokeToken} color="error" autoFocus>
            Revoke Token
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ApiTokenManager; 