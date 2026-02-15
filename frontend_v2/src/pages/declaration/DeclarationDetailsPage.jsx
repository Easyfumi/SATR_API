import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Alert,
    Button,
    CircularProgress,
    FormControl,
    Menu,
    MenuItem,
    Select,
    TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { canModifyTasks, canViewTasksAndContracts } from '../../utils/roleUtils';
import AccessDenied from '../../components/AccessDenied';
import '../tasks/TaskDetailsPage.css';

const statusLabels = {
    RECEIVED: 'Заявка получена',
    JOURNAL_REGISTERED: 'Заявка зарегистрирована в журнале',
    FGIS_ENTERED: 'Заявка занесена во ФГИС',
    DECLARATION_REGISTERED: 'Декларация зарегистрирована'
};

const DeclarationDetailsPage = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [declaration, setDeclaration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);

    const [newNumber, setNewNumber] = useState('');
    const [newApplicationDate, setNewApplicationDate] = useState('');
    const [isUpdatingNumber, setIsUpdatingNumber] = useState(false);

    const [statusAnchorEl, setStatusAnchorEl] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isStatusChanged, setIsStatusChanged] = useState(false);
    const [newDeclarationNumber, setNewDeclarationNumber] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [experts, setExperts] = useState([]);
    const [selectedExpertId, setSelectedExpertId] = useState('');
    const [isExpertChanged, setIsExpertChanged] = useState(false);
    const [isUpdatingExpert, setIsUpdatingExpert] = useState(false);

    const fetchDeclaration = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/declarations/${id}`);
            setDeclaration(response.data);
            setSelectedStatus(response.data.status);
            setSelectedExpertId(response.data.assignedUserId || '');
            setIsStatusChanged(false);
            setIsExpertChanged(false);
            setError(null);
        } catch (e) {
            setError('Не удалось загрузить данные декларации');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchExperts = useCallback(async () => {
        const response = await api.get('/users/experts');
        setExperts(response.data);
    }, []);

    useEffect(() => {
        fetchDeclaration();
        fetchExperts();
    }, [fetchDeclaration, fetchExperts]);

    const formatDate = (date) => {
        if (!date) return 'Не указана';
        return new Date(date).toLocaleDateString('ru-RU');
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'Не указана';
        return new Date(dateTime).toLocaleString('ru-RU');
    };

    const formatExpertName = (expert) => {
        if (!expert) return 'Не назначен';
        return expert.patronymic
            ? `${expert.secondName} ${expert.firstName[0]}.${expert.patronymic[0]}.`
            : `${expert.secondName} ${expert.firstName[0]}.`;
    };

    const showAlert = (type, text) => {
        setAlertMessage({ type, text });
        setTimeout(() => setAlertMessage(null), 3000);
    };

    const handleAssignNumber = async () => {
        if (!newNumber || !newApplicationDate) return;
        setIsUpdatingNumber(true);
        try {
            await api.put(`/declarations/${id}/number`, {
                number: newNumber,
                applicationDate: newApplicationDate
            });
            setNewNumber('');
            setNewApplicationDate('');
            await fetchDeclaration();
            showAlert('success', 'Номер заявки успешно присвоен');
        } catch (e) {
            showAlert('error', e.response?.data?.message || 'Ошибка присвоения номера');
        } finally {
            setIsUpdatingNumber(false);
        }
    };

    const handleStatusSelect = (status) => {
        setSelectedStatus(status);
        setIsStatusChanged(true);
        setStatusAnchorEl(null);
    };

    const handleSaveStatus = async () => {
        setIsUpdatingStatus(true);
        try {
            await api.put(`/declarations/${id}/status`, {
                status: selectedStatus,
                declarationNumber: selectedStatus === 'DECLARATION_REGISTERED'
                    ? (newDeclarationNumber || declaration.declarationNumber)
                    : null
            });
            setNewDeclarationNumber('');
            await fetchDeclaration();
            showAlert('success', 'Статус обновлен');
        } catch (e) {
            showAlert('error', e.response?.data?.message || 'Ошибка обновления статуса');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleSaveExpert = async () => {
        setIsUpdatingExpert(true);
        try {
            await api.put(`/declarations/${id}/expert`, {
                assignedUserId: selectedExpertId || null
            });
            await fetchDeclaration();
            showAlert('success', 'Исполнитель обновлен');
        } catch (e) {
            showAlert('error', e.response?.data?.message || 'Ошибка обновления исполнителя');
        } finally {
            setIsUpdatingExpert(false);
        }
    };

    const handleDeleteDeclaration = async () => {
        if (!window.confirm('Удалить заявку? Это действие нельзя отменить.')) {
            return;
        }
        try {
            await api.delete(`/declarations/${id}`);
            navigate('/decl');
        } catch (e) {
            showAlert('error', e.response?.data?.message || 'Ошибка удаления заявки');
        }
    };

    if (!canViewTasksAndContracts(user)) {
        return <AccessDenied message="У вас нет доступа для просмотра заявок. Доступ имеют только авторизованные пользователи с назначенными ролями." />;
    }

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!declaration) return <div className="error-message">Декларация не найдена</div>;

    return (
        <div className="content-container">
            {alertMessage && (
                <Alert severity={alertMessage.type} onClose={() => setAlertMessage(null)} className="task-alert">
                    {alertMessage.text}
                </Alert>
            )}

            <div>
                <Link to="/decl" className="back-button">
                    <ArrowBackIcon />
                    К списку заявок
                </Link>
            </div>

            <div className="task-details-card">
                <div className="card-content">
                    <div className="column left-column">
                        <div className="task-row">
                            <span className="task-label">Статус</span>
                            <div className="status-container">
                                <div className="status-display">
                                    <span className={`status-badge ${declaration.status?.toLowerCase()}`}>
                                        {statusLabels[selectedStatus] || selectedStatus}
                                    </span>
                                    {declaration.status !== 'DECLARATION_REGISTERED' && (
                                        <Button className="status-dropdown-button" size="small" onClick={(e) => setStatusAnchorEl(e.currentTarget)}>
                                            <ArrowDropDownIcon />
                                        </Button>
                                    )}
                                </div>
                                {isStatusChanged && (
                                    <div className="status-actions">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            className="save-status-button"
                                            onClick={handleSaveStatus}
                                            disabled={
                                                isUpdatingStatus
                                                || (selectedStatus === 'DECLARATION_REGISTERED'
                                                    && !(newDeclarationNumber || declaration.declarationNumber))
                                            }
                                        >
                                            {isUpdatingStatus ? <CircularProgress size={20} /> : 'Сохранить'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => {
                                                setSelectedStatus(declaration.status);
                                                setNewDeclarationNumber('');
                                                setIsStatusChanged(false);
                                            }}
                                        >
                                            Отмена
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedStatus === 'DECLARATION_REGISTERED' && !declaration.declarationNumber && (
                            <div className="task-row">
                                <span className="task-label">Номер зарегистрированной декларации</span>
                                <TextField
                                    size="small"
                                    value={newDeclarationNumber}
                                    onChange={(e) => setNewDeclarationNumber(e.target.value)}
                                    placeholder="Введите номер декларации"
                                />
                            </div>
                        )}

                        <div className="task-row">
                            <span className="task-label">Исполнитель</span>
                            <div className="status-container">
                                <FormControl size="small" className="expert-select-control">
                                    <Select value={selectedExpertId} onChange={(e) => {
                                        setSelectedExpertId(e.target.value);
                                        setIsExpertChanged(true);
                                    }}>
                                        <MenuItem value=""><em>Не назначен</em></MenuItem>
                                        {experts.map((expert) => (
                                            <MenuItem key={expert.id} value={expert.id}>{formatExpertName(expert)}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {isExpertChanged && (
                                    <div className="status-actions">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            className="save-status-button"
                                            onClick={handleSaveExpert}
                                            disabled={isUpdatingExpert}
                                        >
                                            {isUpdatingExpert ? <CircularProgress size={20} /> : 'Сохранить'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => {
                                                setSelectedExpertId(declaration.assignedUserId || '');
                                                setIsExpertChanged(false);
                                            }}
                                        >
                                            Отмена
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="task-row">
                            <span className="task-label">Номер заявки</span>
                            {declaration.number ? (
                                <span className="task-value">
                                    {declaration.number} от {formatDate(declaration.applicationDate)}
                                </span>
                            ) : (
                                <div className="input-action-container">
                                    <div className="task-number-date-inputs">
                                        <TextField
                                            size="small"
                                            value={newNumber}
                                            onChange={(e) => setNewNumber(e.target.value)}
                                            placeholder="Введите номер"
                                        />
                                        <span className="task-number-separator">от</span>
                                        <div className="modern-date-field">
                                            <input
                                                type="date"
                                                value={newApplicationDate}
                                                onChange={(e) => setNewApplicationDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="status-actions">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            className="save-status-button"
                                            onClick={handleAssignNumber}
                                            disabled={!newNumber || !newApplicationDate || isUpdatingNumber}
                                        >
                                            {isUpdatingNumber ? <CircularProgress size={20} /> : 'Сохранить'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="task-row">
                            <span className="task-label">Номер декларации</span>
                            <span className="task-value">{declaration.declarationNumber || 'Не указан'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Дата регистрации декларации</span>
                            <span className="task-value">{formatDate(declaration.declarationRegisteredAt)}</span>
                        </div>
                    </div>

                    <div className="vertical-divider"></div>

                    <div className="column right-column">
                        <div className="task-row">
                            <span className="task-label">Категория ТС</span>
                            <span className="task-value">{declaration.categories?.join(', ') || 'Не указана'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Марка</span>
                            <span className="task-value">{declaration.mark || 'Не указана'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Тип</span>
                            <span className="task-value">{declaration.typeName}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Модификации</span>
                            <span className="task-value">{declaration.modifications || 'Не указаны'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Коммерческие наименования</span>
                            <span className="task-value">{declaration.commercialNames || 'Не указаны'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Раздел стандарта</span>
                            <span className="task-value">{declaration.standardSection || 'Не указан'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Заявитель</span>
                            <span className="task-value">{declaration.applicant || 'Не указан'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Изготовитель</span>
                            <span className="task-value">{declaration.manufacturer || 'Не указан'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Представитель</span>
                            <span className="task-value">{declaration.representative || 'Не указан'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="task-details-card">
                <div className="task-row">
                    <span className="task-label">Дата создания</span>
                    <span className="task-value">{formatDateTime(declaration.createdAt)}</span>
                </div>
                <div className="task-row">
                    <span className="task-label">Заявка создана</span>
                    <span className="task-value">{declaration.createdBy || 'Не указано'}</span>
                </div>
            </div>

            {canModifyTasks(user) && (
                <div className="task-actions-footer">
                    <Link to={`/decl/edit/${declaration.id}`} className="edit-button">
                        <EditIcon />
                        Редактировать
                    </Link>
                    <Button color="error" variant="outlined" onClick={handleDeleteDeclaration} startIcon={<DeleteIcon />}>
                        Удалить
                    </Button>
                </div>
            )}

            <Menu
                anchorEl={statusAnchorEl}
                open={Boolean(statusAnchorEl)}
                onClose={() => setStatusAnchorEl(null)}
                className="status-menu"
            >
                {['FGIS_ENTERED', 'DECLARATION_REGISTERED'].map((status) => (
                    <MenuItem
                        key={status}
                        onClick={() => handleStatusSelect(status)}
                        selected={selectedStatus === status}
                    >
                        {statusLabels[status]}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};

export default DeclarationDetailsPage;
