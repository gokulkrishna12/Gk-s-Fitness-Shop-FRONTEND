import axiosClient from './axiosClient';

export const getAiRecommendation = async (query) => {
  // We send the user's prompt as 'query' to match the backend req.body.query expectations
  const response = await axiosClient.post('/ai/recommend', { query });
  return response.data;
};