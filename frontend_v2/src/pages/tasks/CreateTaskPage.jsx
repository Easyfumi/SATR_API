import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './CreateTaskPage.css';
import { VehicleCategories } from '../../constants/vehicleCategories';
import {
    FormControl,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    Chip,
    Button,
    TextField,
    Autocomplete
} from '@mui/material';

const CreateTaskPage = () => {
    const navigate = useNavigate();

    const [experts, setExperts] = useState([]);

    useEffect(() => {
        const fetchExperts = async () => {
            try {
                const response = await api.get('/api/users/experts');
                setExperts(response.data);
            } catch (error) {
                console.error('Error fetching experts:', error);
            }
        };
        fetchExperts();
    }, []);




    // Функция для форматирования ФИО
    const formatExpertName = (expert) => {
        const initials = expert.patronymic
            ? `${expert.secondName} ${expert.firstName[0]}.${expert.patronymic[0]}.`
            : `${expert.secondName} ${expert.firstName[0]}.`;
        return initials;
    };

    const [formData, setFormData] = useState({
        docType: '',
        applicantName: '',
        manufacturerName: '',
        categories: [],
        mark: '',
        typeName: '',
        processType: '',
        procedureType: '', // Новое поле
        previousNumber: '', // Новое поле
        representativeName: '',
        assignedUserId: null
    });

    const processOptions = [
        'со сроком действия до 3-х лет',
        'со сроком действия до 1-ого года в соответствии с п. 35 ТР ТС',
        'на малую партию транспортных средств (шасси) в соответствии с п. 35 ТР ТС'
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
            N3: "N2G (Грузовые крупные)",
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const request = {
                docType: formData.docType,
                applicantName: formData.applicantName,
                manufacturerName: formData.manufacturerName,
                categories: formData.categories,
                mark: formData.mark,
                typeName: formData.typeName,
                processType: formData.processType,
                representativeName: formData.representativeName,
                assignedUserId: formData.assignedUserId,
                previousProcessType: formData.procedureType !== 'оформление нового'
                    ? formData.procedureType
                    : null,
                previousNumber: formData.procedureType !== 'оформление нового'
                    ? formData.previousNumber
                    : null
            };

            await api.post('/api/tasks/create', request);
            navigate('/tasks');
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const [showPreviousNumber, setShowPreviousNumber] = useState(false);

    // Варианты для процедуры
    const procedureOptions = [
        'Оформление нового',
        'Распространение',
        'Продление'
    ];

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

    const generateDefaultNumber = (docType) => {
        if (docType === 'ОТТС') {
            return 'ТС RU E-XX.МТ02.00XXX.Р1И1П1';
        } else if (docType === 'ОТШ') {
            return 'ТС RU K-XX.МТ02.00XXX.Р1И1П1';
        }
        return '';
    };

    const handleDocTypeChange = (newDocType) => {
        let newPreviousNumber = formData.previousNumber;

        if (formData.procedureType !== 'оформление нового') {
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


    // Добавим состояния для хранения вариантов
    const [applicants, setApplicants] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [representatives, setRepresentatives] = useState([]);

    // Функция для поиска с задержкой
    const debounce = (func, delay) => {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Обработчики поиска
    const searchApplicants = debounce(async (searchText) => {
        try {
            const response = await api.get(`/api/applicants/search?search=${encodeURIComponent(searchText)}`);
            setApplicants(response.data);
        } catch (error) {
            console.error('Error searching applicants:', error);
        }
    }, 300);

    const searchManufacturers = debounce(async (searchText) => {
        try {
            const response = await api.get(`/api/manufacturers/search?search=${encodeURIComponent(searchText)}`);
            setManufacturers(response.data);
        } catch (error) {
            console.error('Error searching manufacturers:', error);
        }
    }, 300);

    const searchRepresentatives = debounce(async (searchText) => {
        try {
            const response = await api.get(`/api/representatives/search?search=${encodeURIComponent(searchText)}`);
            setRepresentatives(response.data);
        } catch (error) {
            console.error('Error searching representatives:', error);
        }
    }, 300);

    // Добавляем состояния для чекбоксов
    const [manufacturerSameAsApplicant, setManufacturerSameAsApplicant] = useState(false);
    const [representativeSameAsApplicant, setRepresentativeSameAsApplicant] = useState(false);

    // Эффект для синхронизации полей при изменении чекбоксов
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

    // Обработчики изменений полей
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
        setFormData({ ...formData, representativeName: value });
    };


    // Эффект для сброса представителя при совпадении изготовителя
    useEffect(() => {
        if (manufacturerSameAsApplicant) {
            setFormData(prev => ({
                ...prev,
                representativeName: '',
                manufacturerName: prev.applicantName
            }));
            setRepresentativeSameAsApplicant(false);
        }
    }, [manufacturerSameAsApplicant, formData.applicantName]);


    return (
        <div className="content-container">
            <div className="create-task-form">
                <h2 className="page-title">Создание новой заявки</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="form-row">
                        <label className="form-label">Тип одобрения:</label>
                        <FormControl fullWidth>
                            <Select
                                value={formData.docType}
                                onChange={(e) => handleDocTypeChange(e.target.value)}
                                displayEmpty
                                renderValue={(selected) => (
                                    <div className="selected-process">
                                        {selected || <span className="placeholder-text">Выберите тип одобрения</span>}
                                    </div>
                                )}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            width: '100%',
                                            maxWidth: 'none',
                                            maxHeight: 300
                                        }
                                    }
                                }}
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
                    <div className="form-row">
                        <label className="form-label">Марка:</label>
                        <input
                            type="text"
                            value={formData.mark}
                            onChange={(e) => setFormData({ ...formData, mark: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-row">
                        <label className="form-label">Тип:</label>
                        <input
                            type="text"
                            value={formData.typeName}
                            onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-row">
                        <label className="form-label">Заявитель:</label>
                        <FormControl fullWidth>
                            <Autocomplete
                                freeSolo
                                options={applicants}
                                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                                onInputChange={(_, value) => {
                                    searchApplicants(value);
                                    setFormData({ ...formData, applicantName: value });
                                }}
                                onOpen={() => {
                                    // Загружаем данные только если они еще не загружены
                                    if (applicants.length === 0) {
                                        api.get('/api/applicants/search')
                                            .then(response => setApplicants(response.data))
                                            .catch(error => console.error('Error loading applicants:', error));
                                    }
                                }}
                                value={formData.applicantName}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        InputProps={{
                                            ...params.InputProps,
                                            className: 'form-input',
                                            startAdornment: !formData.applicantName && (
                                                <span className="placeholder-text">Выберите или введите заявителя</span>
                                            )
                                        }}
                                        required
                                    />
                                )}
                            />
                        </FormControl>
                    </div>

                    <div className="form-row">
                        <label className="form-label">Изготовитель:</label>
                        <FormControl fullWidth>
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
                                onOpen={() => {
                                    if (manufacturers.length === 0) {
                                        api.get('/api/manufacturers/search')
                                            .then(response => setManufacturers(response.data))
                                            .catch(error => console.error('Error loading manufacturers:', error));
                                    }
                                }}
                                value={formData.manufacturerName}
                                disabled={manufacturerSameAsApplicant}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        InputProps={{
                                            ...params.InputProps,
                                            className: 'form-input',
                                            startAdornment: !formData.manufacturerName && (
                                                <span className="placeholder-text">Выберите или введите изготовителя</span>
                                            )
                                        }}
                                        required
                                    />
                                )}
                            />
                        </FormControl>
                    </div>

                    {!manufacturerSameAsApplicant && (
                        <div className="form-row form-row-multiline">
                            <label className="form-label">Представитель изготовителя:</label>
                            <FormControl fullWidth>
                                <div className="checkbox-container">
                                    <Checkbox
                                        checked={representativeSameAsApplicant}
                                        onChange={(e) => setRepresentativeSameAsApplicant(e.target.checked)}
                                    />
                                    <span>Совпадает с заявителем</span>
                                </div>
                                <Autocomplete
                                    freeSolo
                                    options={representatives}
                                    getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                                    onInputChange={(_, value) => {
                                        searchRepresentatives(value);
                                        handleRepresentativeChange(value);
                                    }}
                                    onOpen={() => {
                                        if (representatives.length === 0) {
                                            api.get('/api/representatives/search')
                                                .then(response => setRepresentatives(response.data))
                                                .catch(error => console.error('Error loading representatives:', error));
                                        }
                                    }}
                                    value={formData.representativeName}
                                    disabled={representativeSameAsApplicant}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            InputProps={{
                                                ...params.InputProps,
                                                className: 'form-input',
                                                startAdornment: !formData.representativeName && (
                                                    <span className="placeholder-text">Выберите или введите представителя</span>
                                                )
                                            }}
                                            required={!manufacturerSameAsApplicant}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                    )}

                    <div className="form-row">
                        <label className="form-label">Категория:</label>
                        <FormControl fullWidth>
                            <Select
                                multiple
                                value={formData.categories}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    categories: e.target.value
                                })}
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
                                                />
                                            ))
                                        }
                                    </div>
                                )}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                        },
                                    }
                                }}
                            >
                                {Object.values(VehicleCategories).map((category) => (
                                    <MenuItem key={category} value={category}>
                                        <Checkbox checked={formData.categories.includes(category)} />
                                        <ListItemText primary={getCategoryLabel(category)} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="form-row">
                        <label className="form-label">Процедура:</label>
                        <FormControl fullWidth>
                            <Select
                                value={formData.processType}
                                onChange={(e) => setFormData({ ...formData, processType: e.target.value })}
                                displayEmpty
                                renderValue={(selected) => (
                                    <div className="selected-process">
                                        {selected || <span className="placeholder-text">Выберите процедуру</span>}
                                    </div>
                                )}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            width: '100%',
                                            maxWidth: 'none',
                                            maxHeight: 300
                                        }
                                    }
                                }}
                            >
                                {processOptions.map((option) => (
                                    <MenuItem
                                        key={option}
                                        value={option}
                                        style={{ whiteSpace: 'normal' }}
                                    >
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

                    {/* Поле выбора процедуры */}
                    <div className="form-row">
                        <label className="form-label">Тип процедуры:</label>
                        <FormControl fullWidth>
                            <Select
                                value={formData.procedureType}
                                onChange={(e) => handleProcedureChange(e.target.value)}
                                displayEmpty
                                renderValue={(selected) => (
                                    <div className="selected-process">
                                        {selected || <span className="placeholder-text">Выберите тип процедуры</span>}
                                    </div>
                                )}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            width: '100%',
                                            maxWidth: 'none',
                                            maxHeight: 300
                                        }
                                    }
                                }}
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

                    {/* Поле ввода номера предыдущего одобрения */}
                    {showPreviousNumber && (
                        <div className="form-row">
                            <label className="form-label">Номер предыдущего одобрения:</label>
                            <TextField
                                fullWidth
                                className="previous-number-input"
                                value={formData.previousNumber}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    previousNumber: e.target.value
                                })}
                                required={showPreviousNumber}
                                variant="outlined"
                            />
                        </div>
                    )}

                    <div className="form-row">
                        <label className="form-label">Эксперт:</label>
                        <FormControl fullWidth>
                            <Select
                                value={formData.assignedUserId || ''}
                                onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
                                displayEmpty
                                renderValue={(selected) => {
                                    if (!selected) {
                                        return (
                                            <div className="selected-process">
                                                <span className="placeholder-text">Выберите эксперта</span>
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
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            width: '100%',
                                            maxWidth: 'none',
                                            maxHeight: 300
                                        }
                                    }
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
                                    <MenuItem
                                        key={expert.id}
                                        value={expert.id}
                                        style={{ whiteSpace: 'normal' }}
                                    >
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

                    <div className="form-actions">
                        <Button
                            variant="outlined"
                            type="button"
                            onClick={() => navigate('/tasks')}
                            className="cancel-btn"
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                            className="save-btn"
                        >
                            Создать заявку
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskPage;