import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProfile, getProfileAnalytics } from '../../services/users';
import './Profile.css';

const translateRole = (role) => {
  const rolesMap = {
    'EXPERT': 'Исполнитель',
    'DIRECTOR': 'Руководитель',
    'REGISTRAR': 'Регистрация',
    'ACCOUNTANT': 'Бухгалтерия',
    'EMPTY': 'Гость'
  };
  return rolesMap[role] || role;
};

export default function Profile() {
  const { user, setUser } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  const defaultRange = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return {
      start: `${year}-${month}-01`,
      end: `${year}-${month}-${day}`
    };
  }, []);

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

  useEffect(() => {
    setStartDate(defaultRange.start);
    setEndDate(defaultRange.end);
  }, [defaultRange]);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!startDate || !endDate) return;
      setAnalyticsLoading(true);
      setAnalyticsError('');
      try {
        const response = await getProfileAnalytics(startDate, endDate);
        setAnalytics(response.data);
      } catch (error) {
        setAnalyticsError('Не удалось загрузить аналитику');
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadAnalytics();
  }, [startDate, endDate]);

  return (

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

        <div className="profile-divider" />

        <div className="profile-analytics">
          <h3 className="analytics-title">Сейчас в работе</h3>
          <p className="analytics-hint">
            Текущая загрузка по активным проектам, декларациям и сертификатам.
          </p>

          {analyticsLoading && <div className="analytics-loading">Загрузка аналитики...</div>}
          {analyticsError && <div className="analytics-error">{analyticsError}</div>}

          {analytics && !analyticsLoading && (
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="analytics-label">Проекты ОТТС/ОТШ</div>
                <div className="analytics-value">{analytics.activeTasks}</div>
              </div>
              <div className="analytics-card">
                <div className="analytics-label">Декларации на регистрации</div>
                <div className="analytics-value">{analytics.activeDeclarations}</div>
              </div>
              <div className="analytics-card">
                <div className="analytics-label">Сертификаты на оформление/регистрацию</div>
                <div className="analytics-value">{analytics.activeCertificates}</div>
              </div>
            </div>
          )}
        </div>

        <div className="profile-divider" />

        <div className="profile-analytics">
          <h3 className="analytics-title">Аналитика сделанной работы</h3>

          <div className="analytics-range analytics-range-modern">
            <div className="analytics-date-field">
              <label htmlFor="analytics-start">С</label>
              <input
                id="analytics-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="analytics-date-field">
              <label htmlFor="analytics-end">По</label>
              <input
                id="analytics-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {analytics && !analyticsLoading && (
            <div className="analytics-section">
              <h4 className="analytics-subtitle">
                Сделано за период ({analytics.periodStart} - {analytics.periodEnd})
              </h4>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="analytics-label">Завершенные проекты ОТТС/ОТШ</div>
                  <div className="analytics-value">{analytics.completedTasks}</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-label">Зарегистрированные декларации</div>
                  <div className="analytics-value">{analytics.completedDeclarations}</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-label">Выпущенные сертификаты</div>
                  <div className="analytics-value">{analytics.completedCertificates}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

  );
}