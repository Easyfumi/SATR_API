import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export default function AuthLayout({ children }) {
  return (
    <Box sx={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex',
      transformOrigin: '0 0',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      {/* Контейнер формы (20%) */}
      <Box sx={{
        width: '20%', // Изменили с 35% на 20%
        minWidth: 380, // Слегка уменьшили минимальную ширину
        height: '100%',
        overflow: 'auto',
        zIndex: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.97)',
        p: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '3px 0 15px rgba(0,0,0,0.1)' // Добавили тень для разделения
      }}>
        <Container sx={{
          width: '100%',
          maxWidth: '400px !important',
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }}>
          {children}
        </Container>
      </Box>

      {/* Контейнер изображения (80%) */}
      <Box sx={{
        width: '80%', // Явно указываем ширину
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <img
          src="/images/auth-bg.png"
          alt="Background"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '100%',
            minHeight: '100%',
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            filter: 'brightness(0.9)' // Улучшаем читаемость текста на фоне
          }}
        />
      </Box>
    </Box>
  );
}