import React from 'react';
import { Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function HomePage() {
  return (
    <Container maxWidth="md">
      <Typography variant="h3" gutterBottom>
        Welcome to Task Manager
      </Typography>
      <Typography variant="body1" paragraph>
        Please sign in to manage your tasks
      </Typography>
      <Button 
        variant="contained" 
        component={Link}
        to="/signin"
        sx={{ mt: 2 }}
      >
        Go to Sign In
      </Button>
    </Container>
  );
}