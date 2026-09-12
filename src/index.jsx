import React from 'react';
import { createRoot } from 'react-dom/client';
 
import store from './redux/Store';   

import { ConfigProvider } from './contexts/ConfigContext';
import { Provider } from "react-redux";
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>

  <ConfigProvider>
    <App />
  </ConfigProvider>
  </Provider>
);

reportWebVitals();
