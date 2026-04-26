import api from './api';

export const getRestaurants = async (params?: any) => {
  const response = await api.get('/restaurants', { params });
  return response.data;
};

export const getNearbyRestaurants = async (lat: number, lng: number, radius?: number) => {
  const response = await api.get('/restaurants/nearby', { 
    params: { lat, lng, radius } 
  });
  return response.data;
};

export const getTrendingRestaurants = async () => {
  const response = await api.get('/restaurants/trending');
  return response.data;
};

export const getRestaurantById = async (id: string) => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data;
};

export const getMenuByRestaurantId = async (id: string) => {
  const response = await api.get(`/restaurants/${id}/menu`);
  return response.data;
};

export const searchRestaurants = async (q: string, lat?: number, lng?: number) => {
  const response = await api.get('/restaurants/search', {
    params: { q, lat, lng }
  });
  return response.data;
};
