import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="admin-sidebar-container">
      <List component="nav" className="admin-sidebar-toolbar">
        <ListItemButton
          component={Link}
          to="/all"
          className={`admin-sidebar-button ${location.pathname === '/all' ? 'active' : ''}`}
        >
          <ListItemIcon>
            <PeopleIcon className="admin-sidebar-icon" />
          </ListItemIcon>
          <ListItemText primary="Все пользователи" />
        </ListItemButton>
      </List>
    </div>
  );
};

export default AdminSidebar;