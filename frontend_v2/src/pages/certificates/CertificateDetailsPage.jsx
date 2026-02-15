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
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { canModifyTasks, canViewTasksAndContracts } from '../../utils/roleUtils';
import AccessDenied from '../../components/AccessDenied';
import '../tasks/TaskDetailsPage.css';

const statusLabels = {
    RECEIVED: 'Заявка получена',
    JOURNAL_REGISTERED: 'Заявка зарегистрирована в журнале',
    FGIS_ENTERED: 'Заявка занесена во ФГИС',
    CERTIFICATE_REGISTERED: 'Сертификат зарегистрирован'
};

const CertificateDetailsPage = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);

    const [newNumber, setNewNumber] = useState('');
    const [newApplicationDate, setNewApplicationDate] = useState('');
    const [isUpdatingNumber, setIsUpdatingNumber] = useState(false);

    const [statusAnchorEl, setStatusAnchorEl] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isStatusChanged, setIsStatusChanged] = useState(false);
    const [newCertificateNumber, setNewCertificateNumber] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [experts, setExperts] = useState([]);
    const [selectedExpertId, setSelectedExpertId] = useState('');
    const [isExpertChanged, setIsExpertChanged] = useState(false);
    const [isUpdatingExpert, setIsUpdatingExpert] = useState(false);

    const fetchCertificate = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/certificates/${id}`);
            setCertificate(response.data);
            setSelectedStatus(response.data.status);
            setSelectedExpertId(response.data.assignedUserId || '');
            setIsStatusChanged(false);
            setIsExpertChanged(false);
            setError(null);
        } catch (e) {
            setError('Не удалось загрузить данные сертификата');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchExperts = useCallback(async () => {
        const response = await api.get('/users/experts');
        setExperts(response.data);
    }, []);

    useEffect(() => {
        fetchCertificate();
        fetchExperts();
    }, [fetchCertificate, fetchExperts]);

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
            await api.put(`/certificates/${id}/number`, {
                number: newNumber,
                applicationDate: newApplicationDate
            });
            setNewNumber('');
            setNewApplicationDate('');
            await fetchCertificate();
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
            await api.put(`/certificates/${id}/status`, {
                status: selectedStatus,
                certificateNumber: selectedStatus === 'CERTIFICATE_REGISTERED'
                    ? (newCertificateNumber || certificate.certificateNumber)
                    : null
            });
            setNewCertificateNumber('');
            await fetchCertificate();
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
            await api.put(`/certificates/${id}/expert`, {
                assignedUserId: selectedExpertId || null
            });
            await fetchCertificate();
            showAlert('success', 'Исполнитель обновлен');
        } catch (e) {
            showAlert('error', e.response?.data?.message || 'Ошибка обновления исполнителя');
        } finally {
            setIsUpdatingExpert(false);
        }
    };

    if (!canViewTasksAndContracts(user)) {
        return <AccessDenied message="У вас нет доступа для просмотра заявок. Доступ имеют только авторизованные пользователи с назначенными ролями." />;
    }

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!certificate) return <div className="error-message">Сертификат не найден</div>;

    return (
        <div className="content-container">
            {alertMessage && (
                <Alert severity={alertMessage.type} onClose={() => setAlertMessage(null)} className="task-alert">
                    {alertMessage.text}
                </Alert>
            )}

            <div>
                <Link to="/serts" className="back-button">
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
                                    <span className={`status-badge ${certificate.status?.toLowerCase()}`}>
                                        {statusLabels[selectedStatus] || selectedStatus}
                                    </span>
                                    {certificate.status !== 'CERTIFICATE_REGISTERED' && (
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
                                                || (selectedStatus === 'CERTIFICATE_REGISTERED'
                                                    && !(newCertificateNumber || certificate.certificateNumber))
                                            }
                                        >
                                            {isUpdatingStatus ? <CircularProgress size={20} /> : 'Сохранить'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => {
                                                setSelectedStatus(certificate.status);
                                                setNewCertificateNumber('');
                                                setIsStatusChanged(false);
                                            }}
                                        >
                                            Отмена
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedStatus === 'CERTIFICATE_REGISTERED' && !certificate.certificateNumber && (
                            <div className="task-row">
                                <span className="task-label">Номер зарегистрированного сертификата</span>
                                <TextField
                                    size="small"
                                    value={newCertificateNumber}
                                    onChange={(e) => setNewCertificateNumber(e.target.value)}
                                    placeholder="Введите номер сертификата"
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
                                                setSelectedExpertId(certificate.assignedUserId || '');
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
                            {certificate.number ? (
                                <span className="task-value">
                                    {certificate.number} от {formatDate(certificate.applicationDate)}
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
                            <span className="task-label">Номер сертификата</span>
                            <span className="task-value">{certificate.certificateNumber || 'Не указан'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Дата регистрации сертификата</span>
                            <span className="task-value">{formatDate(certificate.certificateRegisteredAt)}</span>
                        </div>
                    </div>

                    <div className="vertical-divider"></div>

                    <div className="column right-column">
                        <div className="task-row">
                            <span className="task-label">Категория ТС</span>
                            <span className="task-value">{certificate.categories?.join(', ') || 'Не указана'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Марка</span>
                            <span className="task-value">{certificate.mark || 'Не указана'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Тип</span>
                            <span className="task-value">{certificate.typeName}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Модификации</span>
                            <span className="task-value">{certificate.modifications || 'Не указаны'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Коммерческие наименования</span>
                            <span className="task-value">{certificate.commercialNames || 'Не указаны'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Раздел стандарта</span>
                            <span className="task-value">{certificate.standardSection || 'Не указан'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Заявитель</span>
                            <span className="task-value">{certificate.applicant || 'Не указан'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Изготовитель</span>
                            <span className="task-value">{certificate.manufacturer || 'Не указан'}</span>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Представитель</span>
                            <span className="task-value">{certificate.representative || 'Не указан'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="task-details-card">
                <div className="task-row">
                    <span className="task-label">Дата создания</span>
                    <span className="task-value">{formatDateTime(certificate.createdAt)}</span>
                </div>
                <div className="task-row">
                    <span className="task-label">Заявка создана</span>
                    <span className="task-value">{certificate.createdBy || 'Не указано'}</span>
                </div>
            </div>

            {canModifyTasks(user) && (
                <div className="task-actions-footer">
                    <Link to={`/serts/edit/${certificate.id}`} className="edit-button">
                        <EditIcon />
                        Редактировать
                    </Link>
                </div>
            )}

            <Menu
                anchorEl={statusAnchorEl}
                open={Boolean(statusAnchorEl)}
                onClose={() => setStatusAnchorEl(null)}
                className="status-menu"
            >
                {['FGIS_ENTERED', 'CERTIFICATE_REGISTERED'].map((status) => (
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

export default CertificateDetailsPage;

