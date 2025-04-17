import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  useTheme,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Switch,
  FormControlLabel,
  Typography,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import {
  DataGrid,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";
import Header from "components/Header";
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from "state/api";

const Users = () => {
  const theme = useTheme();
  const { data, isLoading } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    isActive: true,
    phone: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Function to generate Gmail compose URL
  const getGmailComposeUrl = (email) => {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        isActive: user.isActive,
        phone: user.phone || "",
      });
      setSelectedUser(user);
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "customer",
        isActive: true,
        phone: "",
      });
      setSelectedUser(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "customer",
      isActive: true,
      phone: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isActive" ? checked : value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    // Phone validation
    if (!formData.phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.trim())) {
      errors.phone = "Please enter a valid phone number";
    }

    // Password validation for new users
    if (!selectedUser && !formData.password) {
      errors.password = "Password is required for new users";
    } else if (!selectedUser && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      // Create base user data
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        isActive: formData.isActive,
        phone: formData.phone.trim(),
      };

      if (selectedUser) {
        // For update
        try {
          await updateUser({
            id: selectedUser._id,
            ...userData // Send data directly without nesting
          }).unwrap();
          handleCloseDialog();
        } catch (updateError) {
          console.error('Update error:', updateError);
          alert(updateError.data?.message || 'Failed to update user. Please try again.');
        }
      } else {
        // For create
        try {
          if (!formData.password) {
            alert("Password is required for new users");
            return;
          }
          await createUser({
            ...userData,
            password: formData.password
          }).unwrap();
          handleCloseDialog();
        } catch (createError) {
          console.error('Create error:', createError);
          alert(createError.data?.message || 'Failed to create user. Please try again.');
        }
      }
    } catch (error) {
      console.error("Failed to save user:", error);
      alert(error.data?.message || "An unexpected error occurred. Please try again.");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id).unwrap();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const columns = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      renderCell: (params) => (
        <Avatar
          src={params.value}
          alt={params.row.name}
          sx={{ width: 32, height: 32 }}
        >
          <PersonIcon />
        </Avatar>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ color: theme.palette.secondary[100] }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      renderCell: (params) => (
        <Box 
          component="a" 
          href={getGmailComposeUrl(params.value)}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1,
            color: theme.palette.secondary[300],
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
              color: theme.palette.primary.main
            } 
          }}
          title="Open in Gmail"
        >
          <EmailIcon fontSize="small" />
          <Typography sx={{ color: 'inherit' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      flex: 0.8,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {params.value === "admin" && (
            <AdminIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
          )}
          <Typography
            sx={{
              color:
                params.value === "admin"
                  ? theme.palette.warning.main
                  : theme.palette.secondary[100],
            }}
          >
            {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          </Typography>
        </Box>
      ),
    },
    // {
    //   field: "isActive",
    //   headerName: "Status",
    //   flex: 0.8,
    //   renderCell: (params) => (
    //     <Typography
    //       sx={{
    //         color: params.value
    //           ? theme.palette.success.main
    //           : theme.palette.error.main,
    //       }}
    //     >
    //       {params.value ? "Active" : "Inactive"}
    //     </Typography>
    //   ),
    // },
    // {
    //   field: "createdAt",
    //   headerName: "Created At",
    //   flex: 1,
    //   renderCell: (params) => (
    //     <Typography sx={{ color: theme.palette.secondary[100] }}>
    //       {new Date(params.value).toLocaleString()}
    //     </Typography>
    //   ),
    // },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleOpenDialog(params.row)}
            sx={{ color: theme.palette.secondary[300] }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteUser(params.row._id)}
            sx={{ color: theme.palette.error.main }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="USERS" subtitle="Manage system users" />
      
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: theme.palette.secondary[300],
            color: theme.palette.background.alt,
            "&:hover": {
              backgroundColor: theme.palette.secondary[100],
            },
          }}
        >
          Add User
        </Button>
      </Box>

      <Card
        sx={{
          backgroundImage: "none",
          backgroundColor: theme.palette.background.alt,
          borderRadius: "0.55rem",
        }}
      >
        <CardContent>
          {isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="60vh"
            >
              <CircularProgress />
            </Box>
          ) : (
            <Box
              height="60vh"
              sx={{
                "& .MuiDataGrid-root": {
                  border: "none",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "none",
                  color: theme.palette.text.primary,
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: theme.palette.grey[50],
                  color: theme.palette.text.primary,
                  borderBottom: "none",
                },
                "& .MuiDataGrid-virtualScroller": {
                  backgroundColor: theme.palette.background.alt,
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: theme.palette.grey[50],
                  color: theme.palette.text.primary,
                  borderTop: "none",
                },
                "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                  color: theme.palette.text.primary,
                },
              }}
            >
              <DataGrid
                rows={data || []}
                columns={columns}
                pageSize={10}
                getRowId={(row) => row._id}
                rowsPerPageOptions={[10]}
                disableSelectionOnClick
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.alt,
            color: theme.palette.text.primary,
          }
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          {selectedUser ? "Edit User" : "Add New User"}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              mt: 2
            }}
          >
            <TextField
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.name}
              helperText={formErrors.name}
              sx={{
                "& label": { color: theme.palette.text.primary },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: theme.palette.secondary[300] },
                  "&:hover fieldset": { borderColor: theme.palette.secondary[400] },
                },
                "& .MuiInputBase-input": { color: theme.palette.text.primary },
              }}
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                endAdornment: formData.email && (
                  <InputAdornment position="end">
                    <Tooltip title="Open in Gmail">
                      <IconButton
                        edge="end"
                        onClick={() => window.open(getGmailComposeUrl(formData.email), '_blank')}
                        color="primary"
                        size="small"
                      >
                        <LaunchIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& label": { color: theme.palette.text.primary },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: theme.palette.secondary[300] },
                  "&:hover fieldset": { borderColor: theme.palette.secondary[400] },
                },
                "& .MuiInputBase-input": { color: theme.palette.text.primary },
              }}
            />
            <TextField
              name="phone"
              label="Phone"
              value={formData.phone}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              placeholder="+1234567890"
              sx={{
                "& label": { color: theme.palette.text.primary },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: theme.palette.secondary[300] },
                  "&:hover fieldset": { borderColor: theme.palette.secondary[400] },
                },
                "& .MuiInputBase-input": { color: theme.palette.text.primary },
              }}
            />
            <TextField
              name="password"
              label={selectedUser ? "Password (leave blank to keep current)" : "Password"}
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
              required={!selectedUser}
              error={!!formErrors.password}
              helperText={formErrors.password}
              sx={{
                "& label": { color: theme.palette.text.primary },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: theme.palette.secondary[300] },
                  "&:hover fieldset": { borderColor: theme.palette.secondary[400] },
                },
                "& .MuiInputBase-input": { color: theme.palette.text.primary },
              }}
            />
            <TextField
              name="role"
              label="Role"
              select
              value={formData.role}
              onChange={handleInputChange}
              fullWidth
              sx={{
                "& label": { color: theme.palette.text.primary },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: theme.palette.secondary[300] },
                  "&:hover fieldset": { borderColor: theme.palette.secondary[400] },
                },
                "& .MuiInputBase-input": { color: theme.palette.text.primary },
                "& .MuiSelect-select": { color: theme.palette.text.primary },
              }}
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  color="primary"
                />
              }
              label="Active"
              sx={{ color: theme.palette.text.primary }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: theme.palette.text.primary }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundImage: theme.palette.background.gradient,
              color: theme.palette.text.light,
              "&:hover": {
                backgroundImage: theme.palette.background.hoverGradient,
              },
            }}
          >
            {selectedUser ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
