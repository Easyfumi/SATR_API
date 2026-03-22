import api from './api';

export const getProfile = async () => {
    return api.get('/users/profile');
  };

export const getProfileAnalytics = async (startDate, endDate) => {
    return api.get('/users/profile/analytics', {
      params: {
        startDate,
        endDate
      }
    });
  };

export const getUserAnalytics = async (userId, startDate, endDate) => {
    return api.get(`/users/${userId}/analytics`, {
      params: {
        startDate,
        endDate
      }
    });
  };
  
  export const getAllUsers = async () => {
    return api.get('/users/all');
  };
  
  export const getUserById = async (id) => {
    return api.get(`/users/${id}`); 
  };

  export const updateUserRoles = async (userId, roles) => {
    const response = await api.put(`/users/${userId}/roles`, { roles });
    return response.data;
  };