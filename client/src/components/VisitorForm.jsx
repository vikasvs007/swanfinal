import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Grid,
  useTheme,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { useCreateVisitorMutation, useUpdateVisitorMutation } from "state/api";
import LocationOnIcon from '@mui/icons-material/LocationOn';

const VisitorForm = ({ open, onClose, visitor = null, isEdit = false }) => {
  const theme = useTheme();
  const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation();
  const [updateVisitor, { isLoading: isUpdating }] = useUpdateVisitorMutation();
  
  const isLoading = isCreating || isUpdating;
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState(null);
  
  const [formData, setFormData] = useState({
    ip_address: "",
    device_info: "",
    browser: "",
    os: "",
    location: {
      country: "",
      city: "",
      latitude: null,
      longitude: null,
      coordinates: []
    },
    referrer: "",
    visit_count: 1,
  });

  useEffect(() => {
    if (visitor && isEdit) {
      setFormData({
        ip_address: visitor.ip_address || "",
        device_info: visitor.device_info || "",
        browser: visitor.browser || "",
        os: visitor.os || "",
        location: {
          country: visitor.location?.country || "",
          city: visitor.location?.city || "",
          latitude: visitor.location?.latitude || null,
          longitude: visitor.location?.longitude || null,
          coordinates: visitor.location?.coordinates || []
        },
        referrer: visitor.referrer || "",
        visit_count: visitor.visit_count || 1,
      });
    } else {
      // Set browser and OS info for new visitors
      const userAgent = navigator.userAgent;
      const browserInfo = detectBrowser(userAgent);
      const osInfo = detectOS(userAgent);
      
      setFormData(prev => ({
        ...prev,
        browser: browserInfo,
        os: osInfo,
        device_info: detectDevice(userAgent),
        referrer: document.referrer || '',
      }));
    }
  }, [visitor, isEdit]);

  const detectBrowser = (userAgent) => {
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
    return 'Unknown';
  };

  const detectOS = (userAgent) => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'MacOS';
    if (userAgent.includes('Linux') && !userAgent.includes('Android')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown';
  };

  const detectDevice = (userAgent) => {
    // Check for mobile devices first
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(userAgent)
    ) {
      // Differentiate between phones and tablets
      if (
        /iPad|tablet|Tablet/i.test(userAgent) || 
        (
          /Android/i.test(userAgent) && 
          !/Mobile/i.test(userAgent)
        )
      ) {
        return 'Tablet';
      }
      return 'Mobile';
    }
    
    // If no mobile indicators, assume desktop
    return 'Desktop';
  };

  const getIPAndLocation = async () => {
    try {
      setFetchingLocation(true);
      setLocationError(null);
      
      // Only use the browser's native geolocation API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            console.log('Browser geolocation coordinates:', latitude, longitude);
            
            try {
              // We still need to get the IP address
              const ipResponse = await fetch('https://api.ipify.org?format=json');
              const ipData = await ipResponse.json();
              const ip = ipData.ip || "Unknown";
              
              // Attempt to get location names from coordinates using reverse geocoding
              try {
                const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const geoData = await geoResponse.json();
                
                setFormData(prev => ({
                  ...prev,
                  ip_address: ip,
                  location: {
                    country: geoData.address?.country || "Unknown",
                    city: geoData.address?.city || geoData.address?.town || geoData.address?.village || "Unknown",
                    latitude,
                    longitude,
                    coordinates: [longitude, latitude] // GeoJSON format [longitude, latitude]
                  }
                }));
              } catch (geoError) {
                // If reverse geocoding fails, just use coordinates without location names
                console.error('Reverse geocoding failed:', geoError);
                setFormData(prev => ({
                  ...prev,
                  ip_address: ip,
                  location: {
                    country: "Unknown",
                    city: "Unknown",
                    latitude,
                    longitude,
                    coordinates: [longitude, latitude]
                  }
                }));
              }
              
              setLocationError(null);
            } catch (ipError) {
              console.error('Error getting IP:', ipError);
              
              // Even if IP detection fails, we still have the coordinates
              setFormData(prev => ({
                ...prev,
                ip_address: "127.0.0.1", // Fallback IP
                location: {
                  country: "Unknown",
                  city: "Unknown",
                  latitude,
                  longitude,
                  coordinates: [longitude, latitude]
                }
              }));
            }
            
            setFetchingLocation(false);
          },
          (geoError) => {
            console.error('Browser geolocation error:', geoError);
            
            let errorMessage = "Location detection failed. ";
            
            switch(geoError.code) {
              case geoError.PERMISSION_DENIED:
                errorMessage += "Please allow location access in your browser settings.";
                break;
              case geoError.POSITION_UNAVAILABLE:
                errorMessage += "Location information is unavailable.";
                break;
              case geoError.TIMEOUT:
                errorMessage += "The request to get location timed out.";
                break;
              default:
                errorMessage += "An unknown error occurred.";
            }
            
            setLocationError(errorMessage);
            setFetchingLocation(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        setLocationError("Geolocation is not supported by this browser. Please enter coordinates manually.");
        setFetchingLocation(false);
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      setLocationError('Failed to get location. Please enter coordinates manually.');
      setFetchingLocation(false);
    }
  };

  const handleLocationToggle = (event) => {
    const enabled = event.target.checked;
    setLocationEnabled(enabled);
    
    if (enabled) {
      getIPAndLocation();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      
      if (parent === "location" && (child === "latitude" || child === "longitude")) {
        // Convert to number and handle the coordinates array update
        const numValue = value === '' ? null : parseFloat(value);
        
        setFormData((prev) => {
          // Get current lat/long values
          let latitude = prev.location.latitude;
          let longitude = prev.location.longitude;
          
          // Update the specific one that changed
          if (child === "latitude") {
            latitude = numValue;
          } else {
            longitude = numValue;
          }
          
          // Update coordinates array only if both lat and long are valid numbers
          const coordinates = 
            (latitude !== null && longitude !== null) 
            ? [longitude, latitude] // GeoJSON format is [longitude, latitude]
            : [];
            
          return {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: numValue,
              coordinates
            },
          };
        });
      } else {
        // Regular nested field update
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        }));
      }
    } else {
      // Top-level field update
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    
    // Regular number fields like visit_count
    if (!name.includes(".")) {
      const numberValue = parseInt(value, 10) || 0;
      
      setFormData((prev) => ({
        ...prev,
        [name]: numberValue,
      }));
    } 
    // Don't need special handling for location fields as they're handled in handleChange
  };

  const handleSubmit = async () => {
    try {
      if (isEdit && visitor?._id) {
        await updateVisitor({
          id: visitor._id,
          ...formData
        }).unwrap();
      } else {
        await createVisitor(formData).unwrap();
      }
      onClose(true);
    } catch (error) {
      console.error("Error saving visitor:", error);
      const errorMessage = error.data?.message || error.message || "Unknown error occurred";
      setLocationError(`Error: ${errorMessage}`);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.alt,
          color: theme.palette.text.primary,
        },
      }}
    >
      <DialogTitle sx={{ color: theme.palette.text.primary }}>
        {isEdit ? "Edit Visitor" : "Add New Visitor"}
      </DialogTitle>
      
      <DialogContent>
        {!isEdit && (
          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ 
              p: 2, 
              mb: 2, 
              border: '1px dashed', 
              borderColor: theme.palette.primary.main,
              borderRadius: '8px',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)'
            }}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Location Detection Instructions:
              </Typography>
              <Typography variant="body2" color={theme.palette.text.primary} paragraph>
                When you toggle "Enable location detection", your browser will ask for permission to access your location.
                Please click "Allow" to get accurate coordinates for the map.
              </Typography>
              <Typography variant="body2" fontStyle="italic" color={theme.palette.text.secondary}>
                Note: We only use your location coordinates for displaying visitor positions on the map. No location data is shared with third parties.
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={locationEnabled}
                    onChange={handleLocationToggle}
                    color="primary"
                    disabled={fetchingLocation}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOnIcon color="primary" />
                    <Typography color={theme.palette.text.primary}>
                      Enable location detection
                    </Typography>
                  </Box>
                }
                sx={{ color: theme.palette.text.primary }}
              />
              {fetchingLocation && (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2" color={theme.palette.text.primary}>
                    Detecting location...
                  </Typography>
                </Box>
              )}
            </Box>
            
            {locationEnabled && !fetchingLocation && formData.ip_address && !locationError && (
              <Alert severity="success" sx={{ mt: 1 }}>
                Successfully detected location: {formData.location.latitude.toFixed(6)}, {formData.location.longitude.toFixed(6)}
                {formData.location?.country !== "Unknown" && ` (${formData.location.country}${formData.location.city !== "Unknown" ? `, ${formData.location.city}` : ''})`}
              </Alert>
            )}
          </Box>
        )}
        
        {locationError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {locationError}
          </Alert>
        )}
      
        <Box component="form" noValidate sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                name="ip_address"
                label="IP Address"
                value={formData.ip_address}
                onChange={handleChange}
                fullWidth
                required
                variant="filled"
                disabled={fetchingLocation}
                sx={{
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  mb: 2,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="device_info"
                label="Device Information"
                value={formData.device_info}
                onChange={handleChange}
                fullWidth
                variant="filled"
                sx={{
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  mb: 2,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="browser"
                label="Browser"
                value={formData.browser}
                onChange={handleChange}
                fullWidth
                variant="filled"
                sx={{
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  mb: 2,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="os"
                label="Operating System"
                value={formData.os}
                onChange={handleChange}
                fullWidth
                variant="filled"
                sx={{
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  mb: 2,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="location.country"
                label="Country"
                value={formData.location.country}
                onChange={handleChange}
                fullWidth
                variant="filled"
                disabled={fetchingLocation}
                sx={{
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  mb: 2,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="location.city"
                label="City"
                value={formData.location.city}
                onChange={handleChange}
                fullWidth
                variant="filled"
                disabled={fetchingLocation}
                sx={{
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  mb: 2,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="location.latitude"
                label="Latitude"
                type="number"
                value={formData.location.latitude || ''}
                onChange={handleChange}
                fullWidth
                variant="filled"
                disabled={fetchingLocation}
                sx={{
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  mb: 2,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="location.longitude"
                label="Longitude"
                type="number"
                value={formData.location.longitude || ''}
                onChange={handleChange}
                fullWidth
                variant="filled"
                disabled={fetchingLocation}
                sx={{
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  mb: 2,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="referrer"
                label="Referrer"
                value={formData.referrer}
                onChange={handleChange}
                fullWidth
                variant="filled"
                sx={{
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  mb: 2,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="visit_count"
                label="Visit Count"
                type="number"
                value={formData.visit_count}
                onChange={handleNumberChange}
                fullWidth
                variant="filled"
                InputProps={{ inputProps: { min: 1 } }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  mb: 2,
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={() => onClose(false)} 
          color="secondary"
          variant="outlined"
          disabled={isLoading}
          sx={{ color: theme.palette.text.primary }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary"
          variant="contained"
          disabled={isLoading || fetchingLocation}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
          sx={{
            backgroundImage: theme.palette.background.gradient,
            color: theme.palette.text.light,
            "&:hover": {
              backgroundImage: theme.palette.background.hoverGradient,
            }
          }}
        >
          {isLoading ? "Saving..." : isEdit ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VisitorForm; 