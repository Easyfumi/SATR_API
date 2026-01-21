import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';

export default function AccessDenied({ message }) {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 2
        }}
      >
        <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Доступ запрещен
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {message || 'У вас нет прав для доступа к этой странице или выполнению этого действия.'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Вернуться на главную
        </Button>
      </Box>
    </Container>
  );
}
