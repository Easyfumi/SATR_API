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
    const [loading, setLoading] = useState(false);

    // Загрузка списка задач для привязки
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await api.get('/api/tasks');
                setTasks(response.data);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
        fetchTasks();
    }, []);

    const [formData, setFormData] = useState({
        number: '',
        paymentStatus: '',
        taskId: null,
        comments: ''
    });

    // Статусы оплаты
    const paymentStatusOptions = [
        { value: 'NOTPAIDFOR', label: 'Не оплачен' },
        { value: 'PARTIALLYPAIDFOR', label: 'Оплачен частично' },
        { value: 'PAIDFOR', label: 'Оплачен' }
    ];

    // Генерация номера договора
    const generateContractNumber = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        return `Д-${year}${month}${day}-${random}`;
    };

    // Автозаполнение номера договора
    useEffect(() => {
        if (!formData.number) {
            setFormData(prev => ({
                ...prev,
                number: generateContractNumber()
            }));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const request = {
                number: formData.number,
                paymentStatus: formData.paymentStatus,
                tasks: formData.taskId ? { id: formData.taskId } : null,
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

    // Поиск задач с задержкой
    const debounce = (func, delay) => {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const searchTasks = debounce(async (searchText) => {
        try {
            const response = await api.get(`/api/tasks/search?quickSearch=${encodeURIComponent(searchText)}`);
            setTasks(response.data.content || response.data);
        } catch (error) {
            console.error('Error searching tasks:', error);
        }
    }, 300);

    return (
        <div className="content-container">
            <div className="create-contract-form">
                <h2 className="page-title">Создание нового договора</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Номер договора */}
                    <div className="form-row">
                        <label className="form-label">Номер договора:</label>
                        <div className="number-input-container">
                            <input
                                type="text"
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                className="form-input"
                                required
                                placeholder="Введите номер договора"
                            />
                            <button
                                type="button"
                                className="generate-number-btn"
                                onClick={() => setFormData({ ...formData, number: generateContractNumber() })}
                            >
                                Сгенерировать
                            </button>
                        </div>
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
                                            {selectedTask.assignedUser && (
                                                <div className="task-detail-row">
                                                    <span className="detail-label">Ответственный эксперт:</span>
                                                    <span className="detail-value">
                                                        {selectedTask.assignedUser.secondName} {selectedTask.assignedUser.firstName?.[0]}.{selectedTask.assignedUser.patronymic?.[0] || ''}.
                                                    </span>
                                                </div>
                                            )}
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