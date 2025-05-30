import React, { useState } from "react";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  IconButton,
  Stack,
  Chip,
} from "@mui/material";
import {
  Inventory2Outlined,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import Header from "components/Header";
import ProductDialog from "components/ProductDialog";
import { 
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "state/api";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number || 0);
};

const Product = ({
  _id,
  name,
  description,
  price,
  stock_quantity,
  image_url,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        backgroundImage: "none",
        backgroundColor: theme.palette.background.alt,
        borderRadius: "0.55rem",
      }}
    >
      <CardContent>
        <Typography variant="h5" component="div">
          {name}
        </Typography>
        <Typography sx={{ mb: "1.5rem" }} color={theme.palette.secondary[400]}>
          {formatCurrency(price)}
        </Typography>
        <Typography variant="body2" color={theme.palette.secondary[200]} sx={{ mb: 2 }}>
          {description}
        </Typography>
        {image_url && (
          <Box
            component="img"
            src={image_url}
            alt={name}
            sx={{
              width: "100%",
              height: 200,
              objectFit: "cover",
              borderRadius: "4px",
              mb: 2,
            }}
          />
        )}
      </CardContent>
      <CardActions>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%', justifyContent: 'space-between' }}>
          <Chip
            icon={<Inventory2Outlined />}
            label={`${formatNumber(stock_quantity)} in stock`}
            color={stock_quantity > 0 ? "primary" : "error"}
          />
          <Box>
            <IconButton 
              size="small" 
              color="primary" 
              onClick={() => onEdit({
                _id,
                name,
                description,
                price,
                stock_quantity,
                image_url,
              })}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              size="small" 
              color="error"
              onClick={() => onDelete(_id)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Stack>
      </CardActions>
    </Card>
  );
};

const Products = () => {
  const theme = useTheme();
  const isNonMobile = useMediaQuery("(min-width: 1000px)");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data, isLoading } = useGetProductsQuery();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleAdd = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedProduct) {
        // Convert numeric fields and ensure proper data structure
        const updateData = {
          id: selectedProduct._id,
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          stock: Number(formData.stock_quantity), // Map to 'stock' for server validation
          image_url: formData.image_url,
        };
        await updateProduct(updateData).unwrap();
      } else {
        // Map product data to match server-side validation requirements
        const productData = {
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          stock: Number(formData.stock_quantity), // Map to 'stock' for server validation
          image_url: formData.image_url,
        };
        await createProduct(productData).unwrap();
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    }
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="PRODUCTS" subtitle="See your list of products." />
      <Box mt="20px">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ mb: 2 }}
        >
          Add Product
        </Button>
      </Box>
      {isLoading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box
          mt="20px"
          display="grid"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          justifyContent="space-between"
          rowGap="20px"
          columnGap="1.33%"
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
          }}
        >
          {data.map(({
            _id,
            name,
            description,
            price,
            stock_quantity,
            image_url,
          }) => (
            <Product
              key={_id}
              _id={_id}
              name={name}
              description={description}
              price={price}
              stock_quantity={stock_quantity}
              image_url={image_url}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      )}
      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedProduct}
      />
    </Box>
  );
};

export default Products;
