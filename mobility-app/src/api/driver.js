import apiClient from './client';

// GET /driver/ - driver home (verify auth)
export const getDriverHome = () =>
  apiClient.get('/driver/');

// POST /driver/suggest-area
// { end_area, weather_condition, traffic_density_level, road_type, average_speed_kmph, distance_km }
// Returns: { suggested_start_area: string }
export const suggestArea = (payload) =>
  apiClient.post('/driver/suggest-area', payload);
