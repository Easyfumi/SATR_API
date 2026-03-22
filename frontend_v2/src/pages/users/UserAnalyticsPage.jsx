import React, { useEffect, useMemo, useState } from 'react';
import { getAllUsers, getUserAnalytics } from '../../services/users';
import { useAuth } from '../../context/AuthContext';
import { isDirector } from '../../utils/roleUtils';
import AccessDenied from '../../components/AccessDenied';
import './Profile.css';
import './UserAnalyticsPage.css';

const formatUserName = (user) => {
  if (!user) return '';
  const firstInitial = user.firstName ? `${user.firstName[0]}.` : '';
  const patronymicInitial = user.patronymic ? `${user.patronymic[0]}.` : '';
  return `${user.secondName || ''} ${firstInitial}${patronymicInitial}`.trim();
};

export default function UserAnalyticsPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState('');

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
    setStartDate(defaultRange.start);
    setEndDate(defaultRange.end);
  }, [defaultRange]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await getAllUsers();
        const loadedUsers = Array.isArray(response.data) ? response.data : [];
        setUsers(loadedUsers);
        if (loadedUsers.length > 0 && !selectedUserId) {
          setSelectedUserId(String(loadedUsers[0].id));
        }
      } catch (e) {
        setError('Не удалось загрузить пользователей');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!selectedUserId || !startDate || !endDate) return;
      setAnalyticsLoading(true);
      setError('');
      try {
        const response = await getUserAnalytics(selectedUserId, startDate, endDate);
        setAnalytics(response.data);
      } catch (e) {
        setError('Не удалось загрузить аналитику пользователя');
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedUserId, startDate, endDate]);

  if (!isDirector(user)) {
    return <AccessDenied message="У вас нет доступа к разделу аналитики пользователей." />;
  }

  return (
    <div className="content-container">
      <h2 className="page-title">Аналитика пользователей</h2>

      <div className="user-analytics-picker">
        <label htmlFor="analytics-user-select">Пользователь</label>
        <select
          id="analytics-user-select"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          disabled={loadingUsers}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {formatUserName(u)} ({u.email})
            </option>
          ))}
        </select>
      </div>

      <div className="profile-divider" />

      <div className="profile-analytics">
        <h3 className="analytics-title">Сейчас в работе</h3>
        <p className="analytics-hint">
          Текущая загрузка выбранного пользователя по активным проектам, декларациям и сертификатам.
        </p>

        {analyticsLoading && <div className="analytics-loading">Загрузка аналитики...</div>}
        {error && <div className="analytics-error">{error}</div>}

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
