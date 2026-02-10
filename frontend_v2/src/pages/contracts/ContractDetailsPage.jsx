import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { canViewTasksAndContracts } from '../../utils/roleUtils';
import AccessDenied from '../../components/AccessDenied';
import './ContractDetailsPage.css';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import {
    MenuItem,
    Menu,
    Button,
    CircularProgress,
    Chip,
    IconButton,
    Alert
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const ContractDetailsPage = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    
    // Состояния для inline-редактирования
    const [editingComments, setEditingComments] = useState(false);
    const [tempComments, setTempComments] = useState('');
    const [saving, setSaving] = useState(false);

    // Состояния для управления статусом оплаты
    const [paymentStatusAnchorEl, setPaymentStatusAnchorEl] = useState(null);
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(null);
    const [isPaymentStatusChanged, setIsPaymentStatusChanged] = useState(false);
    const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);

    // Статусы оплаты
    const paymentStatusOptions = [
        { value: 'NOTPAIDFOR', label: 'Не оплачен' },
        { value: 'PARTIALLYPAIDFOR', label: 'Оплачен частично' },
        { value: 'PAIDFOR', label: 'Оплачен' }
    ];

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

    useEffect(() => {
        fetchContract();
        fetchContractTasks();
    }, [id]);

    // Устанавливаем выбранный статус оплаты при загрузке договора
    useEffect(() => {
        if (contract) {
            setSelectedPaymentStatus(contract.paymentStatus);
        }
    }, [contract]);

    // Функция для загрузки информации о договоре
    const fetchContract = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/contracts/${id}`);
            setContract(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching contract:', error);
            setError('Ошибка загрузки данных договора');
        } finally {
            setLoading(false);
        }
    };

    // Функция для загрузки задач договора
    const fetchContractTasks = async () => {
        try {
            setLoadingTasks(true);
            const response = await api.get(`/contracts/${id}/tasks`);
            setTasks(response.data || []);
        } catch (error) {
            console.error('Error fetching contract tasks:', error);
            setTasks([]);
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить этот договор? Это действие нельзя отменить.')) {
            try {
                await api.delete(`/contracts/${id}`);
                navigate('/contracts');
            } catch (error) {
                console.error('Error deleting contract:', error);
                alert('Ошибка при удалении договора: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleTaskClick = (taskId) => {
        navigate(`/tasks/${taskId}`);
    };

    // Функции для комментариев
    const startEditingComments = () => {
        setTempComments(contract.comments || '');
        setEditingComments(true);
    };

    const cancelEditingComments = () => {
        setEditingComments(false);
        setTempComments('');
    };

    const saveComments = async () => {
        setSaving(true);
        try {
            const response = await api.patch(`/contracts/${id}/comments`, {
                comments: tempComments
            });
            setContract(response.data);
            setEditingComments(false);
        } catch (error) {
            console.error('Error updating comments:', error);
            alert('Ошибка при обновлении комментария: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    // Функции для статуса оплаты
    const handlePaymentStatusButtonClick = (event) => {
        setPaymentStatusAnchorEl(event.currentTarget);
    };

    const handlePaymentStatusMenuClose = () => {
        setPaymentStatusAnchorEl(null);
    };

    const handlePaymentStatusSelect = (status) => {
        setSelectedPaymentStatus(status);
        setIsPaymentStatusChanged(true);
        handlePaymentStatusMenuClose();
    };

    const handleSavePaymentStatus = async () => {
        if (!selectedPaymentStatus || !isPaymentStatusChanged) return;

        setIsUpdatingPaymentStatus(true);
        try {
            await api.patch(`/contracts/${id}/payment-status`, {
                paymentStatus: selectedPaymentStatus
            });
            // Обновляем данные договора для получения актуального статуса
            await fetchContract();
            setIsPaymentStatusChanged(false);
            setAlertMessage({
                type: 'success',
                text: 'Статус оплаты успешно обновлен'
            });
            setTimeout(() => setAlertMessage(null), 3000);
        } catch (error) {
            console.error('Ошибка обновления статуса оплаты:', error);
            setAlertMessage({
                type: 'error',
                text: error.response?.data?.message || 'Произошла ошибка'
            });
        } finally {
            setIsUpdatingPaymentStatus(false);
        }
    };

    const handleCancelPaymentStatusChange = () => {
        setSelectedPaymentStatus(contract.paymentStatus);
        setIsPaymentStatusChanged(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Не указана';
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'Не указано';
        return new Date(dateTimeString).toLocaleString('ru-RU');
    };

    const getPaymentStatusLabel = (status) => {
        const statusLabels = {
            'PAIDFOR': 'Оплачен',
            'PARTIALLYPAIDFOR': 'Оплачен частично',
            'NOTPAIDFOR': 'Не оплачен'
        };
        return statusLabels[status] || status;
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PAIDFOR': return 'paid';
            case 'PARTIALLYPAIDFOR': return 'partially-paid';
            case 'NOTPAIDFOR': return 'not-paid';
            default: return '';
        }
    };

    const getTaskStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'error';
            case 'REJECTION': return 'warning';
            default: return 'default';
        }
    };

    // Проверка доступа (после всех хуков)
    if (!canViewTasksAndContracts(user)) {
        return <AccessDenied message="У вас нет доступа для просмотра договоров. Доступ имеют только авторизованные пользователи с назначенными ролями." />;
    }

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!contract) return <div className="error-message">Договор не найден</div>;

    return (
        <div className="content-container">
            {alertMessage && (
                <Alert
                    severity={alertMessage.type}
                    onClose={() => setAlertMessage(null)}
                    className="task-alert"
                >
                    {alertMessage.text}
                </Alert>
            )}

            <div>
                <Link to="/contracts" className="back-button">
                    <ArrowBackIcon />
                    К списку договоров
                </Link>
            </div>

            <div className="task-details-card">
                <div className="card-content">
                    <div className="column left-column">
                        <div className="task-row">
                            <span className="task-label">Статус оплаты</span>
                            <div className="status-container">
                                <div className="status-display">
                                    <span className={`payment-status-badge ${getStatusBadgeClass(contract.paymentStatus)}`}>
                                        {getPaymentStatusLabel(selectedPaymentStatus || contract.paymentStatus)}
                                    </span>
                                    <Button
                                        className="status-dropdown-button"
                                        onClick={handlePaymentStatusButtonClick}
                                        size="small"
                                    >
                                        <ArrowDropDownIcon />
                                    </Button>
                                </div>

                                {isPaymentStatusChanged && (
                                    <div className="status-actions">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={handleSavePaymentStatus}
                                            disabled={isUpdatingPaymentStatus}
                                            className="save-status-button"
                                        >
                                            {isUpdatingPaymentStatus ? <CircularProgress size={20} /> : 'Сохранить'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={handleCancelPaymentStatusChange}
                                            disabled={isUpdatingPaymentStatus}
                                        >
                                            Отмена
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="task-row">
                            <span className="task-label">Номер договора</span>
                            <span className="task-value">{contract.number}</span>
                        </div>

                        <div className="task-row">
                            <span className="task-label">Дата договора</span>
                            <span className="task-value">{formatDate(contract.date)}</span>
                        </div>
                    </div>

                    <div className="vertical-divider"></div>

                    <div className="column right-column">
                        <div className="task-row">
                            <span className="task-label">Заявитель</span>
                            <span className="task-value">{contract.applicantName || 'Не указан'}</span>
                        </div>

                        <div className="task-row">
                            <span className="task-label">Комментарий</span>
                            <div className="task-value comments-block">
                                {editingComments ? (
                                    <div className="comments-edit-container">
                                        <textarea
                                            value={tempComments}
                                            onChange={(e) => setTempComments(e.target.value)}
                                            className="comments-edit-textarea"
                                            placeholder="Введите комментарий..."
                                            rows={4}
                                        />
                                        <div className="inline-edit-actions">
                                            <button
                                                onClick={saveComments}
                                                className="save-inline-btn"
                                                disabled={saving}
                                            >
                                                {saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                                {saving ? 'Сохранение...' : 'Сохранить'}
                                            </button>
                                            <button
                                                onClick={cancelEditingComments}
                                                className="cancel-inline-btn"
                                                disabled={saving}
                                            >
                                                <CancelIcon />
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="comments-content">
                                        <p>{contract.comments || 'Комментарий отсутствует'}</p>
                                        {!contract.comments && (
                                            <button
                                                className="add-comments-btn"
                                                onClick={startEditingComments}
                                            >
                                                <EditIcon />
                                                Добавить комментарий
                                            </button>
                                        )}
                                        {!editingComments && contract.comments && (
                                            <button
                                                className="edit-comments-btn"
                                                onClick={startEditingComments}
                                            >
                                                <EditIcon />
                                                Редактировать
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="task-details-card">
                {loadingTasks ? (
                    <div className="loading-tasks">
                        <CircularProgress size={24} />
                        <span>Загрузка задач...</span>
                    </div>
                ) : tasks.length > 0 ? (
                    <div className="tasks-list compact-tasks-list">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="task-item compact-task-item"
                            >
                                <div className="task-header">
                                    <div
                                        className="task-main-info clickable"
                                        onClick={() => handleTaskClick(task.id)}
                                    >
                                        <span className="task-number">
                                            <span className="task-text-label">Номер заявки:</span>
                                            <span className="task-text-value">
                                                {task.number
                                                    ? `${task.number}${task.applicationDate ? ` от ${formatDate(task.applicationDate)}` : ''}`
                                                    : '—'}
                                            </span>
                                        </span>
                                        <span className={`status-badge ${task.status?.toLowerCase()}`}>
                                            {taskStatusLabels[task.status] || task.status}
                                        </span>
                                    </div>
                                    <div className="task-assignee task-number">
                                        <span className="task-text-label">Исполнитель:</span>
                                        <span className="task-text-value">
                                            {task.assignedUserName || 'Не назначен'}
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className="task-details-grid clickable"
                                    onClick={() => handleTaskClick(task.id)}
                                >
                                    <div className="task-detail">
                                        <span className="task-label">Заявитель</span>
                                        <span className="task-value">{task.applicantName || 'Не указан'}</span>
                                    </div>
                                    <div className="task-detail">
                                        <span className="task-label">Тип</span>
                                        <span className="task-value">{task.typeName || 'Не указан'}</span>
                                    </div>
                                    <div className="task-detail">
                                        <span className="task-label">Тип одобрения</span>
                                        <span className="task-value">{task.docType || 'Не указан'}</span>
                                    </div>
                                    <div className="task-detail">
                                        <span className="task-label">Тип процедуры</span>
                                        <span className="task-value">
                                            {task.previousProcessType || task.processType || 'Не указана'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-tasks-message">
                        <p>Нет связанных задач</p>
                    </div>
                )}
            </div>

            <div className="task-details-card">
                {contract.createdAt && (
                    <div className="task-row">
                        <span className="task-label">Дата создания</span>
                        <span className="task-value">
                            {formatDateTime(contract.createdAt)}
                        </span>
                    </div>
                )}
                {(contract.createdByName || contract.createdBy) && (
                    <div className="task-row">
                        <span className="task-label">Заявка создана</span>
                        <span className="task-value">
                            {contract.createdByName || `Пользователь #${contract.createdBy}`}
                        </span>
                    </div>
                )}
            </div>

            <div className="task-actions-footer">
                <Link to={`/contracts/edit/${contract.id}`} className="edit-button">
                    <EditIcon />
                    Редактировать
                </Link>
            </div>

            {/* Меню выбора статуса оплаты */}
            <Menu
                anchorEl={paymentStatusAnchorEl}
                open={Boolean(paymentStatusAnchorEl)}
                onClose={handlePaymentStatusMenuClose}
                className="status-menu"
            >
                {paymentStatusOptions.map((option) => (
                    <MenuItem
                        key={option.value}
                        onClick={() => handlePaymentStatusSelect(option.value)}
                        selected={selectedPaymentStatus === option.value}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};

export default ContractDetailsPage;