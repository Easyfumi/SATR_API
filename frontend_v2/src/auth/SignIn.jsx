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
  CircularProgress
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
      setError('Invalid email or password');
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="signin-container" component="main" maxWidth="xs">
      <Avatar className="signin-avatar">
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5" className="signin-title">
        Sign in
      </Typography>
      <form className="signin-form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          required
          label="Email Address"
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
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="signin-input"
          margin="normal"
          disabled={isSubmitting}
        />
        {error && (
          <Typography color="error" variant="body2" className="signin-error">
            {error}
          </Typography>
        )}
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
            'Sign In'
          )}
        </Button>
        <Grid container className="signin-links">
          <Grid item xs>
            <Link href="#!" variant="body2">
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <Link href="/signup" variant="body2">
              Don't have an account? Sign Up
            </Link>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}