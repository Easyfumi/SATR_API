import api from './api';

export const getProfile = async () => {
    return api.get('/api/users/profile');
  };
  
  export const getAllUsers = async () => {
    return api.get('/api/users/all');
  };
  
  export const getUserById = async (id) => {
    return api.get(`/api/users/${id}`); 
  };