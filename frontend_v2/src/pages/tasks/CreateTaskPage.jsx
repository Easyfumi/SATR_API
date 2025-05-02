import React, { useState } from 'react';
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
    Button
} from '@mui/material';

const CreateTaskPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        docType: 'ОТТС',
        applicantName: '',
        manufacturerName: '',
        categories: [],
        mark: '',
        typeName: '',
        processType: '',
        representativeName: ''
    });


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
            N2G: "Внедорожные грузовые (N2G)",
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
                representativeName: formData.representativeName
            };

            await api.post('/api/tasks/create', request);
            navigate('/tasks');
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };


    return (
        <div className="content-container">
            <div className="create-task-form">
                <h2 className="form-title">Создание новой заявки</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="info-row">
                        <label className="info-label">Тип заявки:</label>
                        <select
                            value={formData.docType}
                            onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                            className="form-select"
                        >
                            <option value="ОТТС">ОТТС</option>
                            <option value="ОТШ">ОТШ</option>
                        </select>
                    </div>

                    <div className="info-row">
                        <label className="info-label">Заявитель:</label>
                        <input
                            type="text"
                            value={formData.applicantName}
                            onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="info-row">
                        <label className="info-label">Изготовитель:</label>
                        <input
                            type="text"
                            value={formData.manufacturerName}
                            onChange={(e) => setFormData({ ...formData, manufacturerName: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="info-row">
                        <label className="info-label">Категория:</label>
                        <FormControl fullWidth>
                            <Select
                                multiple
                                value={formData.categories}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    categories: e.target.value
                                })}
                                renderValue={(selected) => (
                                    <div className="selected-categories">
                                        {selected.map((value) => (
                                            <Chip
                                                key={value}
                                                label={getCategoryLabel(value)}
                                                className="category-chip"
                                            />
                                        ))}
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

                    <div className="info-row">
                        <label className="info-label">Марка:</label>
                        <input
                            type="text"
                            value={formData.mark}
                            onChange={(e) => setFormData({ ...formData, mark: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="info-row">
                        <label className="info-label">Тип:</label>
                        <input
                            type="text"
                            value={formData.typeName}
                            onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="info-row">
                        <label className="info-label">Процедура:</label>
                        <input
                            type="text"
                            value={formData.processType}
                            onChange={(e) => setFormData({ ...formData, processType: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="info-row">
                        <label className="info-label">Представитель:</label>
                        <input
                            type="text"
                            value={formData.representativeName}
                            onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                            className="form-input"
                            required
                        />
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