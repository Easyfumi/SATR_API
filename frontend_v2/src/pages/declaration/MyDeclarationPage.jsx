// MyDeclarationPage.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './DeclarationPage.css';

const MyDeclarationPage = () => {
    const location = useLocation();
    // Навигационные кнопки для "Мои заявки"
    const navItems = [
        { path: '/my-tasks', label: 'ОТТС / ОТШ' },
        { path: '/my-decl', label: 'Декларации' },
        { path: '/my-serts', label: 'Сертификаты' }
    ];
    return (
        <div className="content-container">
            <div className="tasks-header">
                <div className="nav-buttons-container">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-button ${location.pathname === item.path ? 'active' : ''
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
                <h2 className="page-title">Раздел "Мои декларации" в разработке</h2>
            </div>
        </div>
    )
};

export default MyDeclarationPage;
