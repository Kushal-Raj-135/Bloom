import "./index.css"
import React from 'react';
import ReactDOM from 'react-dom/client';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element not found");
}
import App from './App';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);