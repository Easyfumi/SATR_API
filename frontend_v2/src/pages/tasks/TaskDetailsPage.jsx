// TaskDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import './TaskDetailsPage.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TaskDetailsPage = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/api/tasks/${id}`);
        setTask(response.data);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки задачи:', err);
        setError('Не удалось загрузить данные задачи');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('ru-RU');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="content-container">
      <Link to="/tasks" className="back-button">
        <ArrowBackIcon />
        К списку задач
      </Link>

      <div className="task-details-card">
        <div className="approval-type">{task.docType}</div>
        
        <div className="card-content">
          <div className="task-row">
            <span className="task-label">Номер заявки</span>
            <span className="task-value">{task.number}</span>
          </div>

          <div className="task-row">
            <span className="task-label">Статус</span>
            <span className={`status-badge ${task.status.toLowerCase()}`}>
              {task.status}
            </span>
          </div>

          <div className="task-row">
            <span className="task-label">Марка</span>
            <span className="task-value">{task.mark}</span>
          </div>

          <div className="task-row">
            <span className="task-label">Тип</span>
            <span className="task-value">{task.typeName}</span>
          </div>

          <div className="task-row">
            <span className="task-label">Производитель</span>
            <span className="task-value">{task.manufacturer}</span>
          </div>

          <div className="task-row">
            <span className="task-label">Категории</span>
            <div className="categories-list">
              {task.categories.map(cat => (
                <span key={cat} className="category-tag">{cat}</span>
              ))}
            </div>
          </div>

          <div className="task-row">
            <span className="task-label">Заявитель</span>
            <span className="task-value">{task.applicant}</span>
          </div>

          <div className="task-row">
            <span className="task-label">Дата создания</span>
            <span className="task-value">{formatDateTime(task.createdAt)}</span>
          </div>

          <div className="task-row">
            <span className="task-label">Планируемая дата решения</span>
            <span className="task-value">{formatDate(task.decisionAt)}</span>
          </div>

          <div className="task-row">
            <span className="task-label">Статус оплаты</span>
            <span className={`payment-status ${task.paymentStatus ? 'paid' : 'unpaid'}`}>
              {task.paymentStatus ? 'Оплачено' : 'Ожидает оплаты'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;