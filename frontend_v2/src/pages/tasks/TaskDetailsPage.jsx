// TaskDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import './TaskDetailsPage.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TextField, Button, CircularProgress, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const TaskDetailsPage = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNumber, setNewNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [newDecisionDate, setNewDecisionDate] = useState('');
  const [isUpdatingDecisionDate, setIsUpdatingDecisionDate] = useState(false);
  
  // Состояния для управления статусом
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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
        setSelectedStatus(response.data.status);
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

  const handleSetDecisionDate = async () => {
    if (!newDecisionDate) return;

    setIsUpdatingDecisionDate(true);
    try {
      const response = await api.put(`/api/tasks/${id}/decision-date`, {
        decisionDate: newDecisionDate
      });
      setTask(response.data);
      setNewDecisionDate('');
      alert('Дата решения успешно установлена');
    } catch (error) {
      console.error('Ошибка установки даты решения:', error);
      alert(error.response?.data?.message || 'Произошла ошибка');
    } finally {
      setIsUpdatingDecisionDate(false);
    }
  };

  // Функции для работы со статусом
  const handleStatusButtonClick = (event) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusAnchorEl(null);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setIsStatusChanged(true);
    handleStatusMenuClose();
  };

  const handleSaveStatus = async () => {
    if (!selectedStatus || !isStatusChanged) return;

    setIsUpdatingStatus(true);
    try {
      const response = await api.put(`/api/tasks/${id}/status`, {
        status: selectedStatus
      });
      setTask(response.data);
      setIsStatusChanged(false);
      alert('Статус успешно обновлен');
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      alert(error.response?.data?.message || 'Произошла ошибка');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancelStatusChange = () => {
    setSelectedStatus(task.status);
    setIsStatusChanged(false);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Не указана';
    return new Date(dateTime).toLocaleString('ru-RU');
  };

  const formatDate = (date) => {
    console.log(date + "asd");
    // Проверяем на null, undefined и невалидные даты
    if (!date || new Date(date).toString() === 'Invalid Date') {
      return 'Не указана';
    }

    const dateObj = new Date(date);
    // Проверяем, что это не дата по умолчанию (1970 год)
    if (dateObj.getFullYear() === 1970 && dateObj.getMonth() === 0 && dateObj.getDate() === 1) {
      return 'Не указана';
    }

    return dateObj.toLocaleDateString('ru-RU');
  };

  const isDateSet = (date) => {
    if (!date) return false;
    const dateObj = new Date(date);
    return dateObj.getFullYear() > 1970;
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
        <div className="card-content">
          {/* Левая колонка */}

          <div className="column left-column">

            <div className="task-row">
              <div className="approval-type">{task.docType}</div>
            </div>

            <div className="task-row">
              <div className="approval-type">{task.previousProcessType} {task.previousNumber}</div>
            </div>
          </div>

          {/* Вертикальная разделительная линия*/}
          <div className="vertical-divider"></div>

          {/* Правая колонка */}
          <div className="column right-column">

            <div className="task-row">
              <span className="task-label">Статус</span>
              <div className="status-container">
                <div className="status-display">
                  <span className={`status-badge ${task.status?.toLowerCase()}`}>
                    {statusLabels[selectedStatus] || selectedStatus}
                  </span>
                  <Button
                    className="status-dropdown-button"
                    onClick={handleStatusButtonClick}
                    size="small"
                  >
                    <ArrowDropDownIcon />
                  </Button>
                </div>
                
                {isStatusChanged && (
                  <div className="status-actions">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSaveStatus}
                      disabled={isUpdatingStatus}
                      className="save-status-button"
                    >
                      {isUpdatingStatus ? <CircularProgress size={20} /> : 'Сохранить'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCancelStatusChange}
                      disabled={isUpdatingStatus}
                    >
                      Отмена
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="task-row">
              <span className="task-label">Номер заявки</span>
              {task.number ? (
                <span className="task-value">{task.number}</span>
              ) : (
                <div className="input-action-container">
                  <TextField
                    size="small"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="Введите номер"
                    variant="outlined"
                    disabled={isUpdating}
                    sx={{ width: '100%', maxWidth: 143 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAssignNumber}
                    disabled={!newNumber || isUpdating}
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
              <span className="task-label">Решение по заявке</span>
              {task.decisionAt && isDateSet(task.decisionAt) ? (
                <span className="task-value">{formatDate(task.decisionAt)}</span>
              ) : (
                <div className="input-action-container">
                  <div className="modern-date-field">
                    <input
                      type="date"
                      value={newDecisionDate}
                      onChange={(e) => setNewDecisionDate(e.target.value)}
                      disabled={isUpdatingDecisionDate}
                    />
                  </div>
                  <Button
                    variant="contained"
                    onClick={handleSetDecisionDate}
                    disabled={!newDecisionDate || isUpdatingDecisionDate}
                  >
                    {isUpdatingDecisionDate ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Установить дату'
                    )}
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Меню выбора статуса */}
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={handleStatusMenuClose}
        className="status-menu"
      >
        {Object.entries(statusLabels).map(([key, label]) => (
          <MenuItem
            key={key}
            onClick={() => handleStatusSelect(key)}
            selected={selectedStatus === key}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>

      <div className="task-details-card">
        <div className="card-content">
          {/* Левая колонка */}
          <div className="column left-column">

            <div className="task-row">
              <span className="task-label">Марка</span>
              <span className="task-value">{task.mark}</span>
            </div>

            <div className="task-row">
              <span className="task-label">Тип</span>
              <span className="task-value">{task.typeName}</span>
            </div>

            <div className="task-row">
              <span className="task-label">Категории</span>
              <div className="categories-list">
                {task.categories && task.categories.map(cat => (
                  <span key={cat} className="category-tag">{cat}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Вертикальная разделительная линия*/}
          <div className="vertical-divider"></div>

          {/* Правая колонка */}
          <div className="column right-column">

            <div className="task-row">
              <span className="task-label">Заявитель</span>
              <span className="task-value">{task.applicant?.name || task.applicant}</span>
            </div>

            <div className="task-row">
              <span className="task-label">Изготовитель</span>
              <span className="task-value">{task.manufacturer?.name || task.manufacturer}</span>
            </div>

            <div className="task-row">
              <span className="task-label">Представитель</span>
              <span className="task-value">{task.representative?.name || task.representative}</span>
            </div>

          </div>
        </div>
      </div>

      <div className="task-details-card">

        <div className="task-row">
          <span className="task-label">Дата создания</span>
          <span className="task-value">{formatDateTime(task.createdAt)}</span>
        </div>

        <div className="task-row">
          <span className="task-label">Заявка создана</span>
          <span className="task-value">{task.createdBy}</span>
        </div>

      </div>

      <div className="task-details-card">

        <div className="task-row">
          <span className="task-label">Статус оплаты</span>
          <span className={`details-payment-status ${task.paymentStatus ? 'paid' : 'unpaid'}`}>
            {task.paymentStatus ? 'Оплачено' : 'Ожидает оплаты'}
          </span>
        </div>

      </div>

    </div>
  );
};

export default TaskDetailsPage; 