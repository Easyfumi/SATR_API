import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { canManageContracts } from '../../utils/roleUtils';
import AccessDenied from '../../components/AccessDenied';
import './EditContractPage.css';
import {
    FormControl,
    Select,
    MenuItem,
    Checkbox,
    Button,
    TextField,
    Autocomplete
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const EditContractPage = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [contract, setContract] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);

    const [formData, setFormData] = useState({
        number: '',
        date: '',
        paymentStatus: '',
        applicantName: '',
        comments: ''
    });

    // Статусы оплаты
    const paymentStatusOptions = [
        { value: 'NOTPAIDFOR', label: 'Не оплачен' },
        { value: 'PARTIALLYPAIDFOR', label: 'Оплачен частично' },
        { value: 'PAIDFOR', label: 'Оплачен' }
    ];

    // Загрузка данных договора и заявителей
    // Проверка доступа (после всех хуков)
    if (!canManageContracts(user)) {
        return <AccessDenied message="У вас нет доступа для редактирования договоров. Доступ имеют только пользователи с ролью 'Бухгалтерия'." />;
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contractResponse, applicantsResponse] = await Promise.all([
                    api.get(`/api/contracts/${id}`),
                    api.get('/api/applicants/search')
                ]);

                setContract(contractResponse.data);
                setApplicants(applicantsResponse.data);

                // Заполняем форму данными договора
                setFormData({
                    number: contractResponse.data.number || '',
                    date: contractResponse.data.date || '',
                    paymentStatus: contractResponse.data.paymentStatus || '',
                    applicantName: contractResponse.data.applicant ? contractResponse.data.applicant.name : '',
                    comments: contractResponse.data.comments || ''
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Ошибка загрузки данных договора');
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, [id]);

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
            const response = await api.get(`/api/applicants/search?search=${encodeURIComponent(searchText)}`);
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

            await api.put(`/api/contracts/${id}`, request);
            navigate(`/contracts/${id}`);
        } catch (error) {
            console.error('Error updating contract:', error);
            if (error.response?.status === 400) {
                alert('Ошибка при обновлении договора: ' + (error.response.data?.message || 'Номер договора должен быть уникальным'));
            } else {
                alert('Ошибка при обновлении договора: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(`/contracts/${id}`);
    };

    // Получение текущей даты в формате YYYY-MM-DD
    const getCurrentDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    if (initialLoading) return <div className="loading">Загрузка...</div>;
    if (!contract) return <div className="error-message">Договор не найден</div>;

    return (
        <div className="content-container">
            <div className="edit-contract-form">
                <div className="form-header">
                    <button
                        className="back-button"
                        onClick={() => navigate(`/contracts/${id}`)}
                    >
                        <ArrowBackIcon />
                        Назад к договору
                    </button>
                    <h2 className="page-title">Редактирование договора № {contract.number}</h2>
                </div>

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

                    {(contract.createdByName || contract.createdBy) && (
                        <div className="form-row">
                            <label className="form-label">Создал:</label>
                            <div className="readonly-field">
                                {contract.createdByName || `Пользователь #${contract.createdBy}`}
                            </div>
                        </div>
                    )}
                    {contract.createdAt && (
                        <div className="form-row">
                            <label className="form-label">Дата создания:</label>
                            <div className="readonly-field">
                                {new Date(contract.createdAt).toLocaleString('ru-RU')}
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <Button
                            variant="outlined"
                            type="button"
                            onClick={handleCancel}
                            className="cancel-btn"
                            startIcon={<CancelIcon />}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                            className="save-btn"
                            disabled={loading}
                            startIcon={<SaveIcon />}
                        >
                            {loading ? 'Сохранение...' : 'Сохранить изменения'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditContractPage;