import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    nome: '',
    senha: '',
    cpf: '',
    status: true,
    administrador: false
  });

  // Busca lista de usuários
  async function carregarUsuarios() {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // Cadastrar Usuário
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post('/usuarios', form);
      setForm({ nome: '', senha: '', cpf: '', status: true, administrador: false });
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
    }
  }

  // Mudar Senha (PATCH)
  async function handleMudarSenha(id, nome) {
    const novaSenha = prompt(`Digite a nova senha para ${nome}:`);
    if (!novaSenha) return;

    try {
      await api.patch(`/usuarios/${id}`, { senha: novaSenha });
      alert('Senha atualizada com sucesso!');
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
    }
  }

  // Toggle de Status (Ativo/Inativo)
  async function handleToggleStatus(id, currentStatus) {
    try {
      await api.patch(`/usuarios/${id}`, { status: !currentStatus });
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h2>Gerenciamento de Usuários</h2>
        <br />

        {/* Form de Cadastro */}
        <div className="form-container">
          <h3>Cadastrar Novo Colaborador</h3>
          <br />
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label>Nome:</label>
              <input
                type="text"
                required
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div>
              <label>CPF:</label>
              <input
                type="text"
                required
                value={form.cpf}
                onChange={e => setForm({ ...form, cpf: e.target.value })}
              />
            </div>
            <div>
              <label>Senha:</label>
              <input
                type="password"
                required
                value={form.senha}
                onChange={e => setForm({ ...form, senha: e.target.value })}
              />
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={form.administrador}
                  onChange={e => setForm({ ...form, administrador: e.target.checked })}
                />
                {' '}Administrador
              </label>
            </div>
            <button type="submit" className="btn-primary">Cadastrar</button>
          </form>
        </div>

        {/* Tabela de Usuários */}
        <p><strong>Quantidade de usuários: <span style={{ color: 'var(--gold)' }}>{usuarios.length}</span></strong></p>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nome}</td>
                <td>{user.cpf}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.status}
                      onChange={() => handleToggleStatus(user.id, user.status)}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
                <td>
                  <button
                    className="btn-primary"
                    onClick={() => handleMudarSenha(user.id, user.nome)}
                  >
                    Mudar Senha
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}