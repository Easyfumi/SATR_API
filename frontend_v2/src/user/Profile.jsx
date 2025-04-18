import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/auth';

export default function Profile() {
  const { user, setUser } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile();
        setUser(response.data);
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      }
    };
    
    if (!user) loadProfile();
  }, [user, setUser]);

  return (
    <div className="profile-container">
      <h2>Профиль пользователя</h2>
      {user && (
        <div className="profile-info">
          <p><strong>Имя:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Роль:</strong> {user.role}</p>
          <p><strong>Дата регистрации:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}