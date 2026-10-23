import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || '{}');
  const ehAdmin = usuarioLogado.administrador === true;

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <h2>TITAN CONTROL</h2>
          <span style={{ fontSize: '12px', color: 'var(--gold)' }}>
            {ehAdmin ? 'Administrador' : 'Funcionário'}
          </span>
        </div>

        <nav className="sidebar-nav">
          {/* Opções visíveis APENAS para Administradores */}
          {ehAdmin && (
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
          )}

          {/* Opção visível para TODOS (Vendas/PDV) */}
          <NavLink to="/vendas" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
            <ShoppingCart size={20} /> Vendas
          </NavLink>

          {/* Opções visíveis APENAS para Administradores */}
          {ehAdmin && (
            <>
              <NavLink to="/produtos" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                <Package size={20} /> Produtos
              </NavLink>
              <NavLink to="/usuarios" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                <Users size={20} /> Gestão de Usuários
              </NavLink>
              <NavLink to="/configuracoes" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                <Settings size={20} /> Configurações
              </NavLink>
            </>
          )}
        </nav>
      </div>

      <button onClick={handleLogout} className="logout-btn">
        <LogOut size={20} /> Sair ({usuarioLogado.nome?.split(' ')[0] || ''})
      </button>
    </aside>
  );
};