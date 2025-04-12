import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from "./page/home/home";
import Navbar from './page/navbars/navbar';



function App() {
 const theme = createTheme();
  return (
    <ThemeProvider theme={theme}> 
    <Navbar/>
    <Home/>
    </ThemeProvider>
  );
}

export default App;
