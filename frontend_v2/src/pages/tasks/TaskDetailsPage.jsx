import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import './TaskDetailsPage.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  TextField,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  InputAdornment,
  IconButton
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';

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

  // Состояния для управления договором
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [contractAnchorEl, setContractAnchorEl] = useState(null);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [contractError, setContractError] = useState(null);
  const [isUpdatingContract, setIsUpdatingContract] = useState(false);
  const [contractSearch, setContractSearch] = useState('');

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

  const paymentStatusLabels = {
    PAIDFOR: 'Оплачен',
    PARTIALLYPAIDFOR: 'Оплачен частично',
    NOTPAIDFOR: 'Не оплачен'
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

  // Загрузка всех договоров для поиска по номеру
  const fetchAllContracts = async () => {
    setIsLoadingContracts(true);
    setContractError(null);
    try {
      const response = await api.get('/api/contracts');
      setContracts(response.data);
      setFilteredContracts(response.data);
    } catch (err) {
      console.error('Ошибка загрузки договоров:', err);
      setContractError('Не удалось загрузить список договоров');
    } finally {
      setIsLoadingContracts(false);
    }
  };

  // Фильтрация договоров по номеру
  const filterContracts = (searchText) => {
    if (!searchText.trim()) {
      setFilteredContracts(contracts);
    } else {
      const filtered = contracts.filter(contract =>
        contract.number.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredContracts(filtered);
    }
  };

  const handleContractButtonClick = async (event) => {
    setContractAnchorEl(event.currentTarget);
    setContractSearch('');
    await fetchAllContracts();
  };

  const handleContractMenuClose = () => {
    setContractAnchorEl(null);
    setContractSearch('');
  };

  const handleContractSearchChange = (event) => {
    const searchText = event.target.value;
    setContractSearch(searchText);
    filterContracts(searchText);
  };

  const handleClearSearch = () => {
    setContractSearch('');
    setFilteredContracts(contracts);
  };

  const handleContractSelect = async (contractId) => {
    setIsUpdatingContract(true);
    try {
      const response = await api.put(`/api/tasks/${id}/contract`, { contractId });
      setTask(response.data);
      alert('Договор успешно привязан к задаче');
    } catch (error) {
      console.error('Ошибка привязки договора:', error);
      alert(error.response?.data?.message || 'Произошла ошибка при привязке договора');
    } finally {
      setIsUpdatingContract(false);
      handleContractMenuClose();
    }
  };

  const handleRemoveContract = async () => {
    setIsUpdatingContract(true);
    try {
      const response = await api.delete(`/api/tasks/${id}/contract`);
      setTask(response.data);
      alert('Договор успешно отвязан от задачи');
    } catch (error) {
      console.error('Ошибка отвязки договора:', error);
      alert(error.response?.data?.message || 'Произошла ошибка при отвязке договора');
    } finally {
      setIsUpdatingContract(false);
    }
  };

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
    if (!date || new Date(date).toString() === 'Invalid Date') {
      return 'Не указана';
    }

    const dateObj = new Date(date);
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

  // Функция для получения метки статуса оплаты
  const getPaymentStatusLabel = (status) => {
    return paymentStatusLabels[status] || status;
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="content-container">
      <div>
        <Link to="/tasks" className="back-button">
          <ArrowBackIcon />
          К списку заявок
        </Link>
      </div>

      <div className="task-details-card">
        <div className="card-content">
          {/* Левая колонка */}
          <div className="column left-column">
            <div className="task-row">
              <span className="task-label">Тип одобрения:</span>
              <span className="task-value">{task.docType}</span>
            </div>

            <div className="task-row">
              <span className="task-label">Процедура:</span>
              <span className="task-value">{task.processType || 'Не указана'}</span>
            </div>

            <div className="task-row">
              <span className="task-label">Тип процедуры:</span>
              <span className="task-value">
                {task.previousProcessType} {task.previousNumber || ''}
              </span>
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

        {/* Меню выбора договора с поиском */}
        <Menu
          anchorEl={contractAnchorEl}
          open={Boolean(contractAnchorEl)}
          onClose={handleContractMenuClose}
          className="contract-menu"
        >
          <div className="contract-search-container">
            <TextField
              className="contract-search-field"
              placeholder="Поиск по номеру договора..."
              value={contractSearch}
              onChange={handleContractSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: contractSearch && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          {isLoadingContracts ? (
            <div className="contracts-loading">
              <CircularProgress size={20} />
              <span>Загрузка договоров...</span>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="no-contracts-message">
              {contractSearch ? 'Договоры не найдены' : 'Нет доступных договоров'}
            </div>
          ) : (
            filteredContracts.map((contract) => (
              <MenuItem
                key={contract.id}
                onClick={() => handleContractSelect(contract.id)}
                className="contract-menu-item"
              >
                <div className="contract-item-details">
                  <div className="contract-item-number">
                    {contract.number}
                  </div>
                  <div className="contract-item-info">
                    <span>от {formatDate(contract.date)}</span>
                    <span>{getPaymentStatusLabel(contract.paymentStatus)}</span>
                  </div>
                  {contract.applicant && (
                    <div className="contract-applicant">
                      Заявитель: {contract.applicant.name || contract.applicant}
                    </div>
                  )}
                </div>
              </MenuItem>
            ))
          )}
        </Menu>

        <div className="task-row">
          <span className="task-label">Статус оплаты</span>
          <span className={`details-payment-status ${task.paymentStatus ? 'paid' : 'unpaid'}`}>
            {task.paymentStatus ? 'Оплачено' : 'Ожидает оплаты'}
          </span>
        </div>

        {/* Блок выбора договора */}
        <div className="task-row">
          <span className="task-label">Договор</span>
          <div className="contract-selection">
            {task.contract ? (
              <div className="contract-display">
                <div className="contract-info">
                  <div className="contract-number">
                    {task.contract.number}
                  </div>
                  <div className="contract-details">
                    <div className="contract-detail">
                      <span className="contract-detail-label">Дата:</span>
                      <span className="contract-detail-value">{formatDate(task.contract.date)}</span>
                    </div>
                    <div className="contract-detail">
                      <span className="contract-detail-label">Статус оплаты:</span>
                      <span className={`contract-detail-value payment-status-${task.contract.paymentStatus?.toLowerCase()}`}>
                        {getPaymentStatusLabel(task.contract.paymentStatus)}
                      </span>
                    </div>
                    {task.contract.applicant && (
                      <div className="contract-detail">
                        <span className="contract-detail-label">Заявитель:</span>
                        <span className="contract-detail-value">
                          {typeof task.contract.applicant === 'object'
                            ? task.contract.applicant.name
                            : task.contract.applicant}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="outlined"
                onClick={handleContractButtonClick}
                disabled={isUpdatingContract}
                startIcon={<SearchIcon />}
                endIcon={<ArrowDropDownIcon />}
              >
                {isUpdatingContract ? 'Загрузка...' : 'Выбрать договор'}
              </Button>
            )}
          </div>
        </div>

      </div>
      <div className="task-row">
        <div className="column right-column">
        </div>
        <Link to={`/tasks/edit/${task.id}`} className="edit-button">
          <EditIcon />
          Редактировать
        </Link>
      </div>
    </div>

  );
};

export default TaskDetailsPage;