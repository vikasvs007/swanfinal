import React, { useState, useEffect } from 'react';
import api from '../utils/apiClient';

// Example component using the secure API client
const ExampleComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data using the secure API client
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.getProducts();
        setData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Example of submitting form data securely
  const handleSubmit = async (formData) => {
    try {
      const response = await api.createProduct(formData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  return (
    <div>
      <h2>Products</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExampleComponent; 