import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { 
      path: "/tasks",
      text: "Главная", 
      icon: <HomeIcon />,
      activePaths: ["/tasks", "/decl", "/serts"]
    },
    { path: "/users/profile", text: "Профиль", icon: <PersonIcon /> },
    { path: "/history", text: "История", icon: <HistoryIcon /> },
    { path: "/settings", text: "Настройки", icon: <SettingsIcon /> },
    { path: "/api/contracts", text: "Договоры", icon: <RequestQuoteIcon/> },
  ];

    const isActive = (item) => {
    if (item.activePaths) {
      return item.activePaths.some(path => 
        location.pathname.startsWith(path)
      );
    }
    return location.pathname === item.path;
  };

  return (
    <div className="sidebar-container">
      <List component="nav" className="sidebar-toolbar">
        {menuItems.map((item) => {
          const active = isActive(item);
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              className={`sidebar-button ${active ? 'active' : ''}`}
            >
              <ListItemIcon>
                {React.cloneElement(item.icon, {
                  className: `sidebar-icon ${active ? 'active' : ''}`
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