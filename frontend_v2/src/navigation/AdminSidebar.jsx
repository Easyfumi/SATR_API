import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import './AdminSidebar.css';
import './Sidebar.css';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/users/all", text: "Пользователи", icon: <PeopleIcon /> },
  ];

  return (
    <div className="admin-sidebar-container">
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

export default AdminSidebar;