import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Snackbar,
  Alert,
  Avatar
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { signUp } from '../services/auth';
import './SignUp.css';

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    patronymic: '',
    secondName: '',
    email: '',
    password: '',
    agreeTerms: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess(false);
      await signUp({
        firstName: formData.firstName,
        patronymic: formData.patronymic,
        secondName: formData.secondName,
        email: formData.email,
        password: formData.password
      });
      
      // Показываем сообщение об успехе
      setSuccess(true);
      setSnackbarMessage('Регистрация успешно завершена! Перенаправление на страницу авторизации...');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // Перенаправляем через небольшую задержку, чтобы пользователь увидел сообщение
      setTimeout(() => {
        navigate('/signin', { replace: true });
      }, 1500);
    } catch (err) {
      let errorMessage = 'Не удалось выполнить регистрацию';

      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      }

      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container className="signup-container" component="main" maxWidth="xs">

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Avatar className="signup-avatar" sx={{ m: 1 }}>
          <PersonAddIcon />
        </Avatar>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
          Регистрация
        </Typography>
      </div>

      <form className="signup-form" onSubmit={handleSubmit} >
        <TextField
          fullWidth
          required
          autoFocus
          margin="normal"
          label="Фамилия"
          variant="outlined"
          className="signup-input"
          value={formData.secondName}
          onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
        />
        <TextField
          required
          fullWidth
          label="Имя"
          variant="outlined"
          margin="normal"
          className="signup-input"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        />
        <TextField
          fullWidth
          label="Отчество"
          variant="outlined"
          margin="normal"
          className="signup-input"
          value={formData.patronymic}
          onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
        />
        <TextField
          required
          fullWidth
          label="Email"
          type="email"
          variant="outlined"
          margin="normal"
          className="signup-input"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <TextField
          required
          fullWidth
          label="Пароль"
          type="password"
          variant="outlined"
          margin="normal"
          className="signup-input"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        {/* Кнопка регистрации */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          className="signup-button"
        >
          Зарегистрироваться
        </Button>
        {/* Ссылка на авторизацию */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link
            href="/signin"

            variant="body3"
            sx={{
              textAlign: 'center',
              width: '100%'
            }}
          >
            Вернуться на страницу авторизации
          </Link>
        </div>
      </form>


      <Snackbar
        open={openSnackbar}
        autoHideDuration={success ? 2000 : 6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}