import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from "./page/home/home";
import Navbar from './page/navbars/navbar';
import Auth from './page/auth/auth';



function App() {
 const theme = createTheme();
  return (
    <ThemeProvider theme={theme}> 
    {/* <Navbar/>
    <Home/> */}

    <Auth></Auth>
    </ThemeProvider>
  );
}

export default App;
