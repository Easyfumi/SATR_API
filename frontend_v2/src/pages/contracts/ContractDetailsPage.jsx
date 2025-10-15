import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './ContractDetailsPage.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ContractDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const response = await api.get(`/api/contracts/${id}`);
                setContract(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching contract:', error);
                setError('Ошибка загрузки данных договора');
            } finally {
                setLoading(false);
            }
        };
        fetchContract();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить этот договор? Это действие нельзя отменить.')) {
            try {
                await api.delete(`/api/contracts/${id}`);
                navigate('/api/contracts');
            } catch (error) {
                console.error('Error deleting contract:', error);
                alert('Ошибка при удалении договора: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Не указана';
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    const getPaymentStatusLabel = (status) => {
        const statusLabels = {
            'PAIDFOR': 'Оплачен',
            'PARTIALLYPAIDFOR': 'Оплачен частично',
            'NOTPAIDFOR': 'Не оплачен'
        };
        return statusLabels[status] || status;
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PAIDFOR': return 'paid';
            case 'PARTIALLYPAIDFOR': return 'partially-paid';
            case 'NOTPAIDFOR': return 'not-paid';
            default: return '';
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!contract) return <div className="error-message">Договор не найден</div>;

    return (
        <div className="content-container">
            <div className="contract-details">
                {/* Хедер с навигацией и действиями */}
                <div className="details-header">
                    <div className="header-navigation">
                        <button 
                            className="back-button"
                            onClick={() => navigate('/api/contracts')}
                        >
                            <ArrowBackIcon />
                            Назад к списку
                        </button>
                    </div>
                    
                    <div className="header-actions">
                        <Link
                            to={`/api/contracts/edit/${contract.id}`}
                            className="edit-button"
                        >
                            <EditIcon />
                            Редактировать
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="delete-button"
                        >
                            <DeleteIcon />
                            Удалить
                        </button>
                    </div>
                </div>

                {/* Основная информация */}
                <div className="details-content">
                    <div className="contract-main-info">
                        <h1 className="contract-title">Договор № {contract.number}</h1>
                        
                        <div className="status-badge-container">
                            <span className={`payment-status-badge ${getStatusBadgeClass(contract.paymentStatus)}`}>
                                {getPaymentStatusLabel(contract.paymentStatus)}
                            </span>
                        </div>
                    </div>

                    {/* Детальная информация */}
                    <div className="details-grid">
                        <div className="detail-section">
                            <h3>Основная информация</h3>
                            <div className="detail-items">
                                <div className="detail-item">
                                    <span className="detail-label">Номер договора:</span>
                                    <span className="detail-value">{contract.number}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Дата договора:</span>
                                    <span className="detail-value">{formatDate(contract.date)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Заявитель:</span>
                                    <span className="detail-value">
                                        {contract.applicant ? contract.applicant.name : 'Не указан'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Комментарии */}
                        {contract.comments && (
                            <div className="detail-section">
                                <h3>Комментарий</h3>
                                <div className="comments-content">
                                    <p>{contract.comments}</p>
                                </div>
                            </div>
                        )}

                        {/* Связанная задача (если есть) */}
                        {contract.tasks && (
                            <div className="detail-section">
                                <h3>Связанная задача</h3>
                                <div className="detail-items">
                                    <div className="detail-item">
                                        <span className="detail-label">Номер задачи:</span>
                                        <span className="detail-value">
                                            {contract.tasks.number || `#${contract.tasks.id}`}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Марка ТС:</span>
                                        <span className="detail-value">{contract.tasks.mark}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Тип ТС:</span>
                                        <span className="detail-value">{contract.tasks.typeName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Статус задачи:</span>
                                        <span className="detail-value">
                                            {contract.tasks.status || 'Не указан'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Мета-информация */}
                        <div className="detail-section">
                            <h3>Системная информация</h3>
                            <div className="detail-items">
                                <div className="detail-item">
                                    <span className="detail-label">ID договора:</span>
                                    <span className="detail-value">{contract.id}</span>
                                </div>
                                {contract.createdAt && (
                                    <div className="detail-item">
                                        <span className="detail-label">Создан:</span>
                                        <span className="detail-value">
                                            {new Date(contract.createdAt).toLocaleString('ru-RU')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractDetailsPage;