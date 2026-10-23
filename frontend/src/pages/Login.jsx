import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await api.get('/usuarios');
      const usuarios = response.data;

      const usuarioValido = usuarios.find(
        (u) => u.cpf === cpf && u.senha === senha && u.status === true
      );

      if (usuarioValido) {
        // Salva a sessão no navegador
        localStorage.setItem('usuario', JSON.stringify(usuarioValido));

        // Redireciona: Admins vão para Dashboard, Funcionários direto para Vendas
        if (usuarioValido.administrador) {
          navigate('/dashboard');
        } else {
          navigate('/vendas');
        }
      } else {
        alert('CPF, senha incorretos ou usuário inativo.');
      }
    } catch (error) {
      console.error('Erro ao efetuar login:', error);
      alert('Erro ao conectar com o servidor.');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f2f2f2' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '8px', border: '1px solid #ccc', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
        <h1>TITAN CONTROL</h1>
        <h3 style={{ color: 'var(--gold)', fontSize: '14px', marginBottom: '30px' }}>
          FORÇA NA GESTÃO, AGILIDADE NAS VENDAS
        </h3>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="CPF do Colaborador"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
          />

          <div style={{ display: 'flex', gap: '5px' }}>
            <input
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              style={{ padding: '0 10px', fontSize: '12px', cursor: 'pointer' }}
            >
              {mostrarSenha ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '12px' }}>
            ENTRAR
          </button>
        </form>
      </div>
    </div>
  );
}