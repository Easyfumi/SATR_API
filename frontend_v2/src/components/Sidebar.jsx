import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", text: "Главная", icon: <HomeIcon className="sidebar-icon" /> },
    { path: "/profile", text: "Профиль", icon: <PersonIcon className="sidebar-icon" /> },
    { path: "/history", text: "История", icon: <HistoryIcon className="sidebar-icon" /> },
    { path: "/settings", text: "Настройки", icon: <SettingsIcon className="sidebar-icon" /> },
  ];

  return (
    <div className="sidebar-container">
      <List component="nav" className="sidebar-toolbar">
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            className={`sidebar-button ${location.pathname === item.path ? 'active' : ''}`}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );
};

export default Sidebar;