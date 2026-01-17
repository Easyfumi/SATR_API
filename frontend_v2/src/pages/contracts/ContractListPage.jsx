import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './ContractListPage.css';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import {
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material';
import TaskIcon from '@mui/icons-material/Task';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';

const ContractListPage = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [tasksDialogOpen, setTasksDialogOpen] = useState(false);
    const [selectedContractTasks, setSelectedContractTasks] = useState([]);
    const [selectedContractName, setSelectedContractName] = useState('');
    const [loadingTasks, setLoadingTasks] = useState(false);

    // Состояния для фильтров
    const [filters, setFilters] = useState({
        quickSearch: '',
        number: '',
        paymentStatus: '',
        applicantName: ''
    });

    // Маппинг статусов оплаты
    const paymentStatusLabels = {
        PAIDFOR: 'Оплачен',
        PARTIALLYPAIDFOR: 'Оплачен частично',
        NOTPAIDFOR: 'Не оплачен'
    };

    const taskStatusLabels = {
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

    // Статусы оплаты для фильтра
    const paymentStatusOptions = [
        { value: '', label: 'Все статусы' },
        { value: 'PAIDFOR', label: 'Оплачен' },
        { value: 'PARTIALLYPAIDFOR', label: 'Оплачен частично' },
        { value: 'NOTPAIDFOR', label: 'Не оплачен' }
    ];

    // Загрузка договоров (теперь получаем ContractSimple)
    const fetchContracts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/contracts');
            const data = Array.isArray(response.data) ? response.data : [];
            setContracts(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching contracts:', error);
            setError('Ошибка загрузки данных');
            setContracts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    // Функция для загрузки задач договора
    const handleShowTasks = async (contractId, contractNumber, event) => {
        if (event) event.stopPropagation();
        
        setSelectedContractName(contractNumber || 'Договор');
        setTasksDialogOpen(true);
        setLoadingTasks(true);
        
        try {
            const response = await api.get(`/api/contracts/${contractId}/tasks`);
            setSelectedContractTasks(response.data || []);
        } catch (error) {
            console.error('Error loading tasks for contract:', error);
            setSelectedContractTasks([]);
        } finally {
            setLoadingTasks(false);
        }
    };

    // Функция для перехода к задаче
    const handleGoToTask = (taskId) => {
        setTasksDialogOpen(false);
        navigate(`/tasks/${taskId}`);
    };

    // Обработчик быстрого поиска
    const handleQuickSearch = useCallback((value) => {
        setFilters(prev => ({
            ...prev,
            quickSearch: value
        }));
    }, []);

    // Обработчик изменения фильтров
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Применить фильтры
    const handleApplyFilters = () => {
        fetchContracts();
    };

    // Сбросить фильтры
    const handleResetFilters = () => {
        const resetFilters = {
            quickSearch: '',
            number: '',
            paymentStatus: '',
            applicantName: ''
        };
        setFilters(resetFilters);
        fetchContracts();
    };

    // Фильтрация договоров на клиенте
    const getFilteredContracts = () => {
        let filtered = contracts;

        if (filters.quickSearch) {
            const searchTerm = filters.quickSearch.toLowerCase();
            filtered = filtered.filter(contract =>
                contract.number?.toLowerCase().includes(searchTerm) ||
                contract.applicantName?.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.number) {
            filtered = filtered.filter(contract =>
                contract.number?.toLowerCase().includes(filters.number.toLowerCase())
            );
        }

        if (filters.paymentStatus) {
            filtered = filtered.filter(contract =>
                contract.paymentStatus === filters.paymentStatus
            );
        }

        if (filters.applicantName) {
            filtered = filtered.filter(contract =>
                contract.applicantName?.toLowerCase().includes(filters.applicantName.toLowerCase())
            );
        }

        return filtered;
    };

    const filteredContracts = getFilteredContracts();

    const getActiveFilters = () => {
        const activeFilters = [];

        if (filters.quickSearch) activeFilters.push({ label: 'Быстрый поиск', value: filters.quickSearch });
        if (filters.number) activeFilters.push({ label: 'Номер договора', value: filters.number });
        if (filters.paymentStatus) activeFilters.push({
            label: 'Статус оплаты',
            value: paymentStatusOptions.find(p => p.value === filters.paymentStatus)?.label
        });
        if (filters.applicantName) activeFilters.push({ label: 'Заявитель', value: filters.applicantName });

        return activeFilters;
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PAIDFOR': return 'paid';
            case 'PARTIALLYPAIDFOR': return 'partially-paid';
            case 'NOTPAIDFOR': return 'not-paid';
            default: return '';
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Не указана';
        return new Date(date).toLocaleDateString('ru-RU');
    };

    const getTaskStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'error';
            case 'REJECTION': return 'warning';
            default: return 'default';
        }
    };

    return (
        <div className="content-container">
            <div className="tasks-header">
                <h2 className="page-title">Раздел договоров</h2>

                <Link
                    to="/contracts/create"
                    className="create-contract-button"
                >
                    <LibraryAddIcon className="create-contract-icon" />
                    <h1 className="create-contract-text">Новый договор</h1>
                </Link>
            </div>

            {/* Панель поиска и фильтров */}
            <div className="search-filters-panel">
                <div className="quick-search-section">
                    <div className="search-input-container">
                        <SearchIcon className="search-icon" />
                        <input
                            type="text"
                            placeholder="Поиск по номеру договора или заявителю..."
                            className="search-input"
                            value={filters.quickSearch}
                            onChange={(e) => handleQuickSearch(e.target.value)}
                        />
                    </div>

                    <button
                        className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FilterListIcon />
                        Фильтры
                        {Object.entries(filters)
                            .filter(([key, value]) => key !== 'quickSearch' && value !== '')
                            .length > 0 && (
                                <span className="filter-indicator"></span>
                            )}
                    </button>
                </div>

                {/* Расширенные фильтры */}
                {showFilters && (
                    <div className="advanced-filters">
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label>Номер договора</label>
                                <input
                                    type="text"
                                    value={filters.number}
                                    onChange={(e) => handleFilterChange('number', e.target.value)}
                                    placeholder="Введите номер договора"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Статус оплаты</label>
                                <select
                                    value={filters.paymentStatus}
                                    onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                                >
                                    {paymentStatusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Заявитель</label>
                                <input
                                    type="text"
                                    value={filters.applicantName}
                                    onChange={(e) => handleFilterChange('applicantName', e.target.value)}
                                    placeholder="Поиск по заявителю"
                                />
                            </div>
                        </div>

                        <div className="filter-actions">
                            <button className="apply-filters-btn" onClick={handleApplyFilters}>
                                Применить фильтры
                            </button>
                            <button className="reset-filters-btn" onClick={handleResetFilters}>
                                <ClearIcon />
                                Сбросить
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Информация о примененных фильтрах */}
            {getActiveFilters().length > 0 && (
                <div className="active-filters-info">
                    <span>Применены фильтры: </span>
                    {getActiveFilters().map((filter, index) => (
                        <span key={index} className="filter-tag">
                            {filter.label}: {filter.value}
                        </span>
                    ))}
                </div>
            )}

            {/* Панель информации о результатах */}
            <div className="results-info-panel">
                <div className="results-count">
                    Найдено договоров: {filteredContracts.length}
                </div>
            </div>

            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="contracts-list">
                    {filteredContracts.length === 0 ? (
                        <div className="no-contracts-message">
                            {filters.quickSearch || Object.values(filters).some(value => value !== '')
                                ? 'Договоры по заданным фильтрам не найдены'
                                : 'Договоры не найдены'
                            }
                        </div>
                    ) : (
                        filteredContracts.map(contract => (
                            <div
                                key={contract.id}
                                className={`contract-card ${filters.quickSearch ? 'highlighted' : ''}`}
                                onClick={() => navigate(`/contracts/${contract.id}`)}
                            >
                                {/* Верхняя строка с номером и статусом */}
                                <div className="contract-card-header">
                                    <div className="contract-number-section">
                                        <div className="contract-number">
                                            {contract.number || 'Номер не указан'}
                                        </div>
                                        <Chip
                                            icon={<TaskIcon />}
                                            label="Задачи"
                                            size="small"
                                            color="primary"
                                            onClick={(e) => handleShowTasks(contract.id, contract.number, e)}
                                            className="tasks-chip"
                                        />
                                    </div>

                                    {/* Статус оплаты */}
                                    <div className="payment-status-section">
                                        <span className={`payment-status-badge ${getStatusBadgeClass(contract.paymentStatus)}`}>
                                            {paymentStatusLabels[contract.paymentStatus] || contract.paymentStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Основная информация */}
                                <div className="contract-info">
                                    <div className="info-row">
                                        <span className="info-label">Дата:</span>
                                        <span className="info-value">
                                            {formatDate(contract.date)}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Заявитель:</span>
                                        <span className="info-value">
                                            {contract.applicantName || 'Не указан'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Диалог для просмотра задач договора */}
            <Dialog
                open={tasksDialogOpen}
                onClose={() => setTasksDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                            Задачи договора: {selectedContractName}
                        </Typography>
                        <IconButton onClick={() => setTasksDialogOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogTitle>
                <DialogContent>
                    {loadingTasks ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <CircularProgress />
                            <Typography variant="body2" style={{ marginTop: '16px' }}>
                                Загрузка задач...
                            </Typography>
                        </div>
                    ) : selectedContractTasks.length === 0 ? (
                        <Typography variant="body1" style={{ padding: '20px', textAlign: 'center' }}>
                            Нет привязанных задач
                        </Typography>
                    ) : (
                        <List>
                            {selectedContractTasks.map((task) => (
                                <ListItem
                                    key={task.id}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleGoToTask(task.id)}
                                        >
                                            <ArrowForwardIcon />
                                        </IconButton>
                                    }
                                    style={{ borderBottom: '1px solid #eee' }}
                                >
                                    <ListItemText
                                        primary={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Typography variant="subtitle1">
                                                    {task.number || `ID: ${task.id}`}
                                                </Typography>
                                                <Chip
                                                    label={taskStatusLabels[task.status] || task.status}
                                                    size="small"
                                                    color={getTaskStatusColor(task.status)}
                                                    variant="outlined"
                                                />
                                            </div>
                                        }
                                        secondary={
                                            <React.Fragment>
                                                <Typography variant="body2" component="span">
                                                    {task.docType}
                                                </Typography>
                                                <br />
                                                <Typography variant="body2" color="textSecondary">
                                                    Создана: {task.createdAt ? new Date(task.createdAt).toLocaleDateString('ru-RU') : 'Не указана'}
                                                </Typography>
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTasksDialogOpen(false)}>
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ContractListPage;