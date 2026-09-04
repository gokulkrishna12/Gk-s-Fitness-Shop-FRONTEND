import axiosClient from './axiosClient';

// 1. Tell backend to generate a Razorpay Order ID based on the cart total
export const createRazorpayOrder = async (amount) => {
  const response = await axiosClient.post('/payment/create-order', { amount });
  return response.data;
};

// 2. Send the success signature and order details to backend for verification & saving
export const verifyPaymentAndSaveOrder = async (paymentData) => {
  const response = await axiosClient.post('/payment/verify', paymentData);
  return response.data;
};