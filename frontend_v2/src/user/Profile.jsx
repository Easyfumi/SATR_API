// Profile.js
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/auth';
import './Profile.css';

const translateRole = (role) => {
  const rolesMap = {
    'EXPERT': 'Эксперт',
    'DIRECTOR': 'Руководитель',
    'REGISTRAR': 'Регистрация',
    'ACCOUNTANT': 'Бухгалтерия',
    'EMPTY': 'Гость'
  };
  return rolesMap[role] || role;
};

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
    <div className="page-wrapper">
      <div className="content-container">
        <h2 className="page-title">Профиль пользователя</h2>
        {user && (
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Фамилия:</span>
              <span className="info-value">{user.secondName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Имя:</span>
              <span className="info-value">{user.firstName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Отчество:</span>
              <span className="info-value">{user.patronymic || '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Роли:</span>
              <div className="roles-container">
                {user.roles && user.roles.length > 0
                  ? user.roles.map(role => (
                    <span key={role} className="role-badge">
                      {translateRole(role)}
                    </span>
                  ))
                  : <span className="info-value">Не назначены</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}