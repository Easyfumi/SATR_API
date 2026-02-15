import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { canViewTasksAndContracts } from '../../utils/roleUtils';
import AccessDenied from '../../components/AccessDenied';
import '../tasks/TaskListPage.css';

const statusLabels = {
    RECEIVED: 'Заявка получена',
    JOURNAL_REGISTERED: 'Заявка зарегистрирована в журнале',
    FGIS_ENTERED: 'Заявка занесена во ФГИС',
    DECLARATION_REGISTERED: 'Декларация зарегистрирована'
};

const DeclarationPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [declarations, setDeclarations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quickSearch, setQuickSearch] = useState('');

    const navItems = [
        { path: '/tasks', label: 'ОТТС / ОТШ' },
        { path: '/decl', label: 'Декларации' },
        { path: '/serts', label: 'Сертификаты' }
    ];

    const fetchDeclarations = async () => {
        setLoading(true);
        try {
            const response = await api.get('/declarations');
            setDeclarations(Array.isArray(response.data) ? response.data : []);
            setError(null);
        } catch (e) {
            setError('Ошибка загрузки деклараций');
            setDeclarations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeclarations();
    }, []);

    const filteredDeclarations = useMemo(() => {
        const search = quickSearch.trim().toLowerCase();
        if (!search) {
            return declarations;
        }
        return declarations.filter((declaration) => (
            declaration.number?.toLowerCase().includes(search)
            || declaration.declarationNumber?.toLowerCase().includes(search)
            || declaration.applicant?.toLowerCase().includes(search)
            || declaration.manufacturer?.toLowerCase().includes(search)
            || declaration.typeName?.toLowerCase().includes(search)
            || declaration.mark?.toLowerCase().includes(search)
        ));
    }, [declarations, quickSearch]);

    if (!canViewTasksAndContracts(user)) {
        return <AccessDenied message="У вас нет доступа для просмотра заявок. Доступ имеют только авторизованные пользователи с назначенными ролями." />;
    }

    return (
        <div className="content-container">
            <div className="tasks-header">
                <div className="nav-buttons-container">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-button ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
                <h2 className="page-title">Раздел Деклараций</h2>
                <Link to="/decl/create" className="create-task-button">
                    <LibraryAddIcon className="create-task-icon" />
                    <h1 className="create-task-text">Новая заявка</h1>
                </Link>
            </div>

            <div className="search-filters-panel">
                <div className="quick-search-section">
                    <div className="search-input-container">
                        <SearchIcon className="search-icon" />
                        <input
                            type="text"
                            placeholder="Поиск по номеру, заявителю, типу..."
                            className="search-input"
                            value={quickSearch}
                            onChange={(e) => setQuickSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="results-info-panel">
                <div className="results-count">Найдено заявок: {filteredDeclarations.length}</div>
            </div>

            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="tasks-list">
                    {filteredDeclarations.length === 0 ? (
                        <div className="no-tasks-message">Декларации не найдены</div>
                    ) : (
                        filteredDeclarations.map((declaration) => (
                            <div
                                key={declaration.id}
                                className="task-card"
                                onClick={() => navigate(`/decl/${declaration.id}`)}
                            >
                                <div className="task-card-header">
                                    <div className="task-top-line">
                                        <div className="task-top-col task-top-col-number">
                                            <div className={`registration-status ${declaration.number ? 'registered' : 'unregistered'}`}>
                                                {declaration.number ? (
                                                    <span className="task-top-value">
                                                        {declaration.applicationDate
                                                            ? `${declaration.number} от ${new Date(declaration.applicationDate).toLocaleDateString('ru-RU')}`
                                                            : declaration.number}
                                                    </span>
                                                ) : (
                                                    <span className="task-top-value-missing">не зарегистрирована</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="task-top-col task-top-col-assignee">
                                            <div className="task-list-assignee">
                                                Исполнитель:{' '}
                                                <span className="task-top-value">
                                                    {declaration.assignedUser
                                                        ? `${declaration.assignedUser.secondName} ${declaration.assignedUser.firstName[0]}.${declaration.assignedUser.patronymic?.[0] || ''}`
                                                        : <span className="task-top-value-missing">не назначен</span>}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="task-top-col task-top-col-status">
                                            <span className={`status-badge ${declaration.status?.toLowerCase()}`}>
                                                {statusLabels[declaration.status] || declaration.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-grid">
                                    <div className="grid-item">
                                        <div className="grid-label">Категория ТС</div>
                                        <div className="grid-value">{declaration.categories?.join(', ') || 'Не указана'}</div>
                                    </div>
                                    <div className="grid-item">
                                        <div className="grid-label">Марка</div>
                                        <div className="grid-value">{declaration.mark || 'Не указана'}</div>
                                    </div>
                                    <div className="grid-item">
                                        <div className="grid-label">Тип</div>
                                        <div className="grid-value">{declaration.typeName}</div>
                                    </div>
                                    <div className="grid-item">
                                        <div className="grid-label">Заявитель</div>
                                        <div className="grid-value">{declaration.applicant}</div>
                                    </div>
                                </div>

                                <div className="expert-contract-section">
                                    <div className="contract-row">
                                        <span className="info-label">Номер декларации: </span>
                                        <span className="info-value">
                                            {declaration.declarationNumber || <span className="task-top-value-missing">не присвоен</span>}
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

export default DeclarationPage;