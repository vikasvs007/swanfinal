import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  useTheme,
  CircularProgress,
} from "@mui/material";

const ConfirmDialog = ({
  open,
  title,
  content,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  confirmColor = "error",
  cancelColor = "secondary",
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.alt,
          borderRadius: "0.55rem",
        },
      }}
    >
      <DialogTitle sx={{ color: theme.palette.secondary[100] }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: theme.palette.secondary[300] }}>
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onCancel}
          color={cancelColor}
          variant="outlined"
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={confirmColor}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? "Processing..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog; 