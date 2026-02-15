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
    CERTIFICATE_REGISTERED: 'Сертификат зарегистрирован'
};

const CertificatesPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quickSearch, setQuickSearch] = useState('');

    const navItems = [
        { path: '/tasks', label: 'ОТТС / ОТШ' },
        { path: '/decl', label: 'Декларации' },
        { path: '/serts', label: 'Сертификаты' }
    ];

    useEffect(() => {
        const fetchCertificates = async () => {
            setLoading(true);
            try {
                const response = await api.get('/certificates');
                setCertificates(Array.isArray(response.data) ? response.data : []);
                setError(null);
            } catch (e) {
                setError('Ошибка загрузки сертификатов');
                setCertificates([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, []);

    const filteredCertificates = useMemo(() => {
        const search = quickSearch.trim().toLowerCase();
        if (!search) return certificates;
        return certificates.filter((certificate) => (
            certificate.number?.toLowerCase().includes(search)
            || certificate.certificateNumber?.toLowerCase().includes(search)
            || certificate.applicant?.toLowerCase().includes(search)
            || certificate.manufacturer?.toLowerCase().includes(search)
            || certificate.typeName?.toLowerCase().includes(search)
            || certificate.mark?.toLowerCase().includes(search)
        ));
    }, [certificates, quickSearch]);

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
                <h2 className="page-title">Раздел Сертификатов</h2>
                <Link to="/serts/create" className="create-task-button">
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
                <div className="results-count">Найдено заявок: {filteredCertificates.length}</div>
            </div>

            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="tasks-list">
                    {filteredCertificates.length === 0 ? (
                        <div className="no-tasks-message">Сертификаты не найдены</div>
                    ) : (
                        filteredCertificates.map((certificate) => (
                            <div
                                key={certificate.id}
                                className="task-card"
                                onClick={() => navigate(`/serts/${certificate.id}`)}
                            >
                                <div className="task-card-header">
                                    <div className="task-top-line">
                                        <div className="task-top-col task-top-col-number">
                                            <div className={`registration-status ${certificate.number ? 'registered' : 'unregistered'}`}>
                                                {certificate.number ? (
                                                    <span className="task-top-value">
                                                        {certificate.applicationDate
                                                            ? `${certificate.number} от ${new Date(certificate.applicationDate).toLocaleDateString('ru-RU')}`
                                                            : certificate.number}
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
                                                    {certificate.assignedUser
                                                        ? `${certificate.assignedUser.secondName} ${certificate.assignedUser.firstName[0]}.${certificate.assignedUser.patronymic?.[0] || ''}`
                                                        : <span className="task-top-value-missing">не назначен</span>}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="task-top-col task-top-col-status">
                                            <span className={`status-badge ${certificate.status?.toLowerCase()}`}>
                                                {statusLabels[certificate.status] || certificate.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-grid">
                                    <div className="grid-item">
                                        <div className="grid-label">Категория ТС</div>
                                        <div className="grid-value">{certificate.categories?.join(', ') || 'Не указана'}</div>
                                    </div>
                                    <div className="grid-item">
                                        <div className="grid-label">Марка</div>
                                        <div className="grid-value">{certificate.mark || 'Не указана'}</div>
                                    </div>
                                    <div className="grid-item">
                                        <div className="grid-label">Тип</div>
                                        <div className="grid-value">{certificate.typeName}</div>
                                    </div>
                                    <div className="grid-item">
                                        <div className="grid-label">Заявитель</div>
                                        <div className="grid-value">{certificate.applicant}</div>
                                    </div>
                                </div>

                                <div className="expert-contract-section">
                                    <div className="contract-row">
                                        <span className="info-label">Номер сертификата: </span>
                                        <span className="info-value">
                                            {certificate.certificateNumber || <span className="task-top-value-missing">не присвоен</span>}
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

export default CertificatesPage;
