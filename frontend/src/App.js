import Home from "./page/home/home";
import Navbar from "./page/navbar/navbar";



const { ThemeProvider } = require("@mui/material");
const { whiteTheme } = require("./theme/whitetheme");


function App() {
  return (
    <ThemeProvider theme={whiteTheme}> 
    <Navbar/>
    <Home/>
    </ThemeProvider>
  );
}

export default App;
