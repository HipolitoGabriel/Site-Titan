import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function Configuracoes() {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  async function handleAlterarSenha(e) {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      await api.patch(`/usuarios/${usuarioLogado.id}`, { senha: novaSenha });
      
      // Atualiza os dados salvos no localStorage do navegador
      const usuarioAtualizado = { ...usuarioLogado, senha: novaSenha };
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));

      alert('Sua senha foi alterada com sucesso!');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao atualizar a senha no servidor.');
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h2>Configurações do Perfil</h2>
        <br />

        {/* Card com os dados do Usuário */}
        <div className="form-container">
          <h3>Informações do Usuário</h3>
          <br />
          <p><strong>Nome:</strong> {usuarioLogado.nome}</p>
          <p><strong>CPF:</strong> {usuarioLogado.cpf}</p>
          <p><strong>Cargo:</strong> {usuarioLogado.administrador ? 'Administrador' : 'Funcionário'}</p>
        </div>

        {/* Formulário para Alteração de Senha */}
        <div className="form-container">
          <h3>Alterar Minha Senha</h3>
          <br />
          <form onSubmit={handleAlterarSenha} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
            <div>
              <label>Nova Senha:</label>
              <input
                type="password"
                required
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
            </div>

            <div>
              <label>Confirmar Nova Senha:</label>
              <input
                type="password"
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary">
              Atualizar Senha
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}