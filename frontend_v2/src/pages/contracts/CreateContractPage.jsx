import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
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
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(false);

    // Загрузка списка задач и заявителей
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksResponse, applicantsResponse] = await Promise.all([
                    api.get('/api/tasks'),
                    api.get('/api/applicants/search')
                ]);
                setTasks(tasksResponse.data);
                setApplicants(applicantsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const [formData, setFormData] = useState({
        number: '',
        date: '',
        paymentStatus: '',
        taskId: null,
        applicantName: '',
        comments: ''
    });

    // Статусы оплаты
    const paymentStatusOptions = [
        { value: 'NOTPAIDFOR', label: 'Не оплачен' },
        { value: 'PARTIALLYPAIDFOR', label: 'Оплачен частично' },
        { value: 'PAIDFOR', label: 'Оплачен' }
    ];

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

    const searchTasks = debounce(async (searchText) => {
        try {
            const response = await api.get(`/api/tasks/search?quickSearch=${encodeURIComponent(searchText)}`);
            setTasks(response.data.content || response.data);
        } catch (error) {
            console.error('Error searching tasks:', error);
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
                taskId: formData.taskId,
                applicantName: formData.applicantName,
                comments: formData.comments
            };

            await api.post('/api/contracts', request);
            navigate('/api/contracts');
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

    // Форматирование отображения задачи
    const formatTaskDisplay = (task) => {
        if (!task) return '';
        return `№${task.number || task.id} - ${task.mark} ${task.typeName}`;
    };

    // Получение текущей даты в формате YYYY-MM-DD
    const getCurrentDate = () => {
        return new Date().toISOString().split('T')[0];
    };

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

                    {/* Привязанная задача */}
                    <div className="form-row">
                        <label className="form-label">Привязанная задача:</label>
                        <FormControl fullWidth>
                            <Autocomplete
                                options={tasks}
                                getOptionLabel={(option) => formatTaskDisplay(option)}
                                onInputChange={(_, value) => {
                                    if (value) {
                                        searchTasks(value);
                                    }
                                }}
                                onChange={(_, value) => {
                                    setFormData({ ...formData, taskId: value ? value.id : null });
                                }}
                                value={tasks.find(task => task.id === formData.taskId) || null}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        InputProps={{
                                            ...params.InputProps,
                                            className: 'form-input',
                                            startAdornment: !formData.taskId && (
                                                <span className="placeholder-text">Выберите задачу для привязки</span>
                                            )
                                        }}
                                        placeholder="Начните вводить номер задачи или марку ТС"
                                    />
                                )}
                                noOptionsText="Задачи не найдены"
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

                    {/* Информация о выбранной задаче */}
                    {formData.taskId && (
                        <div className="task-info-preview">
                            <h4>Информация о выбранной задаче:</h4>
                            <div className="task-details">
                                {(() => {
                                    const selectedTask = tasks.find(task => task.id === formData.taskId);
                                    if (!selectedTask) return null;
                                    
                                    return (
                                        <>
                                            <div className="task-detail-row">
                                                <span className="detail-label">Номер:</span>
                                                <span className="detail-value">{selectedTask.number || 'Не назначен'}</span>
                                            </div>
                                            <div className="task-detail-row">
                                                <span className="detail-label">Марка:</span>
                                                <span className="detail-value">{selectedTask.mark}</span>
                                            </div>
                                            <div className="task-detail-row">
                                                <span className="detail-label">Тип:</span>
                                                <span className="detail-value">{selectedTask.typeName}</span>
                                            </div>
                                            <div className="task-detail-row">
                                                <span className="detail-label">Заявитель:</span>
                                                <span className="detail-value">{selectedTask.applicantName}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <Button
                            variant="outlined"
                            type="button"
                            onClick={() => navigate('/api/contracts')}
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