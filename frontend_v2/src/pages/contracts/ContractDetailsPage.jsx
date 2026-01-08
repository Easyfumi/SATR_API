import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './ContractDetailsPage.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import TaskIcon from '@mui/icons-material/Assignment';
import {
    FormControl,
    Select,
    MenuItem,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button as MuiButton,
    CircularProgress,
    Chip,
    IconButton,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const ContractDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    
    // Состояния для inline-редактирования
    const [editingComments, setEditingComments] = useState(false);
    const [editingPaymentStatus, setEditingPaymentStatus] = useState(false);
    const [tempComments, setTempComments] = useState('');
    const [tempPaymentStatus, setTempPaymentStatus] = useState('');
    const [saving, setSaving] = useState(false);

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

    // Функция для загрузки информации о договоре
    const fetchContract = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/contracts/${id}`);
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
            const response = await api.get(`/api/contracts/${id}/tasks`);
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
                await api.delete(`/api/contracts/${id}`);
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
            const response = await api.patch(`/api/contracts/${id}/comments`, {
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
    const startEditingPaymentStatus = () => {
        setTempPaymentStatus(contract.paymentStatus);
        setEditingPaymentStatus(true);
    };

    const cancelEditingPaymentStatus = () => {
        setEditingPaymentStatus(false);
        setTempPaymentStatus('');
    };

    const savePaymentStatus = async () => {
        setSaving(true);
        try {
            const response = await api.patch(`/api/contracts/${id}/payment-status`, {
                paymentStatus: tempPaymentStatus
            });
            setContract(response.data);
            setEditingPaymentStatus(false);
        } catch (error) {
            console.error('Error updating payment status:', error);
            alert('Ошибка при обновлении статуса оплаты: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
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

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!contract) return <div className="error-message">Договор не найден</div>;

    return (
        <div className="content-container">
            <div className="contract-details">
                {/* Хедер с навигацией и действиями */}
                <div className="details-header">
                    <div className="header-navigation">
                        <button 
                            className="back-button"
                            onClick={() => navigate('/contracts')}
                        >
                            <ArrowBackIcon />
                            Назад к списку
                        </button>
                    </div>
                    
                    <div className="header-actions">
                        <Link
                            to={`/contracts/edit/${contract.id}`}
                            className="edit-button"
                        >
                            <EditIcon />
                            Редактировать
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="delete-button"
                        >
                            <DeleteIcon />
                            Удалить
                        </button>
                    </div>
                </div>

                {/* Основная информация */}
                <div className="details-content">
                    <div className="contract-main-info">
                        <h1 className="contract-title">Договор № {contract.number}</h1>
                        
                        <div className="status-badge-container">
                            {editingPaymentStatus ? (
                                <div className="status-edit-container">
                                    <FormControl className="status-select">
                                        <Select
                                            value={tempPaymentStatus}
                                            onChange={(e) => setTempPaymentStatus(e.target.value)}
                                            displayEmpty
                                        >
                                            {paymentStatusOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <div className="inline-edit-actions">
                                        <button 
                                            onClick={savePaymentStatus}
                                            className="save-inline-btn"
                                            disabled={saving}
                                        >
                                            {saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                            {saving ? 'Сохранение...' : 'Сохранить'}
                                        </button>
                                        <button 
                                            onClick={cancelEditingPaymentStatus}
                                            className="cancel-inline-btn"
                                            disabled={saving}
                                        >
                                            <CancelIcon />
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="status-display-container">
                                    <span 
                                        className={`payment-status-badge ${getStatusBadgeClass(contract.paymentStatus)} editable`}
                                        onClick={startEditingPaymentStatus}
                                    >
                                        {getPaymentStatusLabel(contract.paymentStatus)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Детальная информация */}
                    <div className="details-grid">
                        <div className="detail-section">
                            <h3>Основная информация</h3>
                            <div className="detail-items">
                                <div className="detail-item">
                                    <span className="detail-label">Номер договора:</span>
                                    <span className="detail-value">{contract.number}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Дата договора:</span>
                                    <span className="detail-value">{formatDate(contract.date)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Заявитель:</span>
                                    <span className="detail-value">
                                        {contract.applicantName || 'Не указан'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Связанные задачи */}
                        <div className="detail-section">
                            <div className="section-header">
                                <h3>Связанные задачи ({tasks.length})</h3>
                            </div>
                            
                            {loadingTasks ? (
                                <div className="loading-tasks">
                                    <CircularProgress size={24} />
                                    <span>Загрузка задач...</span>
                                </div>
                            ) : tasks.length > 0 ? (
                                <div className="tasks-list">
                                    {tasks.map((task) => (
                                        <div 
                                            key={task.id}
                                            className="task-item"
                                        >
                                            <div className="task-header">
                                                <div 
                                                    className="task-main-info clickable"
                                                    onClick={() => handleTaskClick(task.id)}
                                                >
                                                    <span className="task-number">
                                                        {task.number ? `Задача #${task.number}` : `ID: ${task.id}`}
                                                    </span>
                                                    <Chip
                                                        label={taskStatusLabels[task.status] || task.status}
                                                        size="small"
                                                        color={getTaskStatusColor(task.status)}
                                                        variant="outlined"
                                                    />
                                                </div>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleTaskClick(task.id)}
                                                    title="Перейти к задаче"
                                                >
                                                    <ArrowForwardIcon />
                                                </IconButton>
                                            </div>
                                            <div 
                                                className="task-details clickable"
                                                onClick={() => handleTaskClick(task.id)}
                                            >
                                                <div className="task-detail">
                                                    <span className="task-label">Тип одобрения:</span>
                                                    <span className="task-value">{task.docType || 'Не указан'}</span>
                                                </div>
                                                {task.createdAt && (
                                                    <div className="task-detail">
                                                        <span className="task-label">Дата создания:</span>
                                                        <span className="task-value">
                                                            {formatDateTime(task.createdAt)}
                                                        </span>
                                                    </div>
                                                )}
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

                        {/* Комментарии */}
                        <div className="detail-section">
                            <div className="section-header">
                                <h3>Комментарий</h3>
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
                                </div>
                            )}
                        </div>

                        {/* Мета-информация */}
                        <div className="detail-section">
                            <h3>Системная информация</h3>
                            <div className="detail-items">
                                <div className="detail-item">
                                    <span className="detail-label">ID договора:</span>
                                    <span className="detail-value">{contract.id}</span>
                                </div>
                                {contract.createdBy && (
                                    <div className="detail-item">
                                        <span className="detail-label">Создал:</span>
                                        <span className="detail-value">
                                            Пользователь #{contract.createdBy}
                                        </span>
                                    </div>
                                )}
                                {contract.createdAt && (
                                    <div className="detail-item">
                                        <span className="detail-label">Дата создания:</span>
                                        <span className="detail-value">
                                            {formatDateTime(contract.createdAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractDetailsPage;