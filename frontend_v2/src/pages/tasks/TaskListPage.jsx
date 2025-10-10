// TaskListPage.jsx

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './TaskListPage.css';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

const TaskListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        number: '',
        applicant: '',
        manufacturer: '',
        mark: '',
        typeName: '',
        representative: '',
        assignedUser: '',
        status: '',
        paymentStatus: '',
        createdAtFrom: '',
        createdAtTo: ''
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

    // Загрузка задач с фильтрами
    const fetchTasks = async (searchFilters = {}) => {
        setLoading(true);
        try {
            // Удаляем пустые поля из фильтров
            const cleanFilters = Object.fromEntries(
                Object.entries(searchFilters).filter(([_, value]) => value !== '')
            );

            const response = await api.get('/api/tasks/search', { params: cleanFilters });
            const data = Array.isArray(response.data) ? response.data : [];
            setTasks(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError('Ошибка загрузки данных');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    // Загрузка всех задач (без фильтров)
    const fetchAllTasks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/tasks');
            const data = Array.isArray(response.data) ? response.data : [];
            setTasks(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError('Ошибка загрузки данных');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllTasks();
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
        fetchTasks(filters);
    };

    // Сбросить фильтры
    const handleResetFilters = () => {
        const resetFilters = {
            number: '',
            applicant: '',
            manufacturer: '',
            mark: '',
            typeName: '',
            representative: '',
            assignedUser: '',
            status: '',
            paymentStatus: '',
            createdAtFrom: '',
            createdAtTo: ''
        };
        setFilters(resetFilters);
        fetchAllTasks();
    };

    // Быстрый поиск (по номеру и марке)
    const handleQuickSearch = (value) => {
        if (!value.trim()) {
            fetchAllTasks();
            return;
        }
        
        const searchFilters = {
            number: value,
            mark: value
        };
        fetchTasks(searchFilters);
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
                            placeholder="Поиск по номеру или марке..."
                            className="search-input"
                            onChange={(e) => handleQuickSearch(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FilterListIcon />
                        Фильтры
                        {Object.values(filters).some(value => value !== '') && (
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
                                <label>Ответственный</label>
                                <input
                                    type="text"
                                    value={filters.assignedUser}
                                    onChange={(e) => handleFilterChange('assignedUser', e.target.value)}
                                    placeholder="Введите ответственного"
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

                            <div className="filter-group date-filter">
                                <label>Дата создания с</label>
                                <input
                                    type="date"
                                    value={filters.createdAtFrom}
                                    onChange={(e) => handleFilterChange('createdAtFrom', e.target.value)}
                                />
                            </div>

                            <div className="filter-group date-filter">
                                <label>по</label>
                                <input
                                    type="date"
                                    value={filters.createdAtTo}
                                    onChange={(e) => handleFilterChange('createdAtTo', e.target.value)}
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
            {Object.values(filters).some(value => value !== '') && (
                <div className="active-filters-info">
                    <span>Применены фильтры: </span>
                    {filters.number && <span className="filter-tag">Номер: {filters.number}</span>}
                    {filters.applicant && <span className="filter-tag">Заявитель: {filters.applicant}</span>}
                    {filters.mark && <span className="filter-tag">Марка: {filters.mark}</span>}
                    {filters.status && <span className="filter-tag">Статус: {statusOptions.find(s => s.value === filters.status)?.label}</span>}
                    {filters.paymentStatus && <span className="filter-tag">Оплата: {paymentStatusOptions.find(p => p.value === filters.paymentStatus)?.label}</span>}
                    {(filters.createdAtFrom || filters.createdAtTo) && (
                        <span className="filter-tag">
                            Дата: {filters.createdAtFrom || '...'} - {filters.createdAtTo || '...'}
                        </span>
                    )}
                </div>
            )}

            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="tasks-list">
                    {tasks.length === 0 ? (
                        <div className="no-tasks-message">
                            {Object.values(filters).some(value => value !== '') 
                                ? 'Задачи по заданным фильтрам не найдены' 
                                : 'Задачи не найдены'
                            }
                        </div>
                    ) : (
                        tasks.map(task => (
                            <div
                                key={task.id}
                                className="task-card"
                                onClick={() => navigate(`/tasks/${task.id}`)}
                            >
                                {/* Верхняя строка с номером и статусом */}
                                <div className="task-card-header">
                                    <div className="status-container">
                                        <div className={`registration-status ${task.number ? 'registered' : 'unregistered'}`}>
                                            {task.number || 'Не зарегистрирована'}
                                        </div>
                                    </div>
                                    
                                    {/* Статус заявки в правом верхнем углу */}
                                    <div className="task-status-section">
                                        <span className={`status-badge ${task.status?.toLowerCase()}`}>
                                            {statusLabels[task.status] || task.status}
                                        </span>
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

                                <div className="applicant-expert-container">
                                    <div className={`info-row ${!task.assignedUser ? 'not-assigned' : ''}`}>
                                        <span className="info-label">Эксперт:</span>
                                        <span className="info-value">
                                            {task.assignedUser
                                                ? `${task.assignedUser.secondName} ${task.assignedUser.firstName[0]}.${task.assignedUser.patronymic?.[0] || ''}`
                                                : 'не назначен'}
                                        </span>
                                    </div>
                                    
                                    {/* Статус оплаты перенесен сюда */}
                                    <div className="info-row">
                                        <span className="info-label">Оплата:</span>
                                        <span className={`payment-status ${task.paymentStatus ? 'paid' : 'unpaid'}`}>
                                            {task.paymentStatus ? 'Оплачено' : 'Ожидает оплаты'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskListPage;