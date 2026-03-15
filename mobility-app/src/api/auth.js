import apiClient from './client';

// POST /auth/register/request-otp  { email }
export const requestRegistrationOtp = (email) =>
  apiClient.post('/auth/register/request-otp', { email });

// POST /auth/register/verify-otp  { email, otp }
export const verifyRegistrationOtp = (email, otp) =>
  apiClient.post('/auth/register/verify-otp', { email, otp });

// POST /auth/register  { name, email, phone_number, set_password, confirm_password, role }
export const register = (userData) =>
  apiClient.post('/auth/register', userData);

// POST /auth/login  (form-urlencoded: username, password)
export const login = (username, password) => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);
  return apiClient.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

// POST /auth/forgot-password/request-otp  { email }
export const forgotPasswordRequestOtp = (email) =>
  apiClient.post('/auth/forgot-password/request-otp', { email });

// POST /auth/forgot-password/reset  { email, otp, new_password, confirm_password }
export const resetPassword = (data) =>
  apiClient.post('/auth/forgot-password/reset', data);
