import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { canModifyTasks } from '../../utils/roleUtils';
import AccessDenied from '../../components/AccessDenied';
import './TaskEditPage.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import {
    TextField,
    Button,
    CircularProgress,
    Menu,
    MenuItem,
    InputAdornment,
    IconButton,
    FormControl,
    Select,
    Checkbox,
    ListItemText,
    Chip,
    Autocomplete
} from '@mui/material';

const TaskEditPage = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    // Состояния для формы
    const [formData, setFormData] = useState({
        docType: '',
        applicantName: '',
        manufacturerName: '',
        categories: [],
        mark: '',
        typeName: '',
        processType: '',
        procedureType: '',
        previousNumber: '',
        representativeName: '',
        assignedUserId: null
    });

    // Состояния для автодополнения
    const [applicants, setApplicants] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [representatives, setRepresentatives] = useState([]);
    const [experts, setExperts] = useState([]);

    // Чекбоксы
    const [manufacturerSameAsApplicant, setManufacturerSameAsApplicant] = useState(false);
    const [representativeSameAsApplicant, setRepresentativeSameAsApplicant] = useState(false);
    const [representativeAbsent, setRepresentativeAbsent] = useState(false);

    // Состояния для управления договором
    const [contracts, setContracts] = useState([]);
    const [filteredContracts, setFilteredContracts] = useState([]);
    const [contractAnchorEl, setContractAnchorEl] = useState(null);
    const [isLoadingContracts, setIsLoadingContracts] = useState(false);
    const [contractSearch, setContractSearch] = useState('');

    const [showPreviousNumber, setShowPreviousNumber] = useState(false);

    // Константы
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

    const paymentStatusLabels = {
        PAIDFOR: 'Оплачен',
        PARTIALLYPAIDFOR: 'Оплачен частично',
        NOTPAIDFOR: 'Не оплачен',
        POSTPAID: 'Постоплата'
    };

    const processOptions = [
        'со сроком действия до 3-х лет',
        'со сроком действия до 1-ого года в соответствии с п. 35 ТР ТС',
        'на малую партию транспортных средств (шасси) в соответствии с п. 35 ТР ТС'
    ];

    const procedureOptions = [
        'Оформление нового',
        'Распространение',
        'Продление'
    ];

    const vehicleCategories = [
        'M1', 'M1G', 'M2', 'M2G', 'M3', 'M3G',
        'N1', 'N1G', 'N2', 'N2G', 'N3', 'N3G',
        'O1', 'O2', 'O3', 'O4',
        'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'
    ];

    const getCategoryLabel = (category) => {
        const labels = {
            M1: "M1 (Легковые)",
            M1G: "M1G (Внедорожные)",
            M2: "M2 (Автобусы малые)",
            M2G: "M2G (Внедорожные автобусы)",
            M3: "M3 (Автобусы крупные)",
            M3G: "M3G (Внедорожные автобусы)",
            N1: "N1 (Грузовые малые)",
            N1G: "N1G (Внедорожные грузовые)",
            N2: "N2 (Грузовые средние)",
            N2G: "N2G (Внедорожные грузовые)",
            N3: "N3 (Грузовые крупные)",
            N3G: "N3G (Внедорожные грузовые)",
            O1: "O1 (Прицепы легкие)",
            O2: "O2 (Прицепы средние)",
            O3: "O3 (Прицепы тяжелые)",
            O4: "O4 (Прицепы сверхтяжелые)",
            L1: "L1 (Мопеды)",
            L2: "L2 (Мотовелосипеды)",
            L3: "L3 (Мотоциклы)",
            L4: "L4 (Мотоциклы с коляской)",
            L5: "L5 (Трициклы)",
            L6: "L6 (Квадрициклы легкие)",
            L7: "L7 (Квадрициклы тяжелые)"
        };
        return labels[category] || category;
    };

    // Функция для генерации номера по умолчанию
    const generateDefaultNumber = (docType) => {
        if (docType === 'ОТТС') {
            return 'ТС RU E-XX.МТ02.00XXX.Р1И1П1';
        } else if (docType === 'ОТШ') {
            return 'ТС RU K-XX.МТ02.00XXX.Р1И1П1';
        }
        return '';
    };

    // Обработчик изменения типа процедуры
    const handleProcedureChange = (value) => {
        let newPreviousNumber = formData.previousNumber;

        if (value !== 'Оформление нового') {
            if (formData.previousNumber === '' || formData.previousNumber === 'Оформление нового') {
                newPreviousNumber = generateDefaultNumber(formData.docType);
            }
        } else {
            newPreviousNumber = '';
        }

        setFormData({
            ...formData,
            procedureType: value,
            previousNumber: newPreviousNumber
        });
        setShowPreviousNumber(value !== 'Оформление нового');
    };

    // Обработчик изменения типа одобрения
    const handleDocTypeChange = (newDocType) => {
        let newPreviousNumber = formData.previousNumber;

        if (formData.procedureType !== 'Оформление нового') {
            const currentDefault = generateDefaultNumber(formData.docType);
            if (formData.previousNumber === currentDefault || formData.previousNumber === '') {
                newPreviousNumber = generateDefaultNumber(newDocType);
            }
        }

        setFormData({
            ...formData,
            docType: newDocType,
            previousNumber: newPreviousNumber
        });
    };

    // Загрузка данных
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [taskResponse, expertsResponse] = await Promise.all([
                    api.get(`/tasks/${id}`),
                    api.get('/users/experts')
                ]);

                setTask(taskResponse.data);
                setExperts(expertsResponse.data);

                // Заполняем форму данными задачи
                const taskData = taskResponse.data;
                
                setFormData({
                    docType: taskData.docType || '',
                    applicantName: taskData.applicant || '',
                    manufacturerName: taskData.manufacturer || '',
                    categories: taskData.categories || [],
                    mark: taskData.mark || '',
                    typeName: taskData.typeName || '',
                    processType: taskData.processType || '',
                    procedureType: taskData.previousProcessType || 'Оформление нового',
                    previousNumber: taskData.previousNumber || '',
                    representativeName: taskData.representative || '',
                    assignedUserId: taskData.assignedUserId ?? taskData.assignedUser?.id ?? null
                });

                // Показываем поле предыдущего номера если нужно
                setShowPreviousNumber(taskData.previousProcessType && taskData.previousProcessType !== 'Оформление нового');

                setError(null);
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                setError('Не удалось загрузить данные задачи');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Функции для автодополнения
    const debounce = (func, delay) => {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const searchApplicants = debounce(async (searchText) => {
        try {
            const response = await api.get(`/applicants/search?search=${encodeURIComponent(searchText)}`);
            setApplicants(response.data);
        } catch (error) {
            console.error('Error searching applicants:', error);
        }
    }, 300);

    const searchManufacturers = debounce(async (searchText) => {
        try {
            const response = await api.get(`/manufacturers/search?search=${encodeURIComponent(searchText)}`);
            setManufacturers(response.data);
        } catch (error) {
            console.error('Error searching manufacturers:', error);
        }
    }, 300);

    const searchRepresentatives = debounce(async (searchText) => {
        try {
            const response = await api.get(`/representatives/search?search=${encodeURIComponent(searchText)}`);
            setRepresentatives(response.data);
        } catch (error) {
            console.error('Error searching representatives:', error);
        }
    }, 300);

    // Обработчики изменений
    const handleInputChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    // Эффекты для синхронизации чекбоксов
    useEffect(() => {
        if (manufacturerSameAsApplicant) {
            setFormData(prev => ({ ...prev, manufacturerName: prev.applicantName }));
        }
    }, [manufacturerSameAsApplicant, formData.applicantName]);

    useEffect(() => {
        if (representativeSameAsApplicant) {
            setFormData(prev => ({ ...prev, representativeName: prev.applicantName }));
        }
    }, [representativeSameAsApplicant, formData.applicantName]);

    const handleManufacturerChange = (value) => {
        if (manufacturerSameAsApplicant && value !== formData.applicantName) {
            setManufacturerSameAsApplicant(false);
        }
        setFormData({ ...formData, manufacturerName: value });
    };

    const handleRepresentativeChange = (value) => {
        if (representativeSameAsApplicant && value !== formData.applicantName) {
            setRepresentativeSameAsApplicant(false);
        }
        if (representativeAbsent && value) {
            setRepresentativeAbsent(false);
        }
        setFormData({ ...formData, representativeName: value });
    };

    const handleRepresentativeAbsentChange = (checked) => {
        setRepresentativeAbsent(checked);
        if (checked) {
            setRepresentativeSameAsApplicant(false);
            setFormData(prev => ({ ...prev, representativeName: '' }));
        }
    };

    useEffect(() => {
        if (manufacturerSameAsApplicant) {
            setFormData(prev => ({
                ...prev,
                representativeName: '',
                manufacturerName: prev.applicantName
            }));
            setRepresentativeSameAsApplicant(false);
            setRepresentativeAbsent(false);
        }
    }, [manufacturerSameAsApplicant, formData.applicantName]);

    useEffect(() => {
        if (representativeAbsent) {
            setRepresentativeSameAsApplicant(false);
        }
    }, [representativeAbsent]);

    // Функции для договора
    const fetchAllContracts = async () => {
        setIsLoadingContracts(true);
        try {
            const response = await api.get('/contracts');
            setContracts(response.data);
            setFilteredContracts(response.data);
        } catch (err) {
            console.error('Ошибка загрузки договоров:', err);
        } finally {
            setIsLoadingContracts(false);
        }
    };

    const filterContracts = (searchText) => {
        if (!searchText.trim()) {
            setFilteredContracts(contracts);
        } else {
            const filtered = contracts.filter(contract =>
                contract.number.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredContracts(filtered);
        }
    };

    const handleContractButtonClick = async (event) => {
        setContractAnchorEl(event.currentTarget);
        setContractSearch('');
        await fetchAllContracts();
    };

    const handleContractMenuClose = () => {
        setContractAnchorEl(null);
        setContractSearch('');
    };

    const handleContractSearchChange = (event) => {
        const searchText = event.target.value;
        setContractSearch(searchText);
        filterContracts(searchText);
    };

    const handleClearSearch = () => {
        setContractSearch('');
        setFilteredContracts(contracts);
    };

    const handleContractSelect = async (contractId) => {
        try {
            const response = await api.put(`/tasks/${id}/contract`, { contractId });
            setTask(response.data);
        } catch (error) {
            console.error('Ошибка привязки договора:', error);
            alert(error.response?.data?.message || 'Произошла ошибка при привязке договора');
        } finally {
            handleContractMenuClose();
        }
    };

    const handleRemoveContract = async () => {
        try {
            const response = await api.put(`/tasks/${id}/contract`, { contractId: null });
            setTask(response.data);
        } catch (error) {
            console.error('Ошибка отвязки договора:', error);
            alert(error.response?.data?.message || 'Произошла ошибка при отвязке договора');
        }
    };

    // Сохранение - ИСПРАВЛЕННАЯ ЛОГИКА
const handleSave = async () => {
    setSaving(true);
    try {
        const request = {
            docType: formData.docType,
            applicantName: formData.applicantName,
            manufacturerName: formData.manufacturerName,
            categories: formData.categories,
            mark: formData.mark,
            typeName: formData.typeName,
            processType: formData.processType,
            representativeName: representativeAbsent ? '' : formData.representativeName,
            assignedUserId: formData.assignedUserId,
            previousProcessType: formData.procedureType,
            previousNumber: formData.previousNumber,
            contractId: task?.contract?.id || null
        };

        console.log('Saving request:', request);

        const response = await api.put(`/tasks/${id}`, request);
        setTask(response.data);
        alert('Изменения успешно сохранены');
        navigate(`/tasks/${id}`);
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert(error.response?.data?.message || 'Произошла ошибка при сохранении');
    } finally {
        setSaving(false);
    }
};

    const handleCancel = () => {
        navigate(`/tasks/${id}`);
    };

    const handleDeleteTask = async () => {
        if (!window.confirm('Удалить заявку? Это действие нельзя отменить.')) {
            return;
        }

        setDeleting(true);
        try {
            await api.delete(`/tasks/${id}`);
            navigate('/tasks');
        } catch (error) {
            console.error('Ошибка удаления заявки:', error);
            alert(error.response?.data?.message || 'Произошла ошибка при удалении');
        } finally {
            setDeleting(false);
        }
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'Не указана';
        return new Date(dateTime).toLocaleString('ru-RU');
    };

    const formatDate = (date) => {
        if (!date || new Date(date).toString() === 'Invalid Date') {
            return 'Не указана';
        }
        const dateObj = new Date(date);
        if (dateObj.getFullYear() === 1970 && dateObj.getMonth() === 0 && dateObj.getDate() === 1) {
            return 'Не указана';
        }
        return dateObj.toLocaleDateString('ru-RU');
    };

    const getPaymentStatusLabel = (status) => {
        return paymentStatusLabels[status] || status;
    };

    const formatExpertName = (expert) => {
        if (!expert) return '';
        const initials = expert.patronymic
            ? `${expert.secondName} ${expert.firstName[0]}.${expert.patronymic[0]}.`
            : `${expert.secondName} ${expert.firstName[0]}.`;
        return initials;
    };


    // Проверка доступа (после всех хуков)
    if (!canModifyTasks(user)) {
        return <AccessDenied message="У вас нет доступа для редактирования заявок. Доступ имеют только пользователи с ролью 'Эксперт' или 'Руководитель'." />;
    }

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="content-container">
            <div className="details-header">
                <Link to={`/tasks/${id}`} className="back-button">
                    <ArrowBackIcon />
                    Назад к просмотру
                </Link>
                <div className="edit-actions">
                    <Button
                        variant="outlined"
                        onClick={handleCancel}
                        startIcon={<CancelIcon />}
                        disabled={saving || deleting}
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteTask}
                        startIcon={<DeleteIcon />}
                        disabled={saving || deleting}
                    >
                        {deleting ? 'Удаление...' : 'Удалить заявку'}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving || deleting}
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                        {saving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </div>
            </div>

            {/* Основная информация */}
            <div className="task-details-card">
                <div className="card-content">
                    {/* Левая колонка */}
                    <div className="column left-column">
                        <div className="task-row">
                            <span className="task-label">Тип одобрения:</span>
                            <FormControl fullWidth className="edit-form-control" variant="outlined">
                                <Select
                                    value={formData.docType}
                                    onChange={(e) => handleDocTypeChange(e.target.value)}
                                    displayEmpty
                                    renderValue={(selected) => (
                                        <div className="selected-process">
                                            {selected || <span className="placeholder-text">Выберите тип одобрения</span>}
                                        </div>
                                    )}
                                >
                                    <MenuItem value="ОТТС" style={{ whiteSpace: 'normal' }}>
                                        <div className="process-option">
                                            <Checkbox
                                                checked={formData.docType === 'ОТТС'}
                                                style={{ padding: '0 10px 0 0', flexShrink: 0 }}
                                            />
                                            <span>ОТТС (Одобрение типа транспортного средства)</span>
                                        </div>
                                    </MenuItem>
                                    <MenuItem value="ОТШ" style={{ whiteSpace: 'normal' }}>
                                        <div className="process-option">
                                            <Checkbox
                                                checked={formData.docType === 'ОТШ'}
                                                style={{ padding: '0 10px 0 0', flexShrink: 0 }}
                                            />
                                            <span>ОТШ (Одобрение типа шасси)</span>
                                        </div>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        <div className="task-row">
                            <span className="task-label">Процедура:</span>
                            <FormControl fullWidth className="edit-form-control" variant="outlined">
                                <Select
                                    value={formData.processType}
                                    onChange={handleInputChange('processType')}
                                    displayEmpty
                                    renderValue={(selected) => (
                                        <div className="selected-process">
                                            {selected || <span className="placeholder-text">Выберите процедуру</span>}
                                        </div>
                                    )}
                                >
                                    {processOptions.map((option) => (
                                        <MenuItem key={option} value={option} style={{ whiteSpace: 'normal' }}>
                                            <div className="process-option">
                                                <Checkbox
                                                    checked={formData.processType === option}
                                                    style={{ padding: '0 10px 0 0', flexShrink: 0 }}
                                                />
                                                <span>{option}</span>
                                            </div>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        <div className="task-row">
                            <span className="task-label">Тип процедуры:</span>
                            <FormControl fullWidth className="edit-form-control" variant="outlined">
                                <Select
                                    value={formData.procedureType}
                                    onChange={(e) => handleProcedureChange(e.target.value)}
                                    displayEmpty
                                    renderValue={(selected) => (
                                        <div className="selected-process">
                                            {selected || <span className="placeholder-text">Выберите тип процедуры</span>}
                                        </div>
                                    )}
                                >
                                    {procedureOptions.map((option) => (
                                        <MenuItem key={option} value={option} style={{ whiteSpace: 'normal' }}>
                                            <div className="process-option">
                                                <Checkbox
                                                    checked={formData.procedureType === option}
                                                    style={{ padding: '0 10px 0 0', flexShrink: 0 }}
                                                />
                                                <span>{option}</span>
                                            </div>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        {showPreviousNumber && (
                            <div className="task-row">
                                <span className="task-label">Номер предыдущего одобрения:</span>
                                <FormControl fullWidth className="edit-form-control">
                                    <TextField
                                        value={formData.previousNumber}
                                        onChange={handleInputChange('previousNumber')}
                                        variant="outlined"
                                        className="bordered-field"
                                    />
                                </FormControl>
                            </div>
                        )}
                    </div>

                    {/* Вертикальная разделительная линия */}
                    <div className="vertical-divider"></div>

                    {/* Правая колонка */}
                    <div className="column right-column">
                        <div className="task-row">
                            <span className="task-label">Исполнитель:</span>
                            <FormControl fullWidth className="edit-form-control" variant="outlined">
                                <Select
                                    value={formData.assignedUserId || ''}
                                    onChange={handleInputChange('assignedUserId')}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (!selected) {
                                            return (
                                                <div className="selected-process">
                                                    <span className="placeholder-text">Выберите исполнителя</span>
                                                </div>
                                            );
                                        }
                                        const selectedExpert = experts.find(e => e.id === selected);
                                        return (
                                            <div className="selected-process">
                                                {formatExpertName(selectedExpert)}
                                            </div>
                                        );
                                    }}
                                >
                                    <MenuItem value="" style={{ whiteSpace: 'normal' }}>
                                        <div className="process-option">
                                            <Checkbox
                                                checked={false}
                                                style={{ padding: '0 10px 0 0', flexShrink: 0 }}
                                                disabled
                                            />
                                            <span style={{ fontStyle: 'italic' }}>Не назначен</span>
                                        </div>
                                    </MenuItem>
                                    {experts.map((expert) => (
                                        <MenuItem key={expert.id} value={expert.id} style={{ whiteSpace: 'normal' }}>
                                            <div className="process-option">
                                                <Checkbox
                                                    checked={formData.assignedUserId === expert.id}
                                                    style={{ padding: '0 10px 0 0', flexShrink: 0 }}
                                                />
                                                <span>{formatExpertName(expert)}</span>
                                            </div>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Информация о ТС */}
            <div className="task-details-card">
                <div className="card-content">
                    {/* Левая колонка */}
                    <div className="column left-column">
                        <div className="task-row">
                            <span className="task-label">Марка:</span>
                            <FormControl fullWidth className="edit-form-control">
                                <TextField
                                    value={formData.mark}
                                    onChange={handleInputChange('mark')}
                                    variant="outlined"
                                    className="bordered-field"
                                />
                            </FormControl>
                        </div>

                        <div className="task-row">
                            <span className="task-label">Тип:</span>
                            <FormControl fullWidth className="edit-form-control">
                                <TextField
                                    value={formData.typeName}
                                    onChange={handleInputChange('typeName')}
                                    variant="outlined"
                                    className="bordered-field"
                                />
                            </FormControl>
                        </div>
                    </div>

                    {/* Вертикальная разделительная линия */}
                    <div className="vertical-divider"></div>

                    {/* Правая колонка */}
                    <div className="column right-column">
                        <div className="task-row">
                            <span className="task-label">Категории:</span>
                            <FormControl fullWidth className="edit-form-control" variant="outlined">
                                <Select
                                    multiple
                                    value={formData.categories}
                                    onChange={handleInputChange('categories')}
                                    displayEmpty
                                    renderValue={(selected) => (
                                        <div className="selected-categories">
                                            {selected.length === 0
                                                ? <span className="placeholder-text">Выберите категорию</span>
                                                : selected.map((value) => (
                                                    <Chip
                                                        key={value}
                                                        label={getCategoryLabel(value)}
                                                        className="category-chip"
                                                        size="small"
                                                    />
                                                ))
                                            }
                                        </div>
                                    )}
                                >
                                    {vehicleCategories.map((category) => (
                                        <MenuItem key={category} value={category}>
                                            <Checkbox checked={formData.categories.includes(category)} />
                                            <ListItemText primary={getCategoryLabel(category)} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Участники */}
            <div className="task-details-card">
                <div className="card-content">
                    {/* Левая колонка */}
                    <div className="column left-column">
                        <div className="task-row">
                            <span className="task-label">Заявитель:</span>
                            <FormControl fullWidth className="edit-form-control">
                                <Autocomplete
                                    freeSolo
                                    options={applicants}
                                    getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                                    onInputChange={(_, value) => {
                                        searchApplicants(value);
                                        setFormData({ ...formData, applicantName: value });
                                    }}
                                    value={formData.applicantName}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            className="bordered-field"
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                    </div>

                    {/* Вертикальная разделительная линия */}
                    <div className="vertical-divider"></div>

                    {/* Правая колонка */}
                    <div className="column right-column">
                        <div className="task-row">
                            <span className="task-label">Изготовитель:</span>
                            <FormControl fullWidth className="edit-form-control">
                                <div className="checkbox-container">
                                    <Checkbox
                                        checked={manufacturerSameAsApplicant}
                                        onChange={(e) => setManufacturerSameAsApplicant(e.target.checked)}
                                    />
                                    <span>Совпадает с заявителем</span>
                                </div>
                                <Autocomplete
                                    freeSolo
                                    options={manufacturers}
                                    getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                                    onInputChange={(_, value) => {
                                        searchManufacturers(value);
                                        handleManufacturerChange(value);
                                    }}
                                    value={formData.manufacturerName}
                                    disabled={manufacturerSameAsApplicant}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            className="bordered-field"
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>

                        {!manufacturerSameAsApplicant && (
                            <div className="task-row">
                                <span className="task-label">Представитель изготовителя:</span>
                                <FormControl fullWidth className="edit-form-control">
                                    <div className="checkbox-container">
                                        <Checkbox
                                            checked={representativeSameAsApplicant}
                                            onChange={(e) => setRepresentativeSameAsApplicant(e.target.checked)}
                                        />
                                        <span>Совпадает с заявителем</span>
                                    </div>
                                    <div className="checkbox-container">
                                        <Checkbox
                                            checked={representativeAbsent}
                                            onChange={(e) => handleRepresentativeAbsentChange(e.target.checked)}
                                        />
                                        <span>Отсутствует</span>
                                    </div>
                                    <Autocomplete
                                        freeSolo
                                        options={representatives}
                                        getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                                        onInputChange={(_, value) => {
                                            searchRepresentatives(value);
                                            handleRepresentativeChange(value);
                                        }}
                                        value={formData.representativeName}
                                        disabled={representativeSameAsApplicant || representativeAbsent}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                className="bordered-field"
                                            />
                                        )}
                                    />
                                </FormControl>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Остальные секции (Договор и Системная информация) остаются без изменений */}
            {/* Договор */}
            <div className="task-details-card">
                <div className="task-row contract-section">
                    <div className={`contracts-container ${task.contract ? 'contract-attached' : ''}`}>
                        {!task.contract && (
                            <div className="contracts-header">
                                <Button
                                    variant="contained"
                                    onClick={handleContractButtonClick}
                                    startIcon={<SearchIcon />}
                                >
                                    Привязать договор
                                </Button>
                            </div>
                        )}

                        {task.contract && (
                            <div className="contracts-header">
                                <div className="contract-actions">
                                    <Button
                                        variant="outlined"
                                        onClick={handleContractButtonClick}
                                        startIcon={<SearchIcon />}
                                    >
                                        Изменить
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleRemoveContract}
                                        startIcon={<ClearIcon />}
                                    >
                                        Отвязать
                                    </Button>
                                </div>
                            </div>
                        )}

                        {task.contract ? (
                            <div className="contract-details-grid">
                                <div className="contract-column left-column">
                                    <div className="task-row contract-row">
                                        <span className="task-label">Номер договора</span>
                                        <span className="task-value">{task.contract.number}</span>
                                    </div>
                                    <div className="task-row contract-row">
                                        <span className="task-label">Статус оплаты</span>
                                        <span className={`task-value payment-status-badge payment-status-${task.contract.paymentStatus?.toLowerCase()}`}>
                                            {getPaymentStatusLabel(task.contract.paymentStatus)}
                                        </span>
                                    </div>
                                </div>

                                <div className="contract-divider"></div>

                                <div className="contract-column right-column">
                                    <div className="task-row contract-row">
                                        <span className="task-label">Дата</span>
                                        <span className="task-value">{formatDate(task.contract.date)}</span>
                                    </div>
                                    <div className="task-row contract-row">
                                        <span className="task-label">Заявитель</span>
                                        <span className="task-value">
                                            {task.contract.applicantName
                                                || (typeof task.contract.applicant === 'object'
                                                    ? task.contract.applicant.name
                                                    : task.contract.applicant)
                                                || 'Не указан'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Меню выбора договора */}
                <Menu
                    anchorEl={contractAnchorEl}
                    open={Boolean(contractAnchorEl)}
                    onClose={handleContractMenuClose}
                    className="contract-menu"
                >
                    <div className="contract-search-container">
                        <TextField
                            className="contract-search-field bordered-field"
                            placeholder="Поиск по номеру договора..."
                            value={contractSearch}
                            onChange={handleContractSearchChange}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: contractSearch && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={handleClearSearch}>
                                            <ClearIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </div>

                    {isLoadingContracts ? (
                        <div className="contracts-loading">
                            <CircularProgress size={20} />
                            <span>Загрузка договоров...</span>
                        </div>
                    ) : filteredContracts.length === 0 ? (
                        <div className="no-contracts-message">
                            {contractSearch ? 'Договоры не найдены' : 'Нет доступных договоров'}
                        </div>
                    ) : (
                        filteredContracts.map((contract) => (
                            <MenuItem
                                key={contract.id}
                                onClick={() => handleContractSelect(contract.id)}
                                className="contract-menu-item"
                            >
                                <div className="contract-item-details">
                                    <div className="contract-item-top">
                                        <div className="contract-item-number">
                                            {contract.number}
                                        </div>
                                        <div className="contract-item-date">от {formatDate(contract.date)}</div>
                                    </div>
                                    <div className="contract-item-middle">
                                        <span className="contract-item-label">Заявитель:</span>
                                        <span className="contract-item-value">
                                            {contract.applicant?.name || contract.applicant || 'Не указан'}
                                        </span>
                                    </div>
                                    <div className="contract-item-bottom">
                                        <span className="contract-item-label">Оплата:</span>
                                        <span className={`contract-item-value payment-status-badge payment-status-${contract.paymentStatus?.toLowerCase()}`}>
                                            {getPaymentStatusLabel(contract.paymentStatus)}
                                        </span>
                                    </div>
                                </div>
                            </MenuItem>
                        ))
                    )}
                </Menu>
            </div>

            {/* Системная информация */}
            <div className="task-details-card">
                <div className="task-row">
                    <span className="task-label">Дата создания:</span>
                    <span className="task-value">{formatDateTime(task.createdAt)}</span>
                </div>
                <div className="task-row">
                    <span className="task-label">Заявка создана:</span>
                    <span className="task-value">{task.createdBy}</span>
                </div>
                <div className="task-row">
                    <span className="task-label">Номер заявки:</span>
                    <span className="task-value">{task.number || 'Не присвоен'}</span>
                </div>
                <div className="task-row">
                    <span className="task-label">Статус:</span>
                    <span className={`status-badge ${task.status?.toLowerCase()}`}>
                        {statusLabels[task.status] || task.status}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TaskEditPage;