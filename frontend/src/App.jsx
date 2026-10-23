import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Produtos from './pages/Produtos';
import Vendas from './pages/Vendas';
import Configuracoes from './pages/Configuracoes';

// Componente para rotas privadas
function RotaPrivada({ children, apenasAdmin = false }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (apenasAdmin && !usuario.administrador) {
    return <Navigate to="/vendas" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Rotas Protegidas - Apenas Admin */}
        <Route path="/configuracoes" element={
        <RotaPrivada>
            <Configuracoes />
          </RotaPrivada>
        } />
        <Route path="/dashboard" element={
          <RotaPrivada apenasAdmin={true}>
            <Dashboard />
          </RotaPrivada>
        } />
        <Route path="/usuarios" element={
          <RotaPrivada apenasAdmin={true}>
            <Usuarios />
          </RotaPrivada>
        } />
        <Route path="/produtos" element={
          <RotaPrivada apenasAdmin={true}>
            <Produtos />
          </RotaPrivada>
        } />

        {/* Rota Protegida - Todos os colaboradores logados */}
        <Route path="/vendas" element={
          <RotaPrivada>
            <Vendas />
          </RotaPrivada>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}