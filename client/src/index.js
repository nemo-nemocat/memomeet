import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createMuiTheme, ThemeProvider } from "@material-ui/core";



const theme = createMuiTheme({
  palette: {
     primary: {
        main: "#ffc31e" 
     },
     secondary: {
        main: "#000000" 
     },
    }
});

ReactDOM.render(
<ThemeProvider theme={theme}>
  <App />
  </ThemeProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
