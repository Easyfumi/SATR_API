import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById, updateUserRoles } from '../../services/users';
import { useAuth } from '../../context/AuthContext';
import './UserDetailPage.css';
import BackspaceIcon from '@mui/icons-material/Backspace';
import IconButton from '@mui/material/IconButton';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const allRoles = ['EXPERT', 'DIRECTOR', 'REGISTRAR', 'ACCOUNTANT', 'EMPTY'];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(id);
        setUser(response.data);
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

  const handleEditRoles = () => {
    setSelectedRoles([...user.roles]);
    setEditModalOpen(true);
  };

  const handleRoleChange = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role) 
        : [...prev, role]
    );
  };

  const handleSaveRoles = async () => {
    try {
      await updateUserRoles(id, selectedRoles);
      const updatedUser = await getUserById(id);
      setUser(updatedUser.data);
      setSnackbar({ open: true, message: 'Роли успешно обновлены!', severity: 'success' });
      setEditModalOpen(false);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Ошибка обновления ролей', 
        severity: 'error' 
      });
    }
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
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={handleEditRoles}
                >
                  Изменить роли
                </Button>
              )}
            </div>
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

      {/* Модальное окно редактирования ролей */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Редактирование ролей</DialogTitle>
        <DialogContent>
          {allRoles.map(role => (
            <FormControlLabel
              key={role}
              control={
                <Checkbox
                  checked={selectedRoles.includes(role)}
                  onChange={() => handleRoleChange(role)}
                  color="primary"
                />
              }
              label={translateRole(role)}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Отмена</Button>
          <Button onClick={handleSaveRoles} color="primary">Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserDetailPage;