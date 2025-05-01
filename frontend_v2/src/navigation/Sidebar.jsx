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
    { path: "/", text: "Главная", icon: <HomeIcon /> },
    { path: "/users/profile", text: "Профиль", icon: <PersonIcon /> },
    { path: "/history", text: "История", icon: <HistoryIcon /> },
    { path: "/settings", text: "Настройки", icon: <SettingsIcon /> },
  ];

  return (
    <div className="sidebar-container">
      <List component="nav" className="sidebar-toolbar">

      {menuItems.map((item) => {
  const isActive = location.pathname === item.path;
  return (
    <ListItemButton
      key={item.path}
      component={Link}
      to={item.path}
      className={`sidebar-button ${isActive ? 'active' : ''}`}
    >
      <ListItemIcon>
        {React.cloneElement(item.icon, {
          className: `sidebar-icon ${isActive ? 'active' : ''}`
        })}
      </ListItemIcon>
      <ListItemText primary={item.text} />
    </ListItemButton>
  );
})}
      </List>
    </div>
  );
};

export default Sidebar;