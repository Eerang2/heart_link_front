import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './router/routes';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
