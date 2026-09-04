import axiosClient from './axiosClient';

export const getCartApi = async () => {
  const response = await axiosClient.get('/cart');
  return response.data;
};

export const addToCartApi = async (cartItem) => {
  const response = await axiosClient.post('/cart', cartItem);
  return response.data;
};

export const removeFromCartApi = async (productId) => {
  const response = await axiosClient.delete(`/cart/${productId}`);
  return response.data;
};