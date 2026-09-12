import React, {useEffect} from 'react';
import { BrowserRouter } from 'react-router-dom';
import { loginSuccess } from 'redux/store/auth/Action';
import { useDispatch } from "react-redux";
import routes, { renderRoutes } from './routes';
import "global.css"

const App = () => {
  const userData = JSON.parse(localStorage.getItem('users'));
  const dispatch = useDispatch()

 

 useEffect(() => {
  const localUser = JSON.parse(localStorage.getItem("users"));
  if (localUser) {
    dispatch({ type: "LOGIN_SUCCESS", payload: localUser });
  }

  // Initialize theme class on startup
  const theme = localStorage.getItem('theme') || 'light';
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}, []);

  return (
    <BrowserRouter basename="/realestate">
      {renderRoutes(routes)}
    </BrowserRouter>
  );
};

export default App;