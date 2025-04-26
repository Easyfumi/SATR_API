import { useAuth } from '../context/AuthContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <AppBar position="static" className="navbar-container">
      <Toolbar className="navbar-toolbar">
        {/* Левая часть - логотип и название */}
        <Box className="navbar-left-section">
          <img
            src="/images/logo.svg"
            alt="Логотип САТР-Фонд"
            className="navbar-logo"
          />
          <Typography className="navbar-title">
            Межотраслевой фонд "Сертификация автотранспорта САТР" ("САТР-Фонд")
          </Typography>
        </Box>

        {/* Правая часть - ФИО и кнопка выхода */}
        <Box className="navbar-right-section">
          <Typography className="navbar-user-name">
            {`${user.secondName} ${user.firstName[0]}.${user.patronymic ? ` ${user.patronymic[0]}.` : ''}`}
          </Typography>
          
          <Button
            className="navbar-logout-button"
            startIcon={<LogoutIcon className="logout-icon" />}
            onClick={logout}
          >
            Выход
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}