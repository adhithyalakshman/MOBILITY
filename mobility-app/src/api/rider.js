import apiClient from './client';

// GET /rider/ - rider home (verify auth)
export const getRiderHome = () =>
  apiClient.get('/rider/');

// POST /rider/get-captain
// {
//   rider_area, end_area, weather_condition, traffic_density_level,
//   road_type, distance_km, time_of_day, day_of_week
// }
export const getCaptain = (payload) =>
  apiClient.post('/rider/get-captain', payload);
