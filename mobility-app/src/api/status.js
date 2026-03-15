import apiClient from './client';

// POST /status/heartbeat - keep session alive
export const heartbeat = () =>
  apiClient.post('/status/heartbeat');

// GET /status/online/{email} - check if user is online
export const checkUserStatus = (email) =>
  apiClient.get(`/status/online/${encodeURIComponent(email)}`);

// POST /status/driver/set-location  { area: string (from enum) }
export const setDriverLocation = (area) =>
  apiClient.post('/status/driver/set-location', { area });

// GET /status/online-drivers - list of online drivers (public, no auth needed)
export const getOnlineDrivers = () =>
  apiClient.get('/status/online-drivers');
