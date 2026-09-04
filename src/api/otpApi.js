import axiosClient from './axiosClient';

export const otpApi = {
  sendOtp: async (email) => {
    const response = await axiosClient.post('/otp/send', { email });
    return response.data;
  },
  verifyOtp: async (email, otp) => {
    const response = await axiosClient.post('/otp/verify', { email, otp });
    return response.data;
  }
};
