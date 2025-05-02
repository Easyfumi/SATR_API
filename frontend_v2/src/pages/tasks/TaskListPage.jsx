import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './TaskListPage.css';

const statusLabels = {
  RECEIVED: 'Получена',
  REGISTERED: 'Зарегистрирована',
  DECISION_DONE: 'Решение готово',
  COMPLETED: 'Завершена',
  // ... остальные статусы
};

const TaskListPage = () => {
    const [tasks, setTasks] = useState([]); // Инициализируем пустым массивом
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
          try {
            const response = await api.get('/api/tasks');
            // Убедимся, что получаем массив
            const data = Array.isArray(response.data) ? response.data : [];
            setTasks(data);
            setError(null);
          } catch (error) {
            console.error('Error fetching tasks:', error);
            setError('Ошибка загрузки данных');
            setTasks([]); // При ошибке сбрасываем в пустой массив
          } finally {
            setLoading(false);
          }
        };
        
        fetchTasks();
      }, []);

  return (
    <div className="content-container">
      <h2 className="page-title">ОТТС / ОТШ</h2>
      <div className="header-actions">
        <Link
          to="/tasks/create"
          className="create-btn"
        >
          + Новая заявка
        </Link>
      </div>
      
      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="tasks-list">
          {tasks.length > 0 ? (
            tasks.map(task => (
            <div key={task.id} className="task-card">

              {/* <div className="task-header">
                <div className="task-number">#{task.number}</div>
                <span className={`status-badge ${task.status.toLowerCase()}`}>
                  {statusLabels[task.status]}
                </span>
              </div> */}
              
              <div className="task-info">
                <div className="info-row">
                  <span className="info-label">Тип:</span>
                  <span className="info-value">{task.docType}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Заявитель:</span>
                  <span className="info-value">{task.applicant}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Изготовитель:</span>
                  <span className="info-value">{task.manufacturer}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Марка:</span>
                  <span className="info-value">{task.mark}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Тип:</span>
                  <span className="info-value">{task.typeName}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Процесс:</span>
                  <span className="info-value">{task.processType}</span>
                </div>
              </div>
              </div>
            ))
          ) : (
            <div className="no-tasks">Нет доступных заявок</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskListPage;