import { useAuth } from '../context/AuthContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// Укажите правильный путь к логотипу

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Левая часть - логотип и название*/}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src="/images/logo.svg"
            alt="Логотип САТР-Фонд"
            style={{
              height: '70px',
              filter: 'brightness(0) invert(1)' // Для белого логотипа
            }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              display: { xs: 'none', md: 'block' },
              whiteSpace: 'nowrap'
            }}
          >
            Межотраслевой фонд "Сертификация автотранспорта САТР" ("САТР-Фонд")
          </Typography>
        </Box>

        {/* Правая часть - ФИО и кнопка выхода*/}


        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" component="div">
            {`${user.secondName} ${user.firstName}${user.patronymic ? ` ${user.patronymic}` : ''}`}
          </Typography>
          <Button
            color="inherit"
            onClick={logout}
            sx={{
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '4px',
              padding: '6px 16px'
            }}
          >
            Выйти
          </Button>
        </Box>



      </Toolbar>
    </AppBar>
  );
}