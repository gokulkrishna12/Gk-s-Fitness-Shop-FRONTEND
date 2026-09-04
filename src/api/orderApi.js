import axiosClient from './axiosClient';

export const getAllOrders = async () => {
  const response = await axiosClient.get('/orders');
  return response.data;
};

export const markOrderDelivered = async (id) => {
  const response = await axiosClient.put(`/orders/${id}/deliver`);
  return response.data;
};