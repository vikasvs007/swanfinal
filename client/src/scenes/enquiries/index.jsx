import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Chip,
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
  Phone as PhoneIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";
import Header from "components/Header";
import { 
  useGetEnquiriesQuery, 
  useCreateEnquiryMutation, 
  useUpdateEnquiryMutation, 
  useDeleteEnquiryMutation,
  useGetUsersQuery 
} from "state/api";

const statusMapping = {
  'open': 'pending',
  'pending': 'pending',
  'processing': 'processing',
  'resolved': 'resolved',
  'closed': 'closed'
};

const Enquiries = () => {
  const theme = useTheme();
  const { data: enquiries, isLoading } = useGetEnquiriesQuery();
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();
  const [createEnquiry] = useCreateEnquiryMutation();
  const [updateEnquiry] = useUpdateEnquiryMutation();
  const [deleteEnquiry] = useDeleteEnquiryMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [formData, setFormData] = useState({
    user_id: "",
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    status: "pending",
    response: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Function to generate Gmail compose URL
  const getGmailComposeUrl = (email) => {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
  };

  const handleOpenDialog = (enquiry = null) => {
    if (enquiry) {
      const normalizedStatus = statusMapping[enquiry.status] || 'pending';
      
      setFormData({
        user_id: enquiry.user_id?._id || "",
        name: enquiry.name || "",
        email: enquiry.email || "",
        phone: enquiry.phone || "",
        subject: enquiry.subject || "",
        message: enquiry.message || "",
        status: normalizedStatus,
        response: enquiry.response || "",
      });
      setSelectedEnquiry(enquiry);
    } else {
      setFormData({
        user_id: "",
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        status: "pending",
        response: "",
      });
      setSelectedEnquiry(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEnquiry(null);
    setFormData({
      user_id: "",
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      status: "pending",
      response: "",
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      errors.message = "Message is required";
    }

    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone.trim())) {
      errors.phone = "Please enter a valid phone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      const enquiryData = {
        user_id: formData.user_id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        status: formData.status,
        response: formData.response.trim(),
      };

      if (selectedEnquiry) {
        await updateEnquiry({
          id: selectedEnquiry._id,
          ...enquiryData,
        }).unwrap();
      } else {
        await createEnquiry(enquiryData).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save enquiry:", error);
      alert(error.data?.message || "An unexpected error occurred. Please try again.");
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      try {
        await deleteEnquiry(id).unwrap();
      } catch (error) {
        console.error("Failed to delete enquiry:", error);
        alert(error.data?.message || "Failed to delete enquiry. Please try again.");
      }
    }
  };

  // Auto-fill user information when selecting a user
  const handleUserChange = (e) => {
    const userId = e.target.value;
    setFormData(prev => ({
      ...prev,
      user_id: userId
    }));
    
    if (userId) {
      const selectedUser = users?.find(user => user._id === userId);
      if (selectedUser) {
        setFormData(prev => ({
          ...prev,
          name: selectedUser.name || prev.name,
          email: selectedUser.email || prev.email,
          phone: selectedUser.phone || prev.phone
        }));
      }
    }
  };

  const columns = [
    {
      field: "user_id",
      headerName: "User Details",
      flex: 1.5,
      renderCell: (params) => {
        const email = params.value?.email || params.row.email || "";
        const phone = params.value?.phone || params.row.phone || "";
        return (
          <Box>
            <Typography 
              sx={{ 
                color: theme.palette.secondary[100],
                fontSize: '1rem',
                fontWeight: 'bold',
                mb: 0.5
              }}
            >
              {params.value?.name || params.row.name || "Unknown User"}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {email && (
                <Box 
                  component="a" 
                  href={getGmailComposeUrl(email)}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: theme.palette.secondary[300],
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: theme.palette.primary.main
                    }
                  }}
                  title="Open in Gmail"
                >
                  <EmailIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  <Typography sx={{ fontSize: '0.9rem' }}>{email}</Typography>
                </Box>
              )}
              {email && phone && (
                <Typography 
                  sx={{ 
                    color: theme.palette.secondary[300],
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}
                >
                  
                </Typography>
              )}
              {/* {phone && (
                <Box 
                  component="a" 
                  href={`tel:${phone}`}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: theme.palette.secondary[300],
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  <Typography sx={{ fontSize: '0.9rem' }}>{phone}</Typography>
                </Box>
              )} */}
              {/* )} */}
            </Box>
          </Box>
        );
      },
    },
    {
      field: "subject",
      headerName: "Subject",
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ color: theme.palette.secondary[100] }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      renderCell: (params) => {
        const phone = params.value || "";
        if (!phone) return "-";
        
        return (
          <Box 
            component="a" 
            href={`tel:${phone}`}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: theme.palette.secondary[300],
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
                color: theme.palette.primary.main
              }
            }}
          >
            <PhoneIcon sx={{ fontSize: 18, mr: 0.5 }} />
            <Typography>{phone}</Typography>
          </Box>
        );
      },
    },
    {
      field: "message",
      headerName: "Message",
      flex: 2,
      renderCell: (params) => (
        <Typography 
          sx={{ 
            color: theme.palette.secondary[100],
            whiteSpace: "pre-wrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      renderCell: (params) => {
        const normalizedStatus = statusMapping[params.value] || 'pending';
        
        return (
          <Chip
            label={normalizedStatus}
            color={
              normalizedStatus === "resolved" 
                ? "success" 
                : normalizedStatus === "processing" 
                  ? "info" 
                  : normalizedStatus === "closed"
                    ? "error"
                    : "warning"
            }
            sx={{ width: 80 }}
          />
        );
      },
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ color: theme.palette.text.primary }}>
          {new Date(params.value).toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleOpenDialog(params.row)}
            sx={{ color: theme.palette.secondary[600] }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteEnquiry(params.row._id)}
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
      <Header title="ENQUIRIES" subtitle="Manage customer enquiries" />
      
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundImage: theme.palette.background.gradient,
            color: theme.palette.text.light,
            "&:hover": {
              backgroundImage: theme.palette.background.hoverGradient,
            },
          }}
        >
          Add Enquiry
        </Button>
      </Box>

      <Card
        className="enquiry-section"
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
              height="75vh"
              sx={{
                "& .MuiDataGrid-root": {
                  border: "none",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "none",
                  backgroundColor: theme.palette.background.alt,
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
                "& .MuiDataGrid-row": {
                  "&:nth-of-type(2n)": {
                    backgroundColor: theme.palette.grey[50],
                  },
                },
              }}
            >
              <DataGrid
                loading={isLoading || !enquiries}
                getRowId={(row) => row._id}
                rows={enquiries || []}
                columns={columns}
                pageSize={20}
                rowsPerPageOptions={[20, 50, 100]}
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
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.text.primary,
          },
        }}
      >
        <DialogTitle>
          {selectedEnquiry ? "Edit Enquiry" : "Add New Enquiry"}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              mt: 2,
            }}
          >
            <TextField
              select
              name="user_id"
              label="User (Optional)"
              value={formData.user_id}
              onChange={handleUserChange}
              fullWidth
              error={!!formErrors.user_id}
              helperText={formErrors.user_id || "Select a user or leave blank and provide a name"}
              sx={{
                "& label": { color: theme.palette.text.primary },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: theme.palette.secondary[300] },
                  "&:hover fieldset": { borderColor: theme.palette.secondary[400] },
                },
                "& .MuiInputBase-input": { color: theme.palette.text.primary },
              }}
            >
              <MenuItem value="">
                <em>None (Enter name below)</em>
              </MenuItem>
              {isLoadingUsers ? (
                <MenuItem disabled>Loading users...</MenuItem>
              ) : (
                users?.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))
              )}
            </TextField>
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
              name="subject"
              label="Subject"
              value={formData.subject}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.subject}
              helperText={formErrors.subject}
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
              name="message"
              label="Message"
              value={formData.message}
              onChange={handleInputChange}
              fullWidth
              required
              multiline
              rows={4}
              error={!!formErrors.message}
              helperText={formErrors.message}
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
              select
              name="status"
              label="Status"
              value={formData.status}
              onChange={handleInputChange}
              fullWidth
              sx={{
                "& label": { color: theme.palette.text.primary },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: theme.palette.secondary[300] },
                  "&:hover fieldset": { borderColor: theme.palette.secondary[400] },
                },
                "& .MuiInputBase-input": { color: theme.palette.text.primary },
              }}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
            <TextField
              name="response"
              label="Response"
              value={formData.response}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
              sx={{
                "& label": { color: theme.palette.text.primary },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: theme.palette.secondary[300] },
                  "&:hover fieldset": { borderColor: theme.palette.secondary[400] },
                },
                "& .MuiInputBase-input": { color: theme.palette.text.primary },
              }}
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
              backgroundColor: theme.palette.secondary[300],
              "&:hover": {
                backgroundColor: theme.palette.secondary[100],
              },
            }}
          >
            {selectedEnquiry ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Enquiries;
