import axiosClient from './axiosClient';

export const sendOtpApi = async (email) => {
  const response = await axiosClient.post('/auth/send-otp', { email });
  return response.data;
};

export const registerApi = async ({ name, email, password, otp }) => {
  const response = await axiosClient.post('/auth/register', { name, email, password, otp });
  return response.data;
};

export const loginApi = async ({ email, password }) => {
  const response = await axiosClient.post('/auth/login', { email, password });
  return response.data;
};

// NEW: Send Forgot Password OTP
export const forgotPasswordApi = async (email) => {
  const response = await axiosClient.post('/auth/forgot-password', { email });
  return response.data;
};

// NEW: Reset Password with OTP
export const resetPasswordApi = async ({ email, otp, newPassword }) => {
  const response = await axiosClient.post('/auth/reset-password', { email, otp, newPassword });
  return response.data;
};