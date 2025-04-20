import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Grid,
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
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await signUp({
        firstName: formData.firstName,
        patronymic: formData.patronymic,
        secondName: formData.secondName,
        email: formData.email,
        password: formData.password
      });
      navigate('/signin');
    } catch (err) {
      let errorMessage = 'Registration failed';

      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      }

      setError(errorMessage);
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container className="signup-container" component="main" maxWidth="xs">
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Avatar className="signup-avatar">
        <PersonAddIcon />
      </Avatar>
      </div>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Typography component="h1" variant="h4" className="signup-title">
        Регистрация
      </Typography>
      </div>
      
      <form className="signup-form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Фамилия"
              value={formData.secondName}
              onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
              className="signup-input"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Имя"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="signup-input"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Отчество"
              value={formData.patronymic}
              onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
              className="signup-input"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="signup-input"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Пароль"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="signup-input"
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          className="signup-button"
        >
          Зарегестрироваться
        </Button>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Link href="/signin" variant="body2">
              Вернуться на страницу авторизации
            </Link>
          </Grid>
        </Grid>
      </form>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}