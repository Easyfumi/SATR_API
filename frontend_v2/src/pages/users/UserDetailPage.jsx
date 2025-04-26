import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById } from '../../services/users';
import './UserDetailPage.css';
import BackspaceIcon from '@mui/icons-material/Backspace';
import IconButton from '@mui/material/IconButton';
import { Link } from 'react-router-dom';

const translateRole = (role) => {
    const rolesMap = {
        'EXPERT': 'Эксперт',
        'DIRECTOR': 'Руководитель',
        'REGISTRAR': 'Регистрация',
        'ACCOUNTANT': 'Бухгалтерия',
        'EMPTY': 'Гость'
    };
    return rolesMap[role] || role;
};

const UserDetailPage = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getUserById(id);
                setUser(response.data);
            } catch (error) {
                console.error('Ошибка загрузки пользователя:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    if (loading) return <div>Загрузка...</div>;
    if (!user) return <div>
        <div className="page-wrapper">
            <div className="content-container">
                <h2 className="page-title">Профиль с таким id не найден</h2>
                <div className="user-detail">
                <div className="card-header">
                        <IconButton
                            component={Link}
                            to={`/all`}
                            className="back-icon"
                            aria-label="back"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <BackspaceIcon />
                        </IconButton>
                    </div>

                </div>
            </div>
        </div>
    </div>;

    return (
        <div className="page-wrapper">
            <div className="content-container">
                <h2 className="page-title">Профиль пользователя</h2>
                <div className="user-detail">
                    {/* Добавьте необходимые поля аналогично Profile.js */}
                    <div className="info-row">
                        <span className="info-label">ФИО:</span>
                        <span className="info-value">
                            {user.secondName} {user.firstName} {user.patronymic}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{user.email}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Роли:</span>
                        <div className="roles-container">
                            {user.roles.map(role => (
                                <span key={role} className="role-badge">
                                    {translateRole(role)}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;