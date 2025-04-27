import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById, updateUserRoles } from '../../services/users';
import { useAuth } from '../../context/AuthContext';
import './UserDetailPage.css';
import BackspaceIcon from '@mui/icons-material/Backspace';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';

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
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoles, setEditedRoles] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);

  const allRoles = ['EXPERT', 'DIRECTOR', 'REGISTRAR', 'ACCOUNTANT', 'EMPTY'];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(id);
        setUser(response.data);
        setEditedRoles(response.data.roles);
      } catch (error) {
        if (error.response?.status === 403) {
          navigate('/', { replace: true });
        }
        console.error('Ошибка загрузки пользователя:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  useEffect(() => {
    setAvailableRoles(allRoles.filter(role => !editedRoles.includes(role)));
  }, [editedRoles]);

  const handleAddRole = (role) => {
    setEditedRoles(prev => [...prev, role]);
    setAnchorEl(null);
  };

  const handleRemoveRole = (roleToRemove) => {
    setEditedRoles(prev => prev.filter(role => role !== roleToRemove));
  };

  const handleSave = async () => {
    try {
      await updateUserRoles(id, editedRoles);
      const updatedUser = await getUserById(id);
      setUser(updatedUser.data);
      setSnackbar({ open: true, message: 'Роли успешно обновлены!', severity: 'success' });
      setIsEditing(false);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Ошибка обновления ролей', 
        severity: 'error' 
      });
    }
  };

  const handleCancel = () => {
    setEditedRoles(user.roles);
    setIsEditing(false);
  };

  if (loading) return <div>Загрузка...</div>;
  
  if (!user) return (
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
  );

  return (
    <div className="page-wrapper">
      <div className="content-container">
        <h2 className="page-title">Профиль пользователя</h2>
        <div className="user-detail">
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
            <div className="roles-header">
              <span className="info-label">Роли:</span>
              {currentUser?.roles?.includes('DIRECTOR') && (
                <>
                  {isEditing ? (
                    <Button 
                      variant="contained" 
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                      className="add-role-btn"
                    >
                      Добавить роль
                    </Button>
                  ) : (
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setIsEditing(true)}
                    >
                      Редактировать
                    </Button>
                  )}
                </>
              )}
            </div>
            <div className="roles-container">
              {(isEditing ? editedRoles : user.roles).map(role => (
                <Chip
                  key={role}
                  label={translateRole(role)}
                  className="role-chip"
                  onDelete={isEditing ? () => handleRemoveRole(role) : null}
                  deleteIcon={<CloseIcon />}
                />
              ))}
            </div>
            {isEditing && (
              <div className="edit-controls">
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleSave}
                  className="save-btn"
                >
                  Сохранить
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleCancel}
                  className="cancel-btn"
                >
                  Отмена
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {availableRoles.map(role => (
          <MenuItem
            key={role}
            onClick={() => handleAddRole(role)}
            className="role-menu-item"
          >
            {translateRole(role)}
          </MenuItem>
        ))}
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} className="custom-alert">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserDetailPage;