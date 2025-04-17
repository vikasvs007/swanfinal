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
  Typography,
  Grid,
} from "@mui/material";
import {
  DataGrid,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import Header from "components/Header";
import { useGetOrdersQuery, useCreateOrderMutation, useUpdateOrderMutation, useDeleteOrderMutation, useGetProductsQuery, useGetUsersQuery } from "state/api";

const Orders = () => {
  const theme = useTheme();
  const { data: orders, isLoading } = useGetOrdersQuery();
  const { data: products } = useGetProductsQuery();
  const { data: users } = useGetUsersQuery();
  const [createOrder] = useCreateOrderMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    order_number: "",
    user_id: "",
    name: "",
    products: [{ product_id: "", quantity: 1, price: 0 }],
    status: "pending",
    total_amount: 0,
  });

  const [formErrors, setFormErrors] = useState({});

  const calculateTotalAmount = (orderProducts) => {
    return orderProducts.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  };

  const handleOpenDialog = (order = null) => {
    if (order) {
      setFormData({
        order_number: order.order_number,
        user_id: order.user_id?._id || "",
        name: order.name || "",
        products: order.products.map(p => ({
          product_id: p.product_id._id,
          quantity: p.quantity,
          price: p.price
        })),
        status: order.status,
        total_amount: order.total_amount,
      });
      setSelectedOrder(order);
    } else {
      const randomOrderNum = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      setFormData({
        order_number: randomOrderNum,
        user_id: "",
        name: "",
        products: [{ product_id: "", quantity: 1, price: 0 }],
        status: "pending",
        total_amount: 0,
      });
      setSelectedOrder(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
    const randomOrderNum = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setFormData({
      order_number: randomOrderNum,
      user_id: "",
      name: "",
      products: [{ product_id: "", quantity: 1, price: 0 }],
      status: "pending",
      total_amount: 0,
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

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index] = {
      ...newProducts[index],
      [field]: value,
    };
    
    // Update price when product is selected
    if (field === 'product_id') {
      const selectedProduct = products?.find(p => p._id === value);
      if (selectedProduct) {
        newProducts[index].price = selectedProduct.price;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      products: newProducts,
      total_amount: calculateTotalAmount(newProducts),
    }));
  };

  const addProductLine = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { product_id: "", quantity: 1, price: 0 }],
    }));
  };

  const removeProductLine = (index) => {
    if (formData.products.length > 1) {
      const newProducts = formData.products.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        products: newProducts,
        total_amount: calculateTotalAmount(newProducts),
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.order_number) {
      errors.order_number = "Order number is required";
    }

    if (!formData.user_id && !formData.name) {
      errors.user_id = "Either select a customer or enter a guest name";
      errors.name = "Either select a customer or enter a guest name";
    }

    if (formData.products.some(p => !p.product_id)) {
      errors.products = "All product lines must have a product selected";
    }

    if (formData.products.some(p => p.quantity < 1)) {
      errors.products = "Quantity must be at least 1";
    }

    if (formData.products.some(p => !p.price || p.price <= 0)) {
      errors.products = "All products must have a valid price";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      const orderData = {
        order_number: formData.order_number,
        user_id: formData.user_id || null,
        name: formData.name,
        products: formData.products.map(p => ({
          product_id: p.product_id,
          quantity: parseInt(p.quantity),
          price: parseFloat(p.price)
        })),
        status: formData.status,
        total_amount: parseFloat(formData.total_amount),
      };

      if (selectedOrder) {
        try {
          const result = await updateOrder({
            id: selectedOrder._id,
            data: orderData
          }).unwrap();
          
          if (result) {
            handleCloseDialog();
          } else {
            alert("Failed to update order. Please try again.");
          }
        } catch (error) {
          console.error("Update error:", error);
          alert(error.data?.message || "Failed to update order. Please try again.");
        }
      } else {
        try {
          const result = await createOrder(orderData).unwrap();
          if (result) {
            handleCloseDialog();
          } else {
            alert("Failed to create order. Please try again.");
          }
        } catch (error) {
          console.error("Create error:", error);
          alert(error.data?.message || "Failed to create order. Please try again.");
        }
      }
    } catch (error) {
      console.error("Failed to save order:", error);
      alert(error.data?.message || "An unexpected error occurred. Please try again.");
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(id).unwrap();
      } catch (error) {
        console.error("Failed to delete order:", error);
        alert(error.data?.message || "Failed to delete order. Please try again.");
      }
    }
  };

  const columns = [
    {
      field: "order_number",
      headerName: "Order #",
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ color: theme.palette.secondary[100] }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "user_id",
      headerName: "Customer",
      flex: 1,
      valueGetter: (params) => params.row.user_id?.name || params.row.name || "Guest",
      renderCell: (params) => (
        <Typography sx={{ color: theme.palette.secondary[100] }}>
          {params.value}
          {!params.row.user_id && params.row.name && " (Guest)"}
        </Typography>
      ),
    },
    {
      field: "products",
      headerName: "Products",
      flex: 2,
      renderCell: (params) => (
        <Typography sx={{ color: theme.palette.secondary[100] }}>
          {params.value.map(p => 
            `${p.product_id?.name || 'Unknown'} (${p.quantity} x ₹${p.price.toLocaleString('en-IN')})`
          ).join(", ")}
        </Typography>
      ),
    },
    {
      field: "total_amount",
      headerName: "Total Amount",
      flex: 0.8,
      renderCell: (params) => (
        <Typography sx={{ color: theme.palette.secondary[100] }}>
          ₹{params.value.toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      renderCell: (params) => (
        <Typography
          sx={{
            color: 
              params.value === "delivered" ? theme.palette.success.main :
              params.value === "shipped" ? theme.palette.info.main :
              theme.palette.warning.main,
          }}
        >
          {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        </Typography>
      ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ color: theme.palette.secondary[100] }}>
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
            sx={{ color: theme.palette.secondary[300] }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteOrder(params.row._id)}
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
      <Header title="ORDERS" subtitle="Manage customer orders" />
      
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
          Add Order
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
            <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
              <CircularProgress />
            </Box>
          ) : (
            <Box
              height="60vh"
              sx={{
                "& .MuiDataGrid-root": {
                  border: "none",
                  backgroundColor: theme.palette.background.alt,
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "none",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: theme.palette.background.alt,
                  color: theme.palette.secondary[100],
                  borderBottom: "none",
                },
                "& .MuiDataGrid-virtualScroller": {
                  backgroundColor: theme.palette.background.alt,
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: theme.palette.background.alt,
                  color: theme.palette.secondary[100],
                  borderTop: "none",
                },
                "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                  color: `${theme.palette.secondary[200]} !important`,
                },
              }}
            >
              <DataGrid
                rows={orders || []}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                getRowId={(row) => row._id}
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
            bgcolor: theme.palette.background.alt,
            color: theme.palette.text.primary,
          }
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          {selectedOrder ? "Edit Order" : "Add New Order"}
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
              name="order_number"
              label="Order Number"
              value={formData.order_number}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={!!selectedOrder}
              error={!!formErrors.order_number}
              helperText={formErrors.order_number}
              sx={{
                "& label": { color: theme.palette.text.primary },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: theme.palette.secondary[300] },
                  "&:hover fieldset": { borderColor: theme.palette.secondary[400] },
                },
                "& .MuiInputBase-input": { color: theme.palette.text.primary },
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="user_id"
                  label="Select Customer (Optional)"
                  value={formData.user_id}
                  onChange={(e) => {
                    handleInputChange(e);
                    if (e.target.value) {
                      setFormData(prev => ({ ...prev, name: "" }));
                    }
                  }}
                  fullWidth
                  error={!!formErrors.user_id}
                  helperText={formErrors.user_id}
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
                    <em>None (Guest Order)</em>
                  </MenuItem>
                  {users?.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="name"
                  label="Guest Name (Optional if customer selected)"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={!!formData.user_id}
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
              </Grid>
            </Grid>

            <Typography variant="h6" color={theme.palette.text.primary} gutterBottom>
              Products
            </Typography>
            {formErrors.products && (
              <Typography color="error" variant="caption">
                {formErrors.products}
              </Typography>
            )}
            
            {formData.products.map((product, index) => (
              <Grid container spacing={2} key={index} alignItems="center">
                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    label="Product"
                    value={product.product_id}
                    onChange={(e) => handleProductChange(index, "product_id", e.target.value)}
                    sx={{
                      "& label": { color: theme.palette.text.primary },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: theme.palette.secondary[300] },
                        "&:hover fieldset": { borderColor: theme.palette.secondary[400] },
                      },
                      "& .MuiInputBase-input": { color: theme.palette.text.primary },
                    }}
                  >
                    {products?.map((p) => (
                      <MenuItem key={p._id} value={p._id}>
                        {p.name} - ₹{p.price.toLocaleString('en-IN')}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    type="number"
                    label="Quantity"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, "quantity", parseInt(e.target.value) || 0)}
                    inputProps={{ min: 1 }}
                    sx={{
                      "& label": { color: theme.palette.text.primary },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: theme.palette.secondary[300] },
                        "&:hover fieldset": { borderColor: theme.palette.secondary[400] },
                      },
                      "& .MuiInputBase-input": { color: theme.palette.text.primary },
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    onClick={() => removeProductLine(index)}
                    sx={{ color: theme.palette.error.main }}
                    disabled={formData.products.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              onClick={addProductLine}
              startIcon={<AddIcon />}
              sx={{ color: theme.palette.secondary[600] }}
            >
              Add Product
            </Button>

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
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
            </TextField>

            <Typography variant="h6" color={theme.palette.text.primary}>
              Total Amount: ₹{formData.total_amount.toLocaleString('en-IN')}
            </Typography>
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
            {selectedOrder ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
