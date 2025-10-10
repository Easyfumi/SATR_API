import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './ContractListPage.css';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

const ContractListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Состояния для фильтров
    const [filters, setFilters] = useState({
        quickSearch: '',
        number: '',
        paymentStatus: '',
        comments: ''
    });



    // Маппинг статусов оплаты
    const paymentStatusLabels = {
        PAIDFOR: 'Оплачен',
        PARTIALLYPAIDFOR: 'Оплачен частично',
        NOTPAIDFOR: 'Не оплачен'
    };

    // Статусы оплаты для фильтра
    const paymentStatusOptions = [
        { value: '', label: 'Все статусы' },
        { value: 'PAIDFOR', label: 'Оплачен' },
        { value: 'PARTIALLYPAIDFOR', label: 'Оплачен частично' },
        { value: 'NOTPAIDFOR', label: 'Не оплачен' }
    ];

    // Загрузка договоров
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
        // Здесь будет логика применения фильтров к API
        // Пока просто перезагружаем все данные
        fetchContracts();
    };

    // Сбросить фильтры
    const handleResetFilters = () => {
        const resetFilters = {
            quickSearch: '',
            number: '',
            paymentStatus: '',
            comments: ''
        };
        setFilters(resetFilters);
        fetchContracts();
    };

    // Фильтрация договоров на клиенте (временное решение)
    const getFilteredContracts = () => {
        let filtered = contracts;

        if (filters.quickSearch) {
            const searchTerm = filters.quickSearch.toLowerCase();
            filtered = filtered.filter(contract =>
                contract.number?.toLowerCase().includes(searchTerm) ||
                contract.comments?.toLowerCase().includes(searchTerm)
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

        if (filters.comments) {
            filtered = filtered.filter(contract =>
                contract.comments?.toLowerCase().includes(filters.comments.toLowerCase())
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
        if (filters.comments) activeFilters.push({ label: 'Комментарий', value: filters.comments });

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

    return (
        <div className="content-container">
            <div className="contracts-header">


                <h2 className="page-title">Раздел договоров</h2>

                <Link
                    to="/api/contracts/create"
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
                            placeholder="Поиск по номеру договора или комментарию..."
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
                                <label>Комментарий</label>
                                <input
                                    type="text"
                                    value={filters.comments}
                                    onChange={(e) => handleFilterChange('comments', e.target.value)}
                                    placeholder="Поиск в комментариях"
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
                                        <span className="info-label">Связанная задача:</span>
                                        <span className="info-value">
                                            {contract.tasks ? `Задача #${contract.tasks.id}` : 'Не привязана'}
                                        </span>
                                    </div>

                                    {contract.comments && (
                                        <div className="info-row">
                                            <span className="info-label">Комментарий:</span>
                                            <span className="info-value comments">
                                                {contract.comments}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ContractListPage;