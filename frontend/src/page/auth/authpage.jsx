import React, { useState } from 'react';
import { 
  Email, 
  Lock, 
  Person, 
  Visibility, 
  VisibilityOff,
  SwitchAccount
} from '@mui/icons-material';
import { 
  InputAdornment,
  IconButton,
  TextField,
  Button,
  Typography
} from '@mui/material';
import styles from './AuthPage.module.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const switchAuthMode = () => {
    setIsLogin((prev) => !prev);
    setError('');
  };

  const validateForm = () => {
    setError('');
    
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const authData = {
      email,
      password,
      action: isLogin ? 'login' : 'register'
    };
    
    console.log('Auth data:', authData);
    alert(JSON.stringify(authData, null, 2));
  };

  return (
    <div className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </Typography>

      <form onSubmit={handleSubmit} className={styles.form}>
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email fontSize="small" />
              </InputAdornment>
            ),
          }}
          className={styles.input}
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowPassword}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          className={styles.input}
        />

        {!isLogin && (
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock fontSize="small" />
                </InputAdornment>
              ),
            }}
            className={styles.input}
          />
        )}

        {error && (
          <Typography color="error" className={styles.error}>
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          type="submit"
          className={styles.button}
          startIcon={isLogin ? <Person /> : <SwitchAccount />}
        >
          {isLogin ? 'Sign In' : 'Register'}
        </Button>

        <Button
          fullWidth
          color="secondary"
          onClick={switchAuthMode}
          className={styles.switchButton}
          startIcon={<SwitchAccount />}
        >
          {isLogin 
            ? 'Create new account' 
            : 'Already have an account? Sign In'}
        </Button>
      </form>
    </div>
  );
};

export default AuthPage;