import React, { useState, useEffect } from "react";
import { Box, useTheme, CircularProgress, Typography, Button, Alert } from "@mui/material";
import { useGetVisitorsQuery } from "state/api";
import Header from "components/Header";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { tokens } from "../../theme";
import { Public as GlobeIcon, Add as AddIcon, LocationOn as LocationIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom marker icon (red pin)
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Geography = () => {
  const theme = useTheme();
  const colors = tokens;
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetVisitorsQuery();
  const [visitorPoints, setVisitorPoints] = useState([]);
  const [isDataProcessed, setIsDataProcessed] = useState(false);
  const [dataLoadError, setDataLoadError] = useState(null);

  useEffect(() => {
    const processVisitorData = () => {
      if (!data?.visitors) {
        console.error("No visitor data available");
        setDataLoadError("No visitor data available.");
        setVisitorPoints([]);
        setIsDataProcessed(true);
        return;
      }

      console.log("Raw visitors data:", data.visitors);
      
      const processedPoints = data.visitors
        .filter(visitor => {
          // Detailed logging to troubleshoot coordinate issues
          console.log(`Visitor ${visitor._id}:`, {
            location: visitor.location,
            hasLocation: !!visitor.location,
            hasLatLng: visitor.location && (visitor.location.latitude && visitor.location.longitude),
            hasCoordinates: visitor.location && (visitor.location.coordinates && visitor.location.coordinates.length === 2),
            latitude: visitor.location?.latitude,
            longitude: visitor.location?.longitude,
            coordinates: visitor.location?.coordinates,
          });
          
          return visitor.location && 
            (
              // Check if we have coordinates in the location object
              (visitor.location.latitude && visitor.location.longitude) ||
              // Or check if we have coordinates array
              (visitor.location.coordinates && visitor.location.coordinates.length === 2)
            );
        })
        .map(visitor => {
          // Get coordinates from stored location data
          // Prefer latitude/longitude fields, fall back to coordinates array
          let lat = null, lng = null;
          
          if (visitor.location.latitude && visitor.location.longitude) {
            lat = typeof visitor.location.latitude === 'string' 
              ? parseFloat(visitor.location.latitude) 
              : visitor.location.latitude;
              
            lng = typeof visitor.location.longitude === 'string' 
              ? parseFloat(visitor.location.longitude) 
              : visitor.location.longitude;
              
            console.log(`Using lat/lng fields for ${visitor._id}:`, lat, lng);
          } else if (visitor.location.coordinates && visitor.location.coordinates.length === 2) {
            // GeoJSON format is [longitude, latitude]
            lng = typeof visitor.location.coordinates[0] === 'string' 
              ? parseFloat(visitor.location.coordinates[0]) 
              : visitor.location.coordinates[0];
              
            lat = typeof visitor.location.coordinates[1] === 'string' 
              ? parseFloat(visitor.location.coordinates[1]) 
              : visitor.location.coordinates[1];
              
            console.log(`Using coordinates array for ${visitor._id}:`, lat, lng);
          }
          
          // Skip if no valid coordinates
          if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
            console.warn(`Invalid coordinates for visitor ${visitor._id}:`, {
              lat, lng, 
              rawLat: visitor.location.latitude,
              rawLng: visitor.location.longitude,
              rawCoords: visitor.location.coordinates
            });
            return null;
          }

          return {
            id: visitor._id || Math.random().toString(),
            name: visitor.name || 'Anonymous Visitor',
            location: visitor.location.city || 'Unknown Location',
            country: visitor.location.country || 'Unknown Country',
            lat: lat,
            lng: lng,
            visitCount: visitor.visit_count || 1,
            lastVisit: visitor.last_visited_at || new Date().toISOString(),
            ip: visitor.ip_address,
            coordinateSource: visitor.location.latitude ? 'fields' : 'array'
          };
        })
        .filter(Boolean); // Remove any null entries

      console.log("Processed visitor points:", processedPoints);
      
      if (processedPoints.length === 0) {
        setDataLoadError("No visitors with valid coordinates found in the database.");
      } else {
        setDataLoadError(null);
      }
      
      setVisitorPoints(processedPoints);
      setIsDataProcessed(true);
    };

    if (data) {
      processVisitorData();
    }
  }, [data]);

  const handleAddVisitor = () => {
    navigate('/visitors');
  };

  return (
    <Box m="20px">
      <Header 
        title="GEOGRAPHY" 
        subtitle="Find where your visitors are located." 
        icon={<GlobeIcon sx={{ 
          fontSize: 28, 
          color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main
        }} />}
      />
      
      <Box sx={{ mb: 2 }}>
        <Alert 
          severity="info" 
          icon={<LocationIcon fontSize="inherit" />}
          action={
            <Button
              color="primary"
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddVisitor}
            >
              Add Visitor
            </Button>
          }
        >
          To add a visitor with location coordinates, go to the Visitors page, click Add Visitor, and enable location detection.
        </Alert>
      </Box>
      
      <Box
        height="70vh"
        border={`1px solid ${colors.grey[100]}`}
        borderRadius="4px"
        position="relative"
      >
        {isLoading && !isDataProcessed && (
          <Box
            position="absolute"
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="100%"
            height="100%"
            zIndex={10}
            bgcolor="rgba(0,0,0,0.1)"
          >
            <CircularProgress />
          </Box>
        )}
        
        {dataLoadError && (
          <Box
            position="absolute"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width="100%"
            height="100%"
            zIndex={10}
            p={3}
          >
            <Typography variant="h5" color="error" align="center" gutterBottom>
              {dataLoadError}
            </Typography>
            <Typography variant="body1" align="center" paragraph>
              Please add visitors with valid coordinates using the "Enable location detection" switch in the visitor form.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddVisitor}
              sx={{
                mt: 2,
                backgroundImage: theme.palette.background.gradient,
                color: theme.palette.text.light,
                "&:hover": {
                  backgroundImage: theme.palette.background.hoverGradient,
                }
              }}
            >
              Add Visitor with Location
            </Button>
          </Box>
        )}
        
        {isDataProcessed && !dataLoadError && (
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {visitorPoints.map((point) => {
              // Marker position must be [lat, lng] for Leaflet
              const position = [point.lat, point.lng];
              
              if (isNaN(position[0]) || isNaN(position[1])) {
                console.error("Invalid position for marker:", position, point);
                return null;
              }

              return (
                <Marker
                  key={point.id}
                  position={position}
                  icon={customIcon}
                >
                  <Popup>
                    <div style={{ padding: '5px' }}>
                      <h3 style={{ margin: '0 0 5px 0' }}>{point.name}</h3>
                      <p style={{ margin: '2px 0' }}><strong>Location:</strong> {point.location}</p>
                      <p style={{ margin: '2px 0' }}><strong>Country:</strong> {point.country}</p>
                      <p style={{ margin: '2px 0' }}><strong>IP Address:</strong> {point.ip}</p>
                      <p style={{ margin: '2px 0' }}><strong>Coordinates:</strong> {point.lat.toFixed(6)}, {point.lng.toFixed(6)}</p>
                      <p style={{ margin: '2px 0' }}><strong>Visits:</strong> {point.visitCount}</p>
                      <p style={{ margin: '2px 0' }}><strong>Last Visit:</strong> {new Date(point.lastVisit).toLocaleDateString()}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </Box>
    </Box>
  );
};

export default Geography;