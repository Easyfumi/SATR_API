// TaskDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import './TaskDetailsPage.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TextField, Button, CircularProgress } from '@mui/material';

const TaskDetailsPage = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNumber, setNewNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusLabels = {
    RECEIVED: 'Заявка получена',
    REGISTERED: 'Заявка зарегистрирована',
    DECISION_DONE: 'Решение по заявке готово',
    DOCUMENTS_WAITING: 'Ожидание документов',
    REJECTION: 'Отказ в проведении работ',
    CANCELLED: 'Аннулирована',
    PROJECT: 'Переведено в проект',
    SIGNED: 'Подписано',
    FOR_REVISION: 'Возвращено на доработку',
    COMPLETED: 'Заявка выполнена'
  };

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

  const handleAssignNumber = async () => {
    if (!newNumber.trim()) return;
    
    setIsUpdating(true);
    try {
      const response = await api.put(`/api/tasks/${id}/number`, { number: newNumber });
      setTask({ ...task, number: newNumber });
      setNewNumber('');
      alert('Номер успешно присвоен');
    } catch (error) {
      console.error('Ошибка присвоения номера:', error);
      alert(error.response?.data?.message || 'Произошла ошибка');
    } finally {
      setIsUpdating(false);
    }
  };

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
        К списку заявок
      </Link>

      <div className="task-details-card">
        <div className="approval-type">{task.docType}</div>

        <div className="card-content">
          <div className="task-row">
            <span className="task-label">Номер заявки</span>
            {task.number ? (
              <span className="task-value">{task.number}</span>
            ) : (
              <div className="number-input-container">
                <TextField
                  size="small"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="Введите номер"
                  variant="outlined"
                  disabled={isUpdating}
                />
                <Button
                  variant="contained"
                  onClick={handleAssignNumber}
                  disabled={!newNumber || isUpdating}
                  style={{ marginLeft: '10px' }}
                >
                  {isUpdating ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Присвоить номер'
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="task-row">
            <span className="task-label">Статус</span>
            <span className={`status-badge ${task.status.toLowerCase()}`}>
              {statusLabels[task.status] || task.status}
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
            <span className={`details-payment-status ${task.paymentStatus ? 'paid' : 'unpaid'}`}>
              {task.paymentStatus ? 'Оплачено' : 'Ожидает оплаты'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;