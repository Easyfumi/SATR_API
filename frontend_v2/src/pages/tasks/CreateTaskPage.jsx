import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './CreateTaskPage.css';
import { VehicleCategories } from '../../constants/vehicleCategories';

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
            M1: "Легковые (M1)",
            M1G: "Внедорожные (M1G)",
            M2: "Автобусы малые (M2)",
            M2G: "Внедорожные автобусы (M2G)",
            M3: "Автобусы крупные (M3)",
            M3G: "Внедорожные автобусы (M3G)",
            N1: "Грузовые малые (N1)",
            N1G: "Внедорожные грузовые (N1G)",
            N2: "Грузовые средние (N2)",
            N2G: "Внедорожные грузовые (N2G)",
            N3: "Грузовые крупные (N3)",
            N3G: "Внедорожные грузовые (N3G)",
            O1: "Прицепы легкие (O1)",
            O2: "Прицепы средние (O2)",
            O3: "Прицепы тяжелые (O3)",
            O4: "Прицепы сверхтяжелые (O4)",
            L1: "Мопеды (L1)",
            L2: "Мотовелосипеды (L2)",
            L3: "Мотоциклы (L3)",
            L4: "Мотоциклы с коляской (L4)",
            L5: "Трициклы (L5)",
            L6: "Квадрициклы легкие (L6)",
            L7: "Квадрициклы тяжелые (L7)"
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
                        <label className="info-label">Категории ТС:</label>
                        <div className="categories-select">
                            {Object.values(VehicleCategories).map(category => (
                                <label key={category} className="category-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.categories.includes(category)}
                                        onChange={(e) => {
                                            const newCategories = e.target.checked
                                                ? [...formData.categories, category]
                                                : formData.categories.filter(c => c !== category);
                                            setFormData({ ...formData, categories: newCategories });
                                        }}
                                    />
                                    <span className="category-label">{getCategoryLabel(category)}</span>
                                </label>
                            ))}
                        </div>
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
                        <label className="info-label">Наименование типа:</label>
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
                        <button
                            type="button"
                            onClick={() => navigate('/tasks')}
                            className="secondary-btn"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="primary-btn"
                        >
                            Создать заявку
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskPage;