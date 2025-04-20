import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../services/adminService';
import './UsersPage.css';

const UsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="page-wrapper">
      <div className="content-container">
        <h2 className="page-title">Управление пользователями</h2>
        
        <div className="users-list">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-info">
                <p>{user.secondName} {user.firstName} {user.patronymic}</p>
                <p className="user-email">{user.email}</p>
              </div>
              <div className="user-roles">
                {user.roles.map(role => (
                  <span key={role} className="role-badge">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;