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
    TextField
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
        'со сроком действия до 1-ого года в соответствии с п. 35 ТР о безопасности колесных транспортных средств',
        'на малую партию транспортных средств (шасси) в соответствии с п. 35 технического регламента о безопасности колесных транспортных средств'
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
                previousNumber: formData.procedureType === 'оформление нового'
                    ? 'оформление нового'
                    : formData.previousNumber
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
        'оформление нового',
        'распространение',
        'продление'
    ];

    // Обработчик изменения типа процедуры
    const handleProcedureChange = (value) => {
        setFormData({
            ...formData,
            procedureType: value,
            previousNumber: value === 'оформление нового' ? value : ''
        });
        setShowPreviousNumber(value !== 'оформление нового');
    };

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
                                onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
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
                        <input
                            type="text"
                            value={formData.applicantName}
                            onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-row">
                        <label className="form-label">Изготовитель:</label>
                        <input
                            type="text"
                            value={formData.manufacturerName}
                            onChange={(e) => setFormData({ ...formData, manufacturerName: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-row form-row-multiline">
                        <label className="form-label">Представитель изготовителя:</label>
                        <input
                            type="text"
                            value={formData.representativeName}
                            onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>
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
                        <FormControl fullWidth className="procedure-select">
                            <Select
                                value={formData.procedureType}
                                onChange={(e) => handleProcedureChange(e.target.value)}
                                displayEmpty
                                required
                            >
                                {procedureOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    {/* Поле ввода номера */}
                    {showPreviousNumber && (
                        <div className="form-row">
                            <label className="form-label">Номер предыдущего одобрения:</label>
                            <TextField
                                fullWidth
                                className="previous-number-input"
                                value={formData.previousNumber}
                                onChange={(e) => setFormData({ ...formData, previousNumber: e.target.value })}
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
                                        return <span className="placeholder-text">Выберите эксперта</span>;
                                    }
                                    const selectedExpert = experts.find(e => e.id === selected);
                                    return formatExpertName(selectedExpert);
                                }}
                            >
                                <MenuItem value="">
                                    <em>Не назначен</em>
                                </MenuItem>
                                {experts.map((expert) => (
                                    <MenuItem key={expert.id} value={expert.id}>
                                        {formatExpertName(expert)}
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