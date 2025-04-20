import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Grid,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { signIn } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import './SignIn.css';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      const response = await signIn({ email, password });
      await login(response.data.jwt);
      navigate('/profile', { replace: true });
    } catch (err) {
      let errorMessage = 'An error occurred';
      
      // Добавляем проверку статуса ошибки
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else {
          errorMessage = err.response.data?.message || errorMessage;
        }
      }
      
      setError(errorMessage);
      setOpenSnackbar(true);
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container className="signin-container" component="main" maxWidth="xs">
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Avatar className="signin-avatar">
        <LockOutlinedIcon />
      </Avatar>
      </div>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Typography component="h1" variant="h4" className="signin-title">
        Авторизация
      </Typography>
      </div>
      
      <form className="signin-form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          required
          label="Email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="signin-input"
          margin="normal"
          disabled={isSubmitting}
        />
        <TextField
          fullWidth
          required
          label="Пароль"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="signin-input"
          margin="normal"
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          className="signin-button"
          disabled={!email || !password || isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Войти'
          )}
        </Button>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Grid container className="signin-links">
          <Grid item>
            <Link href="/signup" variant="body3">
              Зарегестрироваться
            </Link>
          </Grid>
        </Grid>
        </div>
        
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