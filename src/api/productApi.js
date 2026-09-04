import axiosClient from './axiosClient';

export const getProducts = async (keyword = '') => {
  const response = await axiosClient.get(`/products?keyword=${keyword}`);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axiosClient.get(`/products/${id}`);
  return response.data;
};

export const addProductReview = async (id, formData) => {
  // We MUST override the default content-type for this specific request 
  // because we are sending a physical file (FormData) to Multer/Cloudinary
  const token = localStorage.getItem('token');
  const response = await axiosClient.post(`/products/${id}/reviews`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};



export const deleteProductApi = async (id) => {
  const response = await axiosClient.delete(`/products/${id}`);
  return response.data;
};

export const createProductApi = async (formData) => {
  const token = localStorage.getItem('token');
  const response = await axiosClient.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};