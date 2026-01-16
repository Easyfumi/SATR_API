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
  IconButton,
  Chip,
  Alert,
  FormControl,
  Select,
  Checkbox
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';
import UnlinkIcon from '@mui/icons-material/LinkOff';

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
  const [experts, setExperts] = useState([]);
  const [selectedExpertId, setSelectedExpertId] = useState('');
  const [isExpertChanged, setIsExpertChanged] = useState(false);
  const [isUpdatingExpert, setIsUpdatingExpert] = useState(false);

  // Состояния для управления договором (one-to-many)
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [contractAnchorEl, setContractAnchorEl] = useState(null);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [contractError, setContractError] = useState(null);
  const [isUpdatingContract, setIsUpdatingContract] = useState(false);
  const [contractSearch, setContractSearch] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);

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
    fetchTask();
    fetchExperts();
  }, [id]);

  // Функция для загрузки задачи
  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/tasks/${id}`);
      setTask(response.data);
      setSelectedStatus(response.data.status);
      setSelectedExpertId(
        response.data.assignedUserId ?? response.data.assignedUser?.id ?? ''
      );
      setIsExpertChanged(false);
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки задачи:', err);
      setError('Не удалось загрузить данные задачи');
    } finally {
      setLoading(false);
    }
  };

  const fetchExperts = async () => {
    try {
      const response = await api.get('/api/users/experts');
      setExperts(response.data);
    } catch (err) {
      console.error('Ошибка загрузки экспертов:', err);
    }
  };

  // Загрузка всех договоров для поиска
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
        contract.number?.toLowerCase().includes(searchText.toLowerCase())
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

  // Функция для привязки договора к задаче
  const handleLinkContract = async (contractId) => {
    setIsUpdatingContract(true);
    try {
      await api.put(`/api/tasks/${id}/contract`, { contractId });
      // Обновляем данные задачи
      await fetchTask();
      setContractAnchorEl(null);
      setAlertMessage({
        type: 'success',
        text: 'Договор успешно привязан к задаче'
      });
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('Ошибка привязки договора:', error);
      setAlertMessage({
        type: 'error',
        text: error.response?.data?.message || 'Произошла ошибка при привязке договора'
      });
    } finally {
      setIsUpdatingContract(false);
    }
  };

  // Функция для отвязки договора от задачи
  const handleUnlinkContract = async () => {
    if (!window.confirm('Вы уверены, что хотите отвязать договор от задачи?')) {
      return;
    }

    setIsUpdatingContract(true);
    try {
      await api.put(`/api/tasks/${id}/contract`, { contractId: null });
      // Обновляем данные задачи
      await fetchTask();
      setAlertMessage({
        type: 'success',
        text: 'Договор успешно отвязан от задачи'
      });
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('Ошибка отвязки договора:', error);
      setAlertMessage({
        type: 'error',
        text: error.response?.data?.message || 'Произошла ошибка при отвязке договора'
      });
    } finally {
      setIsUpdatingContract(false);
    }
  };

  const handleAssignNumber = async () => {
    if (!newNumber.trim()) return;

    setIsUpdating(true);
    try {
      await api.put(`/api/tasks/${id}/number`, { number: newNumber });
      setNewNumber('');
      // Обновляем данные задачи для получения актуального статуса
      await fetchTask();
      setAlertMessage({
        type: 'success',
        text: 'Номер успешно присвоен'
      });
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('Ошибка присвоения номера:', error);
      setAlertMessage({
        type: 'error',
        text: error.response?.data?.message || 'Произошла ошибка'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetDecisionDate = async () => {
    if (!newDecisionDate) return;

    setIsUpdatingDecisionDate(true);
    try {
      // Преобразуем дату в формат YYYY-MM-DD
      const formattedDate = new Date(newDecisionDate).toISOString().split('T')[0];

      await api.put(`/api/tasks/${id}/decision-date`, {
        decisionDate: formattedDate
      });
      setNewDecisionDate('');
      // Обновляем данные задачи для получения актуального статуса
      await fetchTask();
      setAlertMessage({
        type: 'success',
        text: 'Дата решения успешно установлена'
      });
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('Ошибка установки даты решения:', error);
      setAlertMessage({
        type: 'error',
        text: error.response?.data?.message || 'Произошла ошибка'
      });
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
      setAlertMessage({
        type: 'success',
        text: 'Статус успешно обновлен'
      });
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      setAlertMessage({
        type: 'error',
        text: error.response?.data?.message || 'Произошла ошибка'
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancelStatusChange = () => {
    setSelectedStatus(task.status);
    setIsStatusChanged(false);
  };

  const handleExpertChange = (event) => {
    setSelectedExpertId(event.target.value);
    setIsExpertChanged(true);
  };

  const handleSaveExpert = async () => {
    if (!isExpertChanged || !task) return;

    setIsUpdatingExpert(true);
    try {
      const response = await api.put(`/api/tasks/${id}/expert`, {
        assignedUserId: selectedExpertId || null
      });
      setTask(response.data);
      setSelectedExpertId(
        response.data.assignedUserId ?? response.data.assignedUser?.id ?? ''
      );
      setIsExpertChanged(false);
      setAlertMessage({
        type: 'success',
        text: 'Эксперт успешно обновлен'
      });
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('Ошибка обновления эксперта:', error);
      setAlertMessage({
        type: 'error',
        text: error.response?.data?.message || 'Произошла ошибка'
      });
    } finally {
      setIsUpdatingExpert(false);
    }
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

  const formatExpertName = (expert) => {
    if (!expert) return '';
    const initials = expert.patronymic
      ? `${expert.secondName} ${expert.firstName[0]}.${expert.patronymic[0]}.`
      : `${expert.secondName} ${expert.firstName[0]}.`;
    return initials;
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!task) return <div className="error-message">Задача не найдена</div>;

  return (
    <div className="content-container">
      {alertMessage && (
        <Alert
          severity={alertMessage.type}
          onClose={() => setAlertMessage(null)}
          sx={{ mb: 2 }}
        >
          {alertMessage.text}
        </Alert>
      )}

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
                {task.previousProcessType}
              </span>
            </div>

            {/* Отображаем номер предыдущего одобрения, если он есть и тип процедуры не "Оформление нового" */}
            {task.previousProcessType && task.previousProcessType !== 'Оформление нового' && task.previousNumber && (
              <div className="task-row">
                <span className="task-label">Номер предыдущего одобрения:</span>
                <span className="task-value">{task.previousNumber}</span>
              </div>
            )}
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
              <span className="task-label">Эксперт</span>
              {task.assignedUserId || task.assignedUser?.id ? (
                <span className="task-value">
                  {formatExpertName(
                    task.assignedUser ||
                      experts.find((expert) => expert.id === task.assignedUserId)
                  )}
                </span>
              ) : (
                <div className="status-container">
                  <FormControl size="small" className="expert-select-control">
                    <Select
                      value={selectedExpertId}
                      onChange={handleExpertChange}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <div className="selected-process">
                              <span className="placeholder-text">Не назначен</span>
                            </div>
                          );
                        }
                        const selectedExpert = experts.find((e) => e.id === selected);
                        return (
                          <div className="selected-process">
                            {formatExpertName(selectedExpert)}
                          </div>
                        );
                      }}
                      MenuProps={{
                        className: 'expert-menu'
                      }}
                    >
                      <MenuItem value="" style={{ whiteSpace: 'normal' }}>
                        <div className="process-option">
                          <Checkbox
                            checked={false}
                            style={{ padding: '0 10px 0 0', flexShrink: 0 }}
                            disabled
                          />
                          <span style={{ fontStyle: 'italic' }}>Не назначен</span>
                        </div>
                      </MenuItem>
                      {experts.map((expert) => (
                        <MenuItem
                          key={expert.id}
                          value={expert.id}
                          style={{ whiteSpace: 'normal' }}
                        >
                          <div className="process-option">
                            <Checkbox
                              checked={selectedExpertId === expert.id}
                              style={{ padding: '0 10px 0 0', flexShrink: 0 }}
                            />
                            <span>{formatExpertName(expert)}</span>
                          </div>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {isExpertChanged && (
                    <div className="status-actions">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleSaveExpert}
                        disabled={isUpdatingExpert}
                        className="save-status-button"
                      >
                        {isUpdatingExpert ? <CircularProgress size={20} /> : 'Сохранить'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedExpertId('');
                          setIsExpertChanged(false);
                        }}
                        disabled={isUpdatingExpert}
                      >
                        Отмена
                      </Button>
                    </div>
                  )}
                </div>
              )}
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
                    className="task-number-field"
                    inputProps={{ className: 'task-number-input' }}
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
              <span className="task-value">{task.applicant || 'Не указан'}</span>
            </div>

            <div className="task-row">
              <span className="task-label">Изготовитель</span>
              <span className="task-value">{task.manufacturer || 'Не указан'}</span>
            </div>

            <div className="task-row">
              <span className="task-label">Представитель</span>
              <span className="task-value">{task.representative || 'Не указан'}</span>
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
          <span className="task-value">{task.createdBy || 'Не указано'}</span>
        </div>
      </div>

      {/* Блок договора (one-to-many) */}
      <div className="task-details-card">
        <div className="task-row contract-section">
          <span className="task-label">Договор</span>
          <div className="contracts-container">
            <div className="contracts-header">
              <Button
                variant={task.contract ? "outlined" : "contained"}
                onClick={handleContractButtonClick}
                disabled={isUpdatingContract}
                startIcon={<LinkIcon />}
                endIcon={<ArrowDropDownIcon />}
              >
                {task.contract ? 'Изменить договор' : 'Привязать договор'}
              </Button>
            </div>

            {task.contract ? (
              <div className="contracts-list">
                <div className="contract-item">
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
                      {task.contract.applicantName && (
                        <div className="contract-detail">
                          <span className="contract-detail-label">Заявитель:</span>
                          <span className="contract-detail-value">{task.contract.applicantName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<UnlinkIcon />}
                    onClick={handleUnlinkContract}
                    disabled={isUpdatingContract}
                  >
                    Отвязать
                  </Button>
                </div>
              </div>
            ) : (
              <div className="no-contracts-message">
                <p>Нет привязанного договора</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="task-actions-footer">
        <Link to={`/tasks/edit/${task.id}`} className="edit-button">
          <EditIcon />
          Редактировать
        </Link>
      </div>

      {/* Меню выбора статуса */}
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={handleStatusMenuClose}
        className="status-menu"
      >
        {Object.entries(statusLabels)
          .filter(([key]) => !['RECEIVED', 'REGISTERED', 'DECISION_DONE'].includes(key))
          .map(([key, label]) => (
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
              onClick={() => handleLinkContract(contract.id)}
              className="contract-menu-item"
              selected={task.contract?.id === contract.id}
            >
              <div className="contract-item-details">
                <div className="contract-item-number">
                  {contract.number}
                  {task.contract?.id === contract.id && (
                    <Chip label="Текущий" size="small" color="primary" sx={{ ml: 1 }} />
                  )}
                </div>
                <div className="contract-item-info">
                  <span>от {formatDate(contract.date)}</span>
                  <span>{getPaymentStatusLabel(contract.paymentStatus)}</span>
                </div>
                <div className="contract-applicant">
                  Заявитель: {contract.applicantName || 'Не указан'}
                </div>
              </div>
            </MenuItem>
          ))
        )}
      </Menu>
    </div>
  );
};

export default TaskDetailsPage;