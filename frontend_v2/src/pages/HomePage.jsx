import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import './HomePage.css'; // Создайте новый файл стилей

export default function HomePage() {
  return (
    <div className="page-wrapper">
      <div className="content-container">
        <Typography 
          variant="h3" 
          gutterBottom 
          className="page-title"
          sx={{
            color: 'var(--deep-frost)',
            borderBottom: '2px solid var(--silver-accent)',
            paddingBottom: '15px'
          }}
        >
          Welcome to Task Manager
        </Typography>
        
        {/* Добавьте дополнительный контент при необходимости */}
      </div>
    </div>
  );
}