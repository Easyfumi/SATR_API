import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { canModifyTasks } from '../../utils/roleUtils';
import AccessDenied from '../../components/AccessDenied';
import { VehicleCategories } from '../../constants/vehicleCategories';
import DuplicateCheckModal from '../tasks/DuplicateCheckModal';
import '../tasks/CreateTaskPage.css';

const declarationStatusLabels = {
    RECEIVED: 'Заявка получена',
    JOURNAL_REGISTERED: 'Заявка зарегистрирована в журнале',
    FGIS_ENTERED: 'Заявка занесена во ФГИС',
    DECLARATION_REGISTERED: 'Декларация зарегистрирована'
};

const CreateDeclarationPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [experts, setExperts] = useState([]);

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

    const [applicants, setApplicants] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [representatives, setRepresentatives] = useState([]);

    const [manufacturerSameAsApplicant, setManufacturerSameAsApplicant] = useState(false);
    const [representativeSameAsApplicant, setRepresentativeSameAsApplicant] = useState(false);
    const [representativeAbsent, setRepresentativeAbsent] = useState(false);

    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicates, setDuplicates] = useState([]);
    const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
    const [pendingRequest, setPendingRequest] = useState(null);

    const formatExpertName = (expert) => {
        if (!expert) return '';
        return expert.patronymic
            ? `${expert.secondName} ${expert.firstName[0]}.${expert.patronymic[0]}.`
            : `${expert.secondName} ${expert.firstName[0]}.`;
    };

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
        if (manufacturerSameAsApplicant) {
            setFormData((prev) => ({ ...prev, manufacturerName: prev.applicantName }));
        }
    }, [manufacturerSameAsApplicant, formData.applicantName]);

    useEffect(() => {
        if (representativeSameAsApplicant) {
            setFormData((prev) => ({ ...prev, representativeName: prev.applicantName }));
        }
    }, [representativeSameAsApplicant, formData.applicantName]);

    useEffect(() => {
        if (representativeAbsent) {
            setRepresentativeSameAsApplicant(false);
            setFormData((prev) => ({ ...prev, representativeName: '' }));
        }
    }, [representativeAbsent]);

    useEffect(() => {
        if (manufacturerSameAsApplicant) {
            setFormData((prev) => ({
                ...prev,
                representativeName: '',
                manufacturerName: prev.applicantName
            }));
            setRepresentativeSameAsApplicant(false);
            setRepresentativeAbsent(false);
        }
    }, [manufacturerSameAsApplicant, formData.applicantName]);

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

    useEffect(() => {
        const fetchExperts = async () => {
            const response = await api.get('/users/experts');
            setExperts(response.data);
        };
        fetchExperts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsCheckingDuplicates(true);
        try {
            const request = {
                ...formData,
                representativeName: representativeAbsent ? '' : formData.representativeName
            };
            setPendingRequest(request);
            await api.post('/declarations', request);
            navigate('/decl');
        } catch (error) {
            if (error.response?.status === 409) {
                setDuplicates(error.response.data.duplicates || []);
                setShowDuplicateModal(true);
            } else {
                alert('Ошибка при создании заявки: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setIsCheckingDuplicates(false);
        }
    };

    const handleForceCreate = async () => {
        if (!pendingRequest) return;
        await api.post('/declarations/create', pendingRequest);
        setShowDuplicateModal(false);
        navigate('/decl');
    };

    if (!canModifyTasks(user)) {
        return <AccessDenied message="У вас нет доступа для создания заявок. Доступ имеют только пользователи с ролью 'Эксперт' или 'Руководитель'." />;
    }

    return (
        <div className="content-container">
            <div className="create-task-form">
                <h2 className="page-title">Регистрация декларации</h2>

                <DuplicateCheckModal
                    open={showDuplicateModal}
                    onClose={() => setShowDuplicateModal(false)}
                    duplicates={duplicates}
                    onForceCreate={handleForceCreate}
                    isLoading={isCheckingDuplicates}
                    itemPathPrefix="/decl"
                    title="Найдены дубликаты деклараций"
                    description="Обнаружены декларации с аналогичными данными:"
                    forceLabel="Все равно зарегистрировать"
                    statusLabels={declarationStatusLabels}
                />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-row">
                        <label className="form-label">Заявитель:</label>
                        <FormControl fullWidth>
                            <Autocomplete
                                freeSolo
                                options={applicants}
                                getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                                onInputChange={(_, value) => {
                                    searchApplicants(value);
                                    setFormData({ ...formData, applicantName: value });
                                }}
                                onOpen={() => {
                                    if (applicants.length === 0) {
                                        api.get('/applicants/search')
                                            .then((response) => setApplicants(response.data))
                                            .catch(() => {});
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
                                getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                                onInputChange={(_, value) => {
                                    searchManufacturers(value);
                                    handleManufacturerChange(value);
                                }}
                                onOpen={() => {
                                    if (manufacturers.length === 0) {
                                        api.get('/manufacturers/search')
                                            .then((response) => setManufacturers(response.data))
                                            .catch(() => {});
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
                                <div className="checkbox-container">
                                    <Checkbox
                                        checked={representativeAbsent}
                                        onChange={(e) => setRepresentativeAbsent(e.target.checked)}
                                    />
                                    <span>Отсутствует</span>
                                </div>
                                <Autocomplete
                                    freeSolo
                                    options={representatives}
                                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                                    onInputChange={(_, value) => {
                                        searchRepresentatives(value);
                                        handleRepresentativeChange(value);
                                    }}
                                    onOpen={() => {
                                        if (representatives.length === 0) {
                                            api.get('/representatives/search')
                                                .then((response) => setRepresentatives(response.data))
                                                .catch(() => {});
                                        }
                                    }}
                                    value={formData.representativeName}
                                    disabled={representativeSameAsApplicant || representativeAbsent}
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
                                            required={!representativeAbsent}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                    )}

                    <div className="form-row">
                        <label className="form-label">Категория ТС:</label>
                        <FormControl fullWidth>
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
                                                <Chip
                                                    key={value}
                                                    label={getCategoryLabel(value)}
                                                    className="category-chip"
                                                />
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

                    <div className="form-row">
                        <label className="form-label">Марка:</label>
                        <input
                            type="text"
                            value={formData.mark}
                            onChange={(e) => setFormData({ ...formData, mark: e.target.value })}
                            className="form-input"
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
                        <label className="form-label">Модификации:</label>
                        <input
                            type="text"
                            value={formData.modifications}
                            onChange={(e) => setFormData({ ...formData, modifications: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    <div className="form-row">
                        <label className="form-label">Коммерческие наименования:</label>
                        <input
                            type="text"
                            value={formData.commercialNames}
                            onChange={(e) => setFormData({ ...formData, commercialNames: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    <div className="form-row">
                        <label className="form-label">Раздел (пункт, подпункт) стандарта:</label>
                        <input
                            type="text"
                            value={formData.standardSection}
                            onChange={(e) => setFormData({ ...formData, standardSection: e.target.value })}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label className="form-label">Исполнитель:</label>
                        <FormControl fullWidth>
                            <Select
                                value={formData.assignedUserId || ''}
                                onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value || null })}
                                displayEmpty
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
                        <Button variant="outlined" type="button" onClick={() => navigate('/decl')} className="cancel-btn">
                            Отмена
                        </Button>
                        <Button variant="contained" type="submit" className="save-btn" disabled={isCheckingDuplicates}>
                            {isCheckingDuplicates ? 'Проверка дубликатов...' : 'Создать заявку'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDeclarationPage;
