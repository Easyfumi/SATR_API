import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { canManageContracts } from '../../utils/roleUtils';
import AccessDenied from '../../components/AccessDenied';
import './CreateContractPage.css';
import {
    FormControl,
    Select,
    MenuItem,
    Checkbox,
    Button,
    TextField,
    Autocomplete
} from '@mui/material';

const CreateContractPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        number: '',
        date: '',
        paymentStatus: '',
        applicantName: '',
        comments: ''
    });

    // Загрузка списка заявителей
    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const response = await api.get('/applicants/search');
                setApplicants(response.data);
            } catch (error) {
                console.error('Error fetching applicants:', error);
            }
        };
        fetchApplicants();
    }, []);

    // Статусы оплаты
    const paymentStatusOptions = [
        { value: 'NOTPAIDFOR', label: 'Не оплачен' },
        { value: 'PARTIALLYPAIDFOR', label: 'Оплачен частично' },
        { value: 'PAIDFOR', label: 'Оплачен' },
        { value: 'POSTPAID', label: 'Постоплата' }
    ];

    // Функция для поиска с задержкой
    const debounce = (func, delay) => {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Обработчик поиска заявителей
    const searchApplicants = debounce(async (searchText) => {
        try {
            const response = await api.get(`/applicants/search?search=${encodeURIComponent(searchText)}`);
            setApplicants(response.data);
        } catch (error) {
            console.error('Error searching applicants:', error);
        }
    }, 300);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const request = {
                number: formData.number,
                date: formData.date,
                paymentStatus: formData.paymentStatus,
                applicantName: formData.applicantName,
                comments: formData.comments
            };

            await api.post('/contracts', request);
            navigate('/contracts');
        } catch (error) {
            console.error('Error creating contract:', error);
            if (error.response?.status === 400) {
                alert('Ошибка при создании договора: ' + (error.response.data?.message || 'Номер договора должен быть уникальным'));
            } else {
                alert('Ошибка при создании договора: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    // Получение текущей даты в формате YYYY-MM-DD
    const getCurrentDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Проверка доступа (после всех хуков)
    if (!canManageContracts(user)) {
        return <AccessDenied message="У вас нет доступа для создания договоров. Доступ имеют только пользователи с ролью 'Бухгалтерия'." />;
    }

    return (
        <div className="content-container">
            <div className="create-contract-form">
                <h2 className="page-title">Создание нового договора</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Номер договора */}
                    <div className="form-row">
                        <label className="form-label">Номер договора:</label>
                        <input
                            type="text"
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            className="form-input"
                            required
                            placeholder="Введите номер договора"
                        />
                    </div>

                    {/* Дата договора */}
                    <div className="form-row">
                        <label className="form-label">Дата договора:</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="form-input"
                            required
                            max={getCurrentDate()}
                        />
                    </div>

                    {/* Статус оплаты */}
                    <div className="form-row">
                        <label className="form-label">Статус оплаты:</label>
                        <FormControl fullWidth>
                            <Select
                                value={formData.paymentStatus}
                                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                                displayEmpty
                                renderValue={(selected) => (
                                    <div className="selected-process">
                                        {selected ? paymentStatusOptions.find(opt => opt.value === selected)?.label 
                                                 : <span className="placeholder-text">Выберите статус оплаты</span>}
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
                                {paymentStatusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value} style={{ whiteSpace: 'normal' }}>
                                        <div className="process-option">
                                            <Checkbox
                                                checked={formData.paymentStatus === option.value}
                                                style={{ padding: '0 10px 0 0', flexShrink: 0 }}
                                            />
                                            <span>{option.label}</span>
                                        </div>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    {/* Заявитель */}
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
                                    if (applicants.length === 0) {
                                        api.get('/applicants/search')
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

                    {/* Комментарий */}
                    <div className="form-row form-row-textarea">
                        <label className="form-label">Комментарий:</label>
                        <textarea
                            value={formData.comments}
                            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                            className="form-textarea"
                            placeholder="Введите дополнительную информацию о договоре..."
                            rows={4}
                        />
                    </div>

                    <div className="form-actions">
                        <Button
                            variant="outlined"
                            type="button"
                            onClick={() => navigate('/contracts')}
                            className="cancel-btn"
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                            className="save-btn"
                            disabled={loading}
                        >
                            {loading ? 'Создание...' : 'Создать договор'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateContractPage;