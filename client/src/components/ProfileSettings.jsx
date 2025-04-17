import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  Avatar,
  IconButton,
  Alert,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import { PhotoCamera, Save } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useUpdateUserMutation, useUploadPhotoMutation } from "state/api";

const ProfileSettings = () => {
  const theme = useTheme();
  const user = useSelector((state) => state.global.user);
  const [updateUser] = useUpdateUserMutation();
  const [uploadPhoto] = useUploadPhotoMutation();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      handlePhotoUpload(file);
    }
  };

  const handlePhotoUpload = async (file) => {
    try {
      await uploadPhoto({ userId: user._id, photo: file }).unwrap();
      setMessage({
        type: "success",
        text: "Profile photo updated successfully",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update profile photo",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords if changing
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({
          type: "error",
          text: "New passwords do not match",
        });
        return;
      }
      if (!formData.oldPassword) {
        setMessage({
          type: "error",
          text: "Please enter your current password",
        });
        return;
      }
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      if (formData.newPassword) {
        updateData.oldPassword = formData.oldPassword;
        updateData.newPassword = formData.newPassword;
      }

      await updateUser({
        userId: user._id,
        ...updateData,
      }).unwrap();

      setMessage({
        type: "success",
        text: "Profile updated successfully",
      });

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text: error.data?.message || "Failed to update profile",
      });
    }
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Typography variant="h4" mb={4} color={theme.palette.secondary[100]}>
        Profile Settings
      </Typography>

      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: "", text: "" })}
        >
          {message.text}
        </Alert>
      )}

      <Paper
        sx={{
          p: 3,
          backgroundColor: theme.palette.background.alt,
          borderRadius: "0.55rem",
        }}
      >
        <Grid container spacing={4}>
          {/* Profile Photo Section */}
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={user?.photo}
                sx={{
                  width: 150,
                  height: 150,
                  mb: 2,
                  border: `2px solid ${theme.palette.secondary[300]}`,
                }}
              />
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="photo-upload"
                type="file"
                onChange={handlePhotoChange}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
                  sx={{
                    color: theme.palette.secondary[300],
                    borderColor: theme.palette.secondary[300],
                  }}
                >
                  Change Photo
                </Button>
              </label>
            </Box>
          </Grid>

          {/* Profile Details Section */}
          <Grid item xs={12} md={8}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    sx={{
                      "& label": { color: theme.palette.secondary[300] },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: theme.palette.secondary[300],
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    sx={{
                      "& label": { color: theme.palette.secondary[300] },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: theme.palette.secondary[300],
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    sx={{
                      "& label": { color: theme.palette.secondary[300] },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: theme.palette.secondary[300],
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }}>
                    <Typography color={theme.palette.secondary[300]}>
                      Change Password
                    </Typography>
                  </Divider>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="oldPassword"
                    type="password"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    sx={{
                      "& label": { color: theme.palette.secondary[300] },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: theme.palette.secondary[300],
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    sx={{
                      "& label": { color: theme.palette.secondary[300] },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: theme.palette.secondary[300],
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    sx={{
                      "& label": { color: theme.palette.secondary[300] },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: theme.palette.secondary[300],
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    sx={{
                      mt: 2,
                      backgroundColor: theme.palette.secondary.light,
                      color: theme.palette.background.alt,
                      "&:hover": {
                        backgroundColor: theme.palette.secondary.main,
                      },
                    }}
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProfileSettings;
