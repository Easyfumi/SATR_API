// TaskListPage.jsx (исправленная версия)

import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { canViewTasksAndContracts } from '../../utils/roleUtils';
import AccessDenied from '../../components/AccessDenied';
import './TaskListPage.css';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const TaskListPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Состояния для пагинации
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 10
    });

    const [filters, setFilters] = useState({
        quickSearch: '',
        number: '',
        applicant: '',
        manufacturer: '',
        mark: '',
        typeName: '',
        representative: '',
        assignedUser: '',
        status: '',
        paymentStatus: '',
        applicationDateFrom: '',
        applicationDateTo: '',
        hasContract: '',
        contractNumber: ''
    });

    // Навигационные кнопки
    const navItems = [
        { path: '/tasks', label: 'ОТТС / ОТШ' },
        { path: '/decl', label: 'Декларации' },
        { path: '/serts', label: 'Сертификаты' }
    ];

    // Маппинг статусов
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

    // Статусы для фильтра
    const statusOptions = [
        { value: '', label: 'Все статусы' },
        { value: 'RECEIVED', label: 'Заявка получена' },
        { value: 'REGISTERED', label: 'Заявка зарегистрирована' },
        { value: 'DECISION_DONE', label: 'Решение по заявке готово' },
        { value: 'DOCUMENTS_WAITING', label: 'Ожидание документов' },
        { value: 'REJECTION', label: 'Отказ в проведении работ' },
        { value: 'CANCELLED', label: 'Аннулирована' },
        { value: 'PROJECT', label: 'Переведено в проект' },
        { value: 'SIGNED', label: 'Подписано' },
        { value: 'FOR_REVISION', label: 'Возвращено на доработку' },
        { value: 'COMPLETED', label: 'Заявка выполнена' }
    ];

    // Статусы оплаты для фильтра
    const paymentStatusOptions = [
        { value: '', label: 'Все' },
        { value: 'true', label: 'Оплачено' },
        { value: 'false', label: 'Ожидает оплаты' }
    ];

    // Опции для фильтрации по договору
    const contractOptions = [
        { value: '', label: 'Все задачи' },
        { value: 'true', label: 'С договором' },
        { value: 'false', label: 'Без договора' }
    ];

    // Опции для выбора количества элементов на странице
    const pageSizeOptions = [10, 25, 50];

    // Загрузка задач с фильтрами и пагинацией
    const fetchTasks = useCallback(async (searchFilters = {}, page = 0, size = pagination.pageSize) => {
        setLoading(true);
        try {
            // Удаляем пустые поля из фильтров, но сохраняем boolean значения
            const cleanFilters = Object.fromEntries(
                Object.entries(searchFilters).filter(([_, value]) => {
                    if (value === '' || value == null) return false;
                    if (typeof value === 'boolean') return true;
                    return value !== '';
                })
            );

            // Оставляем boolean значения как boolean (axios правильно сериализует их)
            const preparedFilters = {};
            Object.entries(cleanFilters).forEach(([key, value]) => {
                preparedFilters[key] = value;
            });

            console.log('Отправляем запрос с параметрами:', { ...preparedFilters, page, size });
            
            const response = await api.get('/api/tasks/search', {
                params: {
                    ...preparedFilters,
                    page,
                    size
                }
            });

            // Логируем ответ для отладки
            console.log('Ответ от бэкенда:', response.data);
            
            const data = response.data.content || response.data || [];
            const paginationData = response.data;

            setTasks(data);

            if (paginationData) {
                setPagination(prev => ({
                    ...prev,
                    currentPage: paginationData.currentPage || page,
                    totalPages: paginationData.totalPages || 1,
                    totalElements: paginationData.totalElements || data.length,
                    pageSize: size
                }));
            }

            setError(null);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError('Ошибка загрузки данных');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageSize]);

    // Загрузка всех задач (без фильтров)
    const fetchAllTasks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/tasks');
            const data = Array.isArray(response.data) ? response.data : [];
            console.log('Все задачи:', data);
            setTasks(data);

            setPagination(prev => ({
                ...prev,
                totalPages: Math.ceil(data.length / prev.pageSize),
                totalElements: data.length
            }));

            setError(null);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError('Ошибка загрузки данных');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllTasks();
    }, [fetchAllTasks]);

    // useEffect для отладки
    useEffect(() => {
        if (tasks.length > 0) {
            console.log('Первая задача в состоянии:', tasks[0]);
            console.log('decisionAt первой задачи:', tasks[0].decisionAt);
            console.log('Все поля задачи:', Object.keys(tasks[0]));
        }
    }, [tasks]);

    // Обработчик быстрого поиска
    const handleQuickSearch = useCallback((value) => {
        const newFilters = {
            ...filters,
            quickSearch: value,
            number: '',
            assignedUser: ''
        };

        setFilters(newFilters);

        if (!value.trim()) {
            fetchAllTasks();
        } else {
            fetchTasks({ quickSearch: value }, 0);
        }
    }, [filters, fetchTasks, fetchAllTasks]);

    // Проверка доступа (после всех хуков)
    if (!canViewTasksAndContracts(user)) {
        return <AccessDenied message="У вас нет доступа для просмотра заявок. Доступ имеют только авторизованные пользователи с назначенными ролями." />;
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
        const filtersWithoutQuickSearch = { ...filters };
        delete filtersWithoutQuickSearch.quickSearch;

        const preparedFilters = { ...filtersWithoutQuickSearch };
        if (preparedFilters.hasContract === 'true') {
            preparedFilters.hasContract = true;
        } else if (preparedFilters.hasContract === 'false') {
            preparedFilters.hasContract = false;
        } else if (preparedFilters.hasContract === '') {
            delete preparedFilters.hasContract;
        }

        // Преобразуем paymentStatus из строки в boolean
        if (preparedFilters.paymentStatus === 'true') {
            preparedFilters.paymentStatus = true;
        } else if (preparedFilters.paymentStatus === 'false') {
            preparedFilters.paymentStatus = false;
        } else if (preparedFilters.paymentStatus === '') {
            delete preparedFilters.paymentStatus;
        }

        console.log('Применяем фильтры:', preparedFilters);
        fetchTasks(preparedFilters, 0);
    };

    // Сбросить фильтры
    const handleResetFilters = () => {
        const resetFilters = {
            quickSearch: '',
            number: '',
            applicant: '',
            manufacturer: '',
            mark: '',
            typeName: '',
            representative: '',
            assignedUser: '',
            status: '',
            paymentStatus: '',
            applicationDateFrom: '',
            applicationDateTo: '',
            hasContract: '',
            contractNumber: ''
        };
        setFilters(resetFilters);
        setPagination(prev => ({ ...prev, currentPage: 0 }));
        fetchAllTasks();
    };

    const getActiveFilters = () => {
        const activeFilters = [];

        if (filters.quickSearch) activeFilters.push({ label: 'Быстрый поиск', value: filters.quickSearch });
        if (filters.number) activeFilters.push({ label: 'Номер', value: filters.number });
        if (filters.applicant) activeFilters.push({ label: 'Заявитель', value: filters.applicant });
        if (filters.manufacturer) activeFilters.push({ label: 'Производитель', value: filters.manufacturer });
        if (filters.mark) activeFilters.push({ label: 'Марка', value: filters.mark });
        if (filters.typeName) activeFilters.push({ label: 'Наименование типа', value: filters.typeName });
        if (filters.representative) activeFilters.push({ label: 'Представитель', value: filters.representative });
        if (filters.assignedUser) activeFilters.push({ label: 'Исполнитель', value: filters.assignedUser });
        if (filters.status) activeFilters.push({
            label: 'Статус',
            value: statusOptions.find(s => s.value === filters.status)?.label
        });
        if (filters.paymentStatus) activeFilters.push({
            label: 'Оплата',
            value: paymentStatusOptions.find(p => p.value === filters.paymentStatus)?.label
        });
        if (filters.hasContract) activeFilters.push({
            label: 'Договор',
            value: contractOptions.find(c => c.value === filters.hasContract)?.label
        });
        if (filters.contractNumber) activeFilters.push({
            label: 'Номер договора',
            value: filters.contractNumber
        });
        if (filters.applicationDateFrom || filters.applicationDateTo) {
            activeFilters.push({
                label: 'Дата заявки',
                value: `${filters.applicationDateFrom || '...'} - ${filters.applicationDateTo || '...'}`
            });
        }

        return activeFilters;
    };

    // Обработчики пагинации
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));

            const hasActiveFilters = Object.values(filters).some(value => value !== '' && value != null);
            if (hasActiveFilters) {
                const filtersWithoutQuickSearch = { ...filters };
                delete filtersWithoutQuickSearch.quickSearch;

                const preparedFilters = { ...filtersWithoutQuickSearch };
                if (preparedFilters.hasContract === 'true') {
                    preparedFilters.hasContract = true;
                } else if (preparedFilters.hasContract === 'false') {
                    preparedFilters.hasContract = false;
                } else if (preparedFilters.hasContract === '') {
                    delete preparedFilters.hasContract;
                }

                // Преобразуем paymentStatus из строки в boolean
                if (preparedFilters.paymentStatus === 'true') {
                    preparedFilters.paymentStatus = true;
                } else if (preparedFilters.paymentStatus === 'false') {
                    preparedFilters.paymentStatus = false;
                } else if (preparedFilters.paymentStatus === '') {
                    delete preparedFilters.paymentStatus;
                }

                if (filters.quickSearch) {
                    fetchTasks({ quickSearch: filters.quickSearch }, newPage);
                } else {
                    fetchTasks(preparedFilters, newPage);
                }
            } else {
                fetchAllTasks();
            }
        }
    };

    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({
            ...prev,
            pageSize: newSize,
            currentPage: 0,
            totalPages: Math.ceil(prev.totalElements / newSize)
        }));

        const hasActiveFilters = Object.values(filters).some(value => value !== '' && value != null);
        if (hasActiveFilters) {
            const filtersWithoutQuickSearch = { ...filters };
            delete filtersWithoutQuickSearch.quickSearch;

            const preparedFilters = { ...filtersWithoutQuickSearch };
            if (preparedFilters.hasContract === 'true') {
                preparedFilters.hasContract = true;
            } else if (preparedFilters.hasContract === 'false') {
                preparedFilters.hasContract = false;
            } else if (preparedFilters.hasContract === '') {
                delete preparedFilters.hasContract;
            }

            // Преобразуем paymentStatus из строки в boolean
            if (preparedFilters.paymentStatus === 'true') {
                preparedFilters.paymentStatus = true;
            } else if (preparedFilters.paymentStatus === 'false') {
                preparedFilters.paymentStatus = false;
            } else if (preparedFilters.paymentStatus === '') {
                delete preparedFilters.paymentStatus;
            }

            if (filters.quickSearch) {
                fetchTasks({ quickSearch: filters.quickSearch }, 0, newSize);
            } else {
                fetchTasks(preparedFilters, 0, newSize);
            }
        }
    };

    const handleManualPageInput = (e) => {
        if (e.key === 'Enter') {
            const pageNum = parseInt(e.target.value) - 1;
            if (!isNaN(pageNum) && pageNum >= 0 && pageNum < pagination.totalPages) {
                handlePageChange(pageNum);
            }
            e.target.value = '';
        }
    };

    // Получаем задачи для текущей страницы
    const getCurrentPageTasks = () => {
        if (tasks.length <= pagination.pageSize) {
            return tasks;
        }

        const startIndex = pagination.currentPage * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        return tasks.slice(startIndex, endIndex);
    };

    const currentTasks = getCurrentPageTasks();

    // Генерация номеров страниц для отображения
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(0, pagination.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pagination.totalPages - 1, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    // Форматирование даты
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };

    return (
        <div className="content-container">
            <div className="tasks-header">
                <div className="nav-buttons-container">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-button ${location.pathname === item.path ? 'active' : ''
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                <h2 className="page-title">Раздел Одобрения типа транспортного средства / шасси</h2>

                <Link
                    to="/tasks/create"
                    className="create-task-button"
                >
                    <LibraryAddIcon className="create-task-icon" />
                    <h1 className="create-task-text">Новая заявка</h1>
                </Link>
            </div>

            {/* Панель поиска и фильтров */}
            <div className="search-filters-panel">
                <div className="quick-search-section">
                    <div className="search-input-container">
                        <SearchIcon className="search-icon" />
                        <input
                            type="text"
                            placeholder="Поиск по номеру заявки, исполнителю или номеру договора..."
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
                                <label>Номер заявки</label>
                                <input
                                    type="text"
                                    value={filters.number}
                                    onChange={(e) => handleFilterChange('number', e.target.value)}
                                    placeholder="Введите номер"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Заявитель</label>
                                <input
                                    type="text"
                                    value={filters.applicant}
                                    onChange={(e) => handleFilterChange('applicant', e.target.value)}
                                    placeholder="Введите заявителя"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Производитель</label>
                                <input
                                    type="text"
                                    value={filters.manufacturer}
                                    onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
                                    placeholder="Введите производителя"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Марка</label>
                                <input
                                    type="text"
                                    value={filters.mark}
                                    onChange={(e) => handleFilterChange('mark', e.target.value)}
                                    placeholder="Введите марку"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Наименование типа</label>
                                <input
                                    type="text"
                                    value={filters.typeName}
                                    onChange={(e) => handleFilterChange('typeName', e.target.value)}
                                    placeholder="Введите наименование типа"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Представитель</label>
                                <input
                                    type="text"
                                    value={filters.representative}
                                    onChange={(e) => handleFilterChange('representative', e.target.value)}
                                    placeholder="Введите представителя"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Исполнитель</label>
                                <input
                                    type="text"
                                    value={filters.assignedUser}
                                    onChange={(e) => handleFilterChange('assignedUser', e.target.value)}
                                    placeholder="Введите исполнителя"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Статус</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
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

                            {/* НОВЫЕ ФИЛЬТРЫ ПО ДОГОВОРУ */}
                            <div className="filter-group">
                                <label>Договор</label>
                                <select
                                    value={filters.hasContract}
                                    onChange={(e) => handleFilterChange('hasContract', e.target.value)}
                                >
                                    {contractOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Номер договора</label>
                                <input
                                    type="text"
                                    value={filters.contractNumber}
                                    onChange={(e) => handleFilterChange('contractNumber', e.target.value)}
                                    placeholder="Введите номер договора"
                                />
                            </div>

                            <div className="filter-group date-filter">
                                <label>Дата заявки с</label>
                                <input
                                    type="date"
                                    value={filters.applicationDateFrom}
                                    onChange={(e) => handleFilterChange('applicationDateFrom', e.target.value)}
                                />
                            </div>

                            <div className="filter-group date-filter">
                                <label>по</label>
                                <input
                                    type="date"
                                    value={filters.applicationDateTo}
                                    onChange={(e) => handleFilterChange('applicationDateTo', e.target.value)}
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
                    Найдено заявок: {pagination.totalElements}
                </div>
                <div className="page-size-selector">
                    <span>Показывать по:</span>
                    <select
                        value={pagination.pageSize}
                        onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <>
                    <div className="tasks-list">
                        {currentTasks.length === 0 ? (
                            <div className="no-tasks-message">
                                {filters.quickSearch || Object.values(filters).some(value => value !== '')
                                    ? 'Задачи по заданным фильтрам не найдены'
                                    : 'Задачи не найдены'
                                }
                            </div>
                        ) : (
                            currentTasks.map(task => (
                                <div
                                    key={task.id}
                                    className={`task-card ${filters.quickSearch ? 'highlighted' : ''}`}
                                    onClick={() => navigate(`/tasks/${task.id}`)}
                                >
                                    {/* Верхняя строка с номером, исполнителем, решением и статусом */}
                                    <div className="task-card-header">
                                        <div className="task-top-line">
                                            <div className="task-top-col task-top-col-number">
                                                <div className={`registration-status ${task.number ? 'registered' : 'unregistered'}`}>
                                                    {task.number ? (
                                                        <span className="task-top-value">
                                                            {task.applicationDate
                                                                ? `${task.number} от ${formatDate(task.applicationDate)}`
                                                                : task.number}
                                                        </span>
                                                    ) : (
                                                        <span className="task-top-value-missing">не зарегистрирована</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="task-top-col task-top-col-assignee">
                                                <div className="task-list-assignee">
                                                    Исполнитель: <span className="task-top-value">
                                                        {task.assignedUser ? (
                                                            `${task.assignedUser.secondName} ${task.assignedUser.firstName[0]}.${task.assignedUser.patronymic?.[0] || ''}`
                                                        ) : (
                                                            <span className="task-top-value-missing">не назначен</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="task-top-col task-top-col-decision">
                                                <div className="task-list-decision">
                                                    Решение по заявке: <span className="task-top-value">
                                                        {task.decisionAt ? (
                                                            formatDate(task.decisionAt)
                                                        ) : (
                                                            <span className="task-top-value-missing">отсутствует</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="task-top-col task-top-col-status">
                                                <span className={`status-badge ${task.status?.toLowerCase()}`}>
                                                    {statusLabels[task.status] || task.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Строка с данными в grid-контейнере */}
                                    <div className="info-grid">
                                        <div className="grid-item">
                                            <div className="grid-label-invisible">Тип</div>
                                            <div className="grid-value">{task.docType}</div>
                                        </div>
                                        <div className="grid-item">
                                            <div className="grid-label">Марка</div>
                                            <div className="grid-value">{task.mark}</div>
                                        </div>
                                        <div className="grid-item">
                                            <div className="grid-label">Тип</div>
                                            <div className="grid-value">{task.typeName}</div>
                                        </div>
                                        <div className="grid-item">
                                            <div className="grid-label">Категории</div>
                                            <div className="grid-value">
                                                {task.categories?.join(', ')}
                                            </div>
                                        </div>
                                        <div className="grid-item">
                                            <div className="grid-label">Заявитель</div>
                                            <div className="grid-value">{task.applicant}</div>
                                        </div>
                                    </div>

                                    {/* Информация об исполнителе, договоре и оплате */}
                                    <div className="expert-contract-section">
                                        <div className="contract-row">
                                            <span className={`info-label ${!task.contract ? 'task-top-value-missing' : ''}`}>
                                                Номер договора:{' '}
                                            </span>
                                            <span className="info-value">
                                                {task.contract ? (
                                                    <span className="contract-number-value">{task.contract.number}</span>
                                                ) : (
                                                    <span className="task-top-value-missing">договор не привязан</span>
                                                )}
                                            </span>
                                            {task.contract && (
                                                <span className="contract-payment-inline">
                                                    <span className={`payment-status ${task.contract.paymentStatus === 'PAIDFOR' ? 'paid' :
                                                        task.contract.paymentStatus === 'PARTIALLYPAIDFOR' ? 'partially-paid' : 'unpaid'}`}>
                                                        {task.contract.paymentStatus === 'PAIDFOR' ? 'Оплачен' :
                                                            task.contract.paymentStatus === 'PARTIALLYPAIDFOR' ? 'Частично оплачен' : 'Не оплачен'}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Пагинация */}
                    {pagination.totalPages > 1 && (
                        <div className="pagination-container">
                            <div className="pagination-info">
                                Страница {pagination.currentPage + 1} из {pagination.totalPages}
                            </div>

                            <div className="pagination-controls">
                                <button
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(0)}
                                    disabled={pagination.currentPage === 0}
                                >
                                    <FirstPageIcon />
                                </button>

                                <button
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 0}
                                >
                                    <NavigateBeforeIcon />
                                </button>

                                {getPageNumbers().map(page => (
                                    <button
                                        key={page}
                                        className={`pagination-btn ${page === pagination.currentPage ? 'active' : ''}`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page + 1}
                                    </button>
                                ))}

                                <button
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                                >
                                    <NavigateNextIcon />
                                </button>

                                <button
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(pagination.totalPages - 1)}
                                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                                >
                                    <LastPageIcon />
                                </button>
                            </div>

                            <div className="pagination-jump">
                                <span>Перейти к странице:</span>
                                <input
                                    type="number"
                                    min="1"
                                    max={pagination.totalPages}
                                    placeholder={String(pagination.currentPage + 1)}
                                    onKeyPress={handleManualPageInput}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TaskListPage;