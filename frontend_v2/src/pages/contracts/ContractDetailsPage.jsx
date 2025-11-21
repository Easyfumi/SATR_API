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
import LinkIcon from '@mui/icons-material/Link';
import UnlinkIcon from '@mui/icons-material/LinkOff';
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
    Button as MuiButton
} from '@mui/material';

const ContractDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [creatorInfo, setCreatorInfo] = useState(null);
    
    // Состояния для inline-редактирования
    const [editingComments, setEditingComments] = useState(false);
    const [editingPaymentStatus, setEditingPaymentStatus] = useState(false);
    const [tempComments, setTempComments] = useState('');
    const [tempPaymentStatus, setTempPaymentStatus] = useState('');
    const [saving, setSaving] = useState(false);

    // Состояния для связывания задач
    const [linkTaskDialog, setLinkTaskDialog] = useState(false);
    const [availableTasks, setAvailableTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [linkComment, setLinkComment] = useState('');

    // Статусы оплаты
    const paymentStatusOptions = [
        { value: 'NOTPAIDFOR', label: 'Не оплачен' },
        { value: 'PARTIALLYPAIDFOR', label: 'Оплачен частично' },
        { value: 'PAIDFOR', label: 'Оплачен' }
    ];

    useEffect(() => {
        fetchContractWithTasks();
    }, [id]);

    // Функция для загрузки договора с задачами
    const fetchContractWithTasks = async () => {
        try {
            setLoading(true);
            // Загружаем основную информацию о договоре
            const contractResponse = await api.get(`/api/contracts/${id}`);
            setContract(contractResponse.data);
            
            // Загружаем связанные задачи через новый endpoint
            const tasksResponse = await api.get(`/api/task-contract-links/contract/${id}/tasks`);
            // Обновляем договор с информацией о задачах
            setContract(prev => ({
                ...prev,
                taskLinks: tasksResponse.data
            }));
            
            setError(null);
            
            // Если есть createdBy, загружаем информацию о создателе
            if (contractResponse.data.createdBy) {
                fetchCreatorInfo(contractResponse.data.createdBy);
            }
        } catch (error) {
            console.error('Error fetching contract:', error);
            setError('Ошибка загрузки данных договора');
        } finally {
            setLoading(false);
        }
    };

    // Функция для загрузки информации о создателе договора
    const fetchCreatorInfo = async (userId) => {
        try {
            const response = await api.get(`/api/users/${userId}`);
            setCreatorInfo(response.data);
        } catch (error) {
            console.error('Error fetching creator info:', error);
            setCreatorInfo({ id: userId });
        }
    };

    // Функция для загрузки доступных задач (без контракта)
    const fetchAvailableTasks = async () => {
        try {
            // Используем новый endpoint для получения задач без контрактов
            const response = await api.get('/api/tasks/without-contracts');
            setAvailableTasks(response.data);
        } catch (error) {
            console.error('Error fetching available tasks:', error);
            alert('Ошибка загрузки доступных задач: ' + (error.response?.data?.message || error.message));
        }
    };

    // Функция для открытия диалога связывания
    const openLinkTaskDialog = () => {
        setLinkTaskDialog(true);
        setSelectedTaskId('');
        setLinkComment('');
        fetchAvailableTasks();
    };

    // Функция для связывания задачи с договором
    const handleLinkTask = async () => {
        if (!selectedTaskId) {
            alert('Выберите задачу для связывания');
            return;
        }

        try {
            // Используем новый endpoint для связывания
            await api.post('/api/task-contract-links/link', {
                taskId: selectedTaskId,
                contractId: id,
                comment: linkComment
            });
            
            // Обновляем данные
            await fetchContractWithTasks();
            setLinkTaskDialog(false);
            setSelectedTaskId('');
            setLinkComment('');
            alert('Задача успешно связана с договором');
        } catch (error) {
            console.error('Error linking task:', error);
            alert('Ошибка при связывании задачи: ' + (error.response?.data?.message || error.message));
        }
    };

    // Функция для отвязывания задачи от договора
    const handleUnlinkTask = async (taskId) => {
        if (!window.confirm('Вы уверены, что хотите отвязать задачу от договора?')) {
            return;
        }

        try {
            // Используем новый endpoint для отвязывания
            await api.delete(`/api/task-contract-links/unlink/task/${taskId}/contract/${id}`);
            
            // Обновляем данные
            await fetchContractWithTasks();
            alert('Задача успешно отвязана от договора');
        } catch (error) {
            console.error('Error unlinking task:', error);
            alert('Ошибка при отвязке задачи: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCreateTask = () => {
        navigate('/tasks/create', { 
            state: { contractId: id, contractNumber: contract.number }
        });
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

    // Функция для форматирования имени пользователя
    const formatUserName = (user) => {
        if (!user) return 'Неизвестный пользователь';
        if (user.firstName && user.secondName) {
            return `${user.secondName} ${user.firstName}${user.patronymic ? ' ' + user.patronymic : ''}`;
        }
        return user.username || `Пользователь #${user.id}`;
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
                        <button
                            onClick={openLinkTaskDialog}
                            className="link-task-button"
                        >
                            <LinkIcon />
                            Привязать задачу
                        </button>
                        <button
                            onClick={handleCreateTask}
                            className="create-task-button"
                        >
                            <TaskIcon />
                            Создать задачу
                        </button>
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
                                            renderValue={(selected) => (
                                                <div className="selected-process">
                                                    {selected ? paymentStatusOptions.find(opt => opt.value === selected)?.label 
                                                             : <span className="placeholder-text">Выберите статус оплаты</span>}
                                                </div>
                                            )}
                                        >
                                            {paymentStatusOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value} style={{ whiteSpace: 'normal' }}>
                                                    <div className="process-option">
                                                        <Checkbox
                                                            checked={tempPaymentStatus === option.value}
                                                            style={{ padding: '0 10px 0 0', flexShrink: 0 }}
                                                        />
                                                        <span>{option.label}</span>
                                                    </div>
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
                                            <SaveIcon />
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
                                        {contract.applicant ? contract.applicant.name : 'Не указан'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Связанные задачи */}
                        <div className="detail-section">
                            <div className="section-header">
                                <h3>Связанные задачи</h3>
                                <div className="task-actions">
                                    <button 
                                        className="link-task-button"
                                        onClick={openLinkTaskDialog}
                                    >
                                        <LinkIcon />
                                        Привязать задачу
                                    </button>
                                    <button 
                                        className="create-task-button"
                                        onClick={handleCreateTask}
                                    >
                                        <TaskIcon />
                                        Создать задачу
                                    </button>
                                </div>
                            </div>
                            
                            {contract.taskLinks && contract.taskLinks.length > 0 ? (
                                <div className="tasks-list">
                                    {contract.taskLinks.map((link) => (
                                        <div 
                                            key={link.id}
                                            className="task-item"
                                        >
                                            <div className="task-header">
                                                <div 
                                                    className="task-main-info clickable"
                                                    onClick={() => handleTaskClick(link.taskId)}
                                                >
                                                    <span className="task-number">
                                                        Задача #{link.taskNumber || link.taskId}
                                                    </span>
                                                    <span className={`task-status ${link.taskStatus?.toLowerCase()}`}>
                                                        {link.taskStatus || 'Не указан'}
                                                    </span>
                                                </div>
                                                <button
                                                    className="unlink-task-button"
                                                    onClick={() => handleUnlinkTask(link.taskId)}
                                                    title="Отвязать задачу"
                                                >
                                                    <UnlinkIcon />
                                                </button>
                                            </div>
                                            <div 
                                                className="task-details clickable"
                                                onClick={() => handleTaskClick(link.taskId)}
                                            >
                                                <div className="task-detail">
                                                    <span className="task-label">Марка ТС:</span>
                                                    <span className="task-value">{link.mark || 'Не указана'}</span>
                                                </div>
                                                <div className="task-detail">
                                                    <span className="task-label">Тип ТС:</span>
                                                    <span className="task-value">{link.typeName || 'Не указан'}</span>
                                                </div>
                                                {link.linkComment && (
                                                    <div className="task-detail">
                                                        <span className="task-label">Комментарий связи:</span>
                                                        <span className="task-value">{link.linkComment}</span>
                                                    </div>
                                                )}
                                                {link.linkedAt && (
                                                    <div className="task-detail">
                                                        <span className="task-label">Дата привязки:</span>
                                                        <span className="task-value">
                                                            {formatDateTime(link.linkedAt)}
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
                                    <div className="no-tasks-actions">
                                        <button 
                                            className="create-task-button primary"
                                            onClick={handleCreateTask}
                                        >
                                            <TaskIcon />
                                            Создать первую задачу
                                        </button>
                                        <button 
                                            className="link-task-button secondary"
                                            onClick={openLinkTaskDialog}
                                        >
                                            <LinkIcon />
                                            Привязать существующую задачу
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Комментарии */}
                        <div className="detail-section">
                            <div className="section-header">
                                <h3>Комментарий</h3>
                                {!editingComments && (
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
                                            <SaveIcon />
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
                                            {creatorInfo ? formatUserName(creatorInfo) : `Пользователь #${contract.createdBy}`}
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

            {/* Диалог для связывания задачи */}
            <Dialog 
                open={linkTaskDialog} 
                onClose={() => setLinkTaskDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Привязать существующую задачу
                </DialogTitle>
                <DialogContent>
                    <div className="dialog-body">
                        <FormControl fullWidth margin="normal">
                            <label>Выберите задачу:</label>
                            <select 
                                value={selectedTaskId} 
                                onChange={(e) => setSelectedTaskId(e.target.value)}
                                className="task-select"
                            >
                                <option value="">Выберите задачу...</option>
                                {availableTasks.map(task => (
                                    <option key={task.id} value={task.id}>
                                        {task.number} - {task.mark} - {task.typeName}
                                    </option>
                                ))}
                            </select>
                        </FormControl>
                        
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Комментарий связи (необязательно)"
                            value={linkComment}
                            onChange={(e) => setLinkComment(e.target.value)}
                            multiline
                            rows={2}
                        />
                        
                        {availableTasks.length === 0 && (
                            <p className="no-tasks-available">
                                Нет доступных задач для привязки. Все задачи уже привязаны к договорам.
                            </p>
                        )}
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton 
                        onClick={() => setLinkTaskDialog(false)}
                    >
                        Отмена
                    </MuiButton>
                    <MuiButton 
                        onClick={handleLinkTask}
                        variant="contained"
                        disabled={!selectedTaskId}
                    >
                        Привязать
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ContractDetailsPage;