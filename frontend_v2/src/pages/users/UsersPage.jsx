import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../../services/users';
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';
import './UsersPage.css';


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



const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data);
      } catch (error) {
        if (error.response?.status === 403) {
          navigate('/', { replace: true });
        }
        // убрать потом
        console.error('Ошибка загрузки пользователей:', error);
      }
    };
    
    fetchUsers();
  }, [navigate]);



  return (
    <div className="page-wrapper">
      <div className="content-container">
        <h2 className="page-title">Список пользователей</h2>
        <div className="users-list">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="card-header">
                <IconButton 
                  component={Link}
                  to={`/users/${Number(user.id)}`}
                  className="settings-icon"
                  aria-label="settings"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SettingsIcon />
                </IconButton>
              </div>
              
              <div className="profile-info">
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;