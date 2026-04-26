import api from './api';

export const getAIEstimate = async (problemDescription: string, serviceName: string) => {
  const response = await api.post('/ai/estimate', { problemDescription, serviceName });
  return response.data;
};
