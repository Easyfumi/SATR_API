// TaskListPage.jsx

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './TaskListPage.css';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';

const TaskListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        const fetchTasks = async () => {
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

        fetchTasks();
    }, []);

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

            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="tasks-list">
                    {tasks.map(task => (
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
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskListPage;