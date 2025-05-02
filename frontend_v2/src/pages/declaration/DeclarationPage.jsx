// DeclarationPage.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './DeclarationPage.css';

const DeclarationPage = () => {
    const location = useLocation();
    // Навигационные кнопки
    const navItems = [
        { path: '/tasks', label: 'ОТТС / ОТШ' },
        { path: '/decl', label: 'Декларации' },
        { path: '/serts', label: 'Сертификаты' }
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
                <h2 className="page-title">Раздел "Декларации" в разработке</h2>
            </div>
        </div>
    )
};

export default DeclarationPage;