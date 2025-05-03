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
                            <div className="approval-info-container">
                                <div className={`registration-status ${task.number ? 'registered' : 'unregistered'}`}>
                                    {task.number || 'Не зарегистрирована'}
                                </div>
                                <div className={`expert-info ${!task.assignedUser ? 'not-assigned' : ''}`}>
                                    Эксперт: {task.assignedUser
                                        ? `${task.assignedUser.secondName} ${task.assignedUser.firstName[0]}.${task.assignedUser.patronymic?.[0] || ''}`
                                        : 'не назначен'}
                                </div>
                            </div>

                            <div className="approval-type">{task.docType}</div>

                    
                            <div className={`payment-status ${task.paymentStatus ? 'paid' : 'unpaid'}`}>
                                {task.paymentStatus ? 'Оплачено' : 'Ожидает оплаты'}
                            </div>

                            <div className="card-content">
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
                                        {task.categories.map(cat => (
                                            <span key={cat} className="category-tag">{cat}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="task-row applicant-info">
                                    <span className="task-label">Заявитель</span>
                                    <span className="task-value">{task.applicant}</span>
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