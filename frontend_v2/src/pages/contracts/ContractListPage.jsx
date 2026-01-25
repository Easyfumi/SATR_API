import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { canViewTasksAndContracts } from '../../utils/roleUtils';
import AccessDenied from '../../components/AccessDenied';
import './ContractListPage.css';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

const ContractListPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [tasksCountByContract, setTasksCountByContract] = useState({});

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
        PARTIALLYPAIDFOR: 'Частично',
        NOTPAIDFOR: 'Не оплачен'
    };

    const fetchTaskCounts = useCallback(async (contractsList) => {
        if (!contractsList.length) {
            setTasksCountByContract({});
            return;
        }

        try {
            const results = await Promise.all(
                contractsList.map(async (contract) => {
                    try {
                        const response = await api.get(`/api/contracts/${contract.id}/tasks`);
                        const tasks = Array.isArray(response.data) ? response.data : [];
                        return [contract.id, tasks.length];
                    } catch (error) {
                        console.error(`Error loading tasks count for contract ${contract.id}:`, error);
                        return [contract.id, null];
                    }
                })
            );

            const nextCounts = {};
            results.forEach(([id, count]) => {
                nextCounts[id] = count;
            });
            setTasksCountByContract(nextCounts);
        } catch (error) {
            console.error('Error loading tasks counts:', error);
        }
    }, []);

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
            fetchTaskCounts(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching contracts:', error);
            setError('Ошибка загрузки данных');
            setContracts([]);
        } finally {
            setLoading(false);
        }
    }, [fetchTaskCounts]);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    // Обработчик быстрого поиска
    const handleQuickSearch = useCallback((value) => {
        setFilters(prev => ({
            ...prev,
            quickSearch: value
        }));
    }, []);

    // Проверка доступа (после всех хуков)
    if (!canViewTasksAndContracts(user)) {
        return <AccessDenied message="У вас нет доступа для просмотра договоров. Доступ имеют только авторизованные пользователи с назначенными ролями." />;
    }

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
                        filteredContracts.map(contract => {
                            const statusText = (paymentStatusLabels[contract.paymentStatus] || contract.paymentStatus || '')
                                .toString()
                                .toUpperCase();
                            const tasksCount = tasksCountByContract[contract.id];
                            const tasksText = tasksCount == null ? null : `ЗАДАЧ: ${tasksCount}`;

                            return (
                            <div
                                key={contract.id}
                                className={`contract-card ${filters.quickSearch ? 'highlighted' : ''}`}
                                onClick={() => navigate(`/contracts/${contract.id}`)}
                            >
                                <div className="contract-row">
                                    <div className="contract-row">
                                        <div className="contract-col contract-col-number">
                                            <span className="contract-number-text">{contract.number || 'Номер не указан'}</span>
                                            &nbsp;от&nbsp;<span className="contract-date-text">{formatDate(contract.date)}</span>
                                        </div>
                                        <div className="contract-col contract-col-applicant">
                                            {contract.applicantName || 'Не указан'}
                                        </div>
                                        <div className="contract-col contract-col-tasks">
                                            {tasksText || 'ЗАДАЧ: —'}
                                        </div>
                                        <div className="contract-col contract-col-status">
                                            <span className={`payment-status-text ${getStatusBadgeClass(contract.paymentStatus)}`}>
                                                {statusText}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default ContractListPage;