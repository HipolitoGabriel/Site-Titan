import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [novoProduto, setNovoProduto] = useState({ nome: '', descricao: '', preco: '', quantidade: '' });

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const produtoIdSelecionado = queryParams.get('id');

  async function carregarProdutos() {
    try {
      const response = await api.get('/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function handleCadastrar(e) {
    e.preventDefault();
    try {
      await api.post('/produtos', {
        ...novoProduto,
        preco: Number(novoProduto.preco),
        quantidade: Number(novoProduto.quantidade),
      });
      setNovoProduto({ nome: '', descricao: '', preco: '', quantidade: '' });
      setModalAberto(false);
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
    }
  }

  async function handleExcluir(id) {
    if (confirm(`Deseja realmente excluir o produto ID ${id}?`)) {
      try {
        await api.delete(`/produtos/${id}`);
        carregarProdutos();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Gerenciamento de Produtos</h2>
          <button className="btn-primary" onClick={() => setModalAberto(true)}>
            + Cadastrar Produto
          </button>
        </div>

        {/* Modal de Cadastro de Produtos */}
        {modalAberto && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 100 }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '400px' }}>
              <h3>Novo Produto</h3>
              <br />
              <form onSubmit={handleCadastrar} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Nome"
                  required
                  value={novoProduto.nome}
                  onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Descrição"
                  value={novoProduto.descricao}
                  onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Preço (R$)"
                  required
                  value={novoProduto.preco}
                  onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Quantidade"
                  required
                  value={novoProduto.quantidade}
                  onChange={(e) => setNovoProduto({ ...novoProduto, quantidade: e.target.value })}
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" className="btn-primary">Salvar</button>
                  <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '10px', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grid de Cards de Produtos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {produtos.map((p) => {
            const ehSelecionado = String(p.id) === String(produtoIdSelecionado);
            return (
              <div
                key={p.id}
                style={{
                  border: ehSelecionado ? '3px solid #2563eb' : '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '15px',
                  background: '#fff',
                  boxShadow: ehSelecionado ? '0 0 10px rgba(37,99,235,0.3)' : 'none',
                }}
              >
                <h4>{p.nome}</h4>
                <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>{p.descricao}</p>
                <p><strong>Preço:</strong> R$ {p.preco}</p>
                <p><strong>Estoque:</strong> {p.quantidade} un.</p>
                <button
                  onClick={() => handleExcluir(p.id)}
                  style={{ marginTop: '10px', background: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Excluir
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}