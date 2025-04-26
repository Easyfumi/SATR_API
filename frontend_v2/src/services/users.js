import api from './api';

export const getProfile = async () => {
    return api.get('/users/profile');
  };
  
  export const getAllUsers = async () => {
    return api.get('/users/all');
  };
  
  export const getUserById = async (id) => {
    return api.get(`/users/${id}`); 
  };