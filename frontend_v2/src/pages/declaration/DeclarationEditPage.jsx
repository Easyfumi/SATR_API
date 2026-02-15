import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Autocomplete,
    Button,
    Checkbox,
    Chip,
    FormControl,
    ListItemText,
    MenuItem,
    Select,
    TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { canModifyTasks } from '../../utils/roleUtils';
import AccessDenied from '../../components/AccessDenied';
import { VehicleCategories } from '../../constants/vehicleCategories';
import '../tasks/TaskEditPage.css';

const DeclarationEditPage = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [experts, setExperts] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [representatives, setRepresentatives] = useState([]);

    const [formData, setFormData] = useState({
        applicantName: '',
        manufacturerName: '',
        representativeName: '',
        categories: [],
        mark: '',
        typeName: '',
        modifications: '',
        commercialNames: '',
        standardSection: '',
        assignedUserId: null
    });

    const [manufacturerSameAsApplicant, setManufacturerSameAsApplicant] = useState(false);
    const [representativeSameAsApplicant, setRepresentativeSameAsApplicant] = useState(false);
    const [representativeAbsent, setRepresentativeAbsent] = useState(false);

    const getCategoryLabel = (category) => {
        const labels = {
            M1: 'M1 (Легковые)',
            M1G: 'M1G (Внедорожные)',
            M2: 'M2 (Автобусы малые)',
            M2G: 'M2G (Внедорожные автобусы)',
            M3: 'M3 (Автобусы крупные)',
            M3G: 'M3G (Внедорожные автобусы)',
            N1: 'N1 (Грузовые малые)',
            N1G: 'N1G (Внедорожные грузовые)',
            N2: 'N2 (Грузовые средние)',
            N2G: 'N2G (Внедорожные грузовые)',
            N3: 'N3 (Грузовые крупные)',
            N3G: 'N3G (Внедорожные грузовые)',
            O1: 'O1 (Прицепы легкие)',
            O2: 'O2 (Прицепы средние)',
            O3: 'O3 (Прицепы тяжелые)',
            O4: 'O4 (Прицепы сверхтяжелые)',
            L1: 'L1 (Мопеды)',
            L2: 'L2 (Мотовелосипеды)',
            L3: 'L3 (Мотоциклы)',
            L4: 'L4 (Мотоциклы с коляской)',
            L5: 'L5 (Трициклы)',
            L6: 'L6 (Квадрициклы легкие)',
            L7: 'L7 (Квадрициклы тяжелые)'
        };
        return labels[category] || category;
    };

    const formatExpertName = (expert) => {
        if (!expert) return '';
        return expert.patronymic
            ? `${expert.secondName} ${expert.firstName[0]}.${expert.patronymic[0]}.`
            : `${expert.secondName} ${expert.firstName[0]}.`;
    };

    const debounce = (fn, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    };

    const searchApplicants = debounce(async (searchText) => {
        const response = await api.get(`/applicants/search?search=${encodeURIComponent(searchText)}`);
        setApplicants(response.data);
    }, 300);

    const searchManufacturers = debounce(async (searchText) => {
        const response = await api.get(`/manufacturers/search?search=${encodeURIComponent(searchText)}`);
        setManufacturers(response.data);
    }, 300);

    const searchRepresentatives = debounce(async (searchText) => {
        const response = await api.get(`/representatives/search?search=${encodeURIComponent(searchText)}`);
        setRepresentatives(response.data);
    }, 300);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [declarationResponse, expertsResponse] = await Promise.all([
                    api.get(`/declarations/${id}`),
                    api.get('/users/experts')
                ]);

                const data = declarationResponse.data;
                setFormData({
                    applicantName: data.applicant || '',
                    manufacturerName: data.manufacturer || '',
                    representativeName: data.representative || '',
                    categories: data.categories || [],
                    mark: data.mark || '',
                    typeName: data.typeName || '',
                    modifications: data.modifications || '',
                    commercialNames: data.commercialNames || '',
                    standardSection: data.standardSection || '',
                    assignedUserId: data.assignedUserId ?? data.assignedUser?.id ?? null
                });
                setExperts(expertsResponse.data);
                setError(null);
            } catch (e) {
                setError('Не удалось загрузить данные декларации');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (manufacturerSameAsApplicant) {
            setFormData((prev) => ({ ...prev, manufacturerName: prev.applicantName }));
            setRepresentativeSameAsApplicant(false);
            setRepresentativeAbsent(false);
            setFormData((prev) => ({ ...prev, representativeName: '' }));
        }
    }, [manufacturerSameAsApplicant, formData.applicantName]);

    useEffect(() => {
        if (representativeSameAsApplicant) {
            setFormData((prev) => ({ ...prev, representativeName: prev.applicantName }));
        }
    }, [representativeSameAsApplicant, formData.applicantName]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const request = {
                ...formData,
                representativeName: representativeAbsent ? '' : formData.representativeName
            };
            await api.put(`/declarations/${id}`, request);
            navigate(`/decl/${id}`);
        } catch (e) {
            alert(e.response?.data?.message || 'Ошибка сохранения изменений');
        } finally {
            setSaving(false);
        }
    };

    if (!canModifyTasks(user)) {
        return <AccessDenied message="У вас нет доступа для редактирования заявок. Доступ имеют только пользователи с ролью 'Эксперт' или 'Руководитель'." />;
    }

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="content-container">
            <div className="details-header">
                <Link to={`/decl/${id}`} className="back-button">
                    <ArrowBackIcon />
                    Назад к просмотру
                </Link>
                <div className="edit-actions">
                    <Button variant="outlined" onClick={() => navigate(`/decl/${id}`)} startIcon={<CancelIcon />}>
                        Отмена
                    </Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={<SaveIcon />}>
                        {saving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </div>
            </div>

            <div className="task-details-card">
                <div className="card-content">
                    <div className="column left-column">
                        <div className="task-row">
                            <span className="task-label">Заявитель:</span>
                            <FormControl fullWidth className="edit-form-control">
                                <Autocomplete
                                    freeSolo
                                    options={applicants}
                                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                                    onInputChange={(_, value) => {
                                        searchApplicants(value);
                                        setFormData({ ...formData, applicantName: value });
                                    }}
                                    value={formData.applicantName}
                                    renderInput={(params) => <TextField {...params} className="bordered-field" required />}
                                />
                            </FormControl>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Категория ТС:</span>
                            <FormControl fullWidth className="edit-form-control">
                                <Select
                                    multiple
                                    value={formData.categories}
                                    onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                                    displayEmpty
                                    renderValue={(selected) => (
                                        <div className="selected-categories">
                                            {selected.length === 0
                                                ? <span className="placeholder-text">Выберите категорию</span>
                                                : selected.map((value) => (
                                                    <Chip key={value} label={getCategoryLabel(value)} className="category-chip" size="small" />
                                                ))}
                                        </div>
                                    )}
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
                        <div className="task-row">
                            <span className="task-label">Марка:</span>
                            <FormControl fullWidth className="edit-form-control">
                                <TextField
                                    value={formData.mark}
                                    onChange={(e) => setFormData({ ...formData, mark: e.target.value })}
                                    className="bordered-field"
                                />
                            </FormControl>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Тип:</span>
                            <FormControl fullWidth className="edit-form-control">
                                <TextField
                                    value={formData.typeName}
                                    onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                                    className="bordered-field"
                                    required
                                />
                            </FormControl>
                        </div>
                    </div>

                    <div className="vertical-divider"></div>

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
                                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                                    onInputChange={(_, value) => {
                                        searchManufacturers(value);
                                        setFormData({ ...formData, manufacturerName: value });
                                    }}
                                    value={formData.manufacturerName}
                                    disabled={manufacturerSameAsApplicant}
                                    renderInput={(params) => <TextField {...params} className="bordered-field" required />}
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
                                            onChange={(e) => {
                                                setRepresentativeAbsent(e.target.checked);
                                                if (e.target.checked) {
                                                    setRepresentativeSameAsApplicant(false);
                                                    setFormData((prev) => ({ ...prev, representativeName: '' }));
                                                }
                                            }}
                                        />
                                        <span>Отсутствует</span>
                                    </div>
                                    <Autocomplete
                                        freeSolo
                                        options={representatives}
                                        getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                                        onInputChange={(_, value) => {
                                            searchRepresentatives(value);
                                            setFormData({ ...formData, representativeName: value });
                                        }}
                                        value={formData.representativeName}
                                        disabled={representativeSameAsApplicant || representativeAbsent}
                                        renderInput={(params) => <TextField {...params} className="bordered-field" required={!representativeAbsent} />}
                                    />
                                </FormControl>
                            </div>
                        )}

                        <div className="task-row">
                            <span className="task-label">Модификации:</span>
                            <FormControl fullWidth className="edit-form-control">
                                <TextField
                                    value={formData.modifications}
                                    onChange={(e) => setFormData({ ...formData, modifications: e.target.value })}
                                    className="bordered-field"
                                />
                            </FormControl>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Коммерческие наименования:</span>
                            <FormControl fullWidth className="edit-form-control">
                                <TextField
                                    value={formData.commercialNames}
                                    onChange={(e) => setFormData({ ...formData, commercialNames: e.target.value })}
                                    className="bordered-field"
                                />
                            </FormControl>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Раздел (пункт, подпункт) стандарта:</span>
                            <FormControl fullWidth className="edit-form-control">
                                <TextField
                                    value={formData.standardSection}
                                    onChange={(e) => setFormData({ ...formData, standardSection: e.target.value })}
                                    className="bordered-field"
                                    required
                                />
                            </FormControl>
                        </div>
                        <div className="task-row">
                            <span className="task-label">Исполнитель:</span>
                            <FormControl fullWidth className="edit-form-control">
                                <Select
                                    value={formData.assignedUserId || ''}
                                    onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value || null })}
                                    displayEmpty
                                >
                                    <MenuItem value=""><em>Не назначен</em></MenuItem>
                                    {experts.map((expert) => (
                                        <MenuItem key={expert.id} value={expert.id}>
                                            {formatExpertName(expert)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeclarationEditPage;
