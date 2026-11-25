import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [novoProduto, setNovoProduto] = useState({ nome: '', descricao: '', custo: '', preco: '', quantidade: '' });

  const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || 'null');
  const ehAdmin = usuarioLogado?.administrador === true;

  const location = useLocation();
  const navigate = useNavigate();
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
    if (!ehAdmin) return;

    try {
      await api.post('/produtos', {
        nome: novoProduto.nome,
        descricao: novoProduto.descricao,
        custo: novoProduto.custo !== '' ? Number(novoProduto.custo) : undefined,
        preco: Number(novoProduto.preco),
        quantidade: Number(novoProduto.quantidade),
        operadorId: usuarioLogado?.id,
        operadorNome: usuarioLogado?.nome
      });
      setNovoProduto({ nome: '', descricao: '', custo: '', preco: '', quantidade: '' });
      setModalAberto(false);
      carregarProdutos();
    } catch (error) {
      alert(error.response?.data?.mensagem || 'Erro ao cadastrar produto.');
    }
  }

  async function handleExcluir(id) {
    if (!ehAdmin) return;
    if (confirm(`Deseja realmente excluir o produto ID ${id} do catálogo?`)) {
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2>Catálogo de Produtos</h2>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>
              {ehAdmin
                ? 'Visualização e cadastro de itens. Para repor saldo ou editar preços, acesse a aba Estoque.'
                : 'Consulta de produtos, preços e disponibilidade em estoque.'}
            </p>
          </div>

          {/* Botões exclusivos de Administrador */}
          {ehAdmin && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => navigate('/estoque')}
                style={{ padding: '10px 16px', background: '#374151', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}
              >
                Ir para Gestão de Estoque
              </button>
              <button className="btn-primary" onClick={() => setModalAberto(true)}>
                + Novo Produto
              </button>
            </div>
          )}
        </div>

        {/* Modal de Cadastro de Novo Produto (Apenas Admin) */}
        {ehAdmin && modalAberto && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 100 }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '420px' }}>
              <h3>Cadastrar Novo Produto</h3>
              <br />
              <form onSubmit={handleCadastrar} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Nome do produto *"
                  required
                  value={novoProduto.nome}
                  onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Descrição / Detalhes"
                  value={novoProduto.descricao}
                  onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Custo Unit. (R$)"
                    value={novoProduto.custo}
                    onChange={(e) => setNovoProduto({ ...novoProduto, custo: e.target.value })}
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Preço Venda (R$) *"
                    required
                    value={novoProduto.preco}
                    onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="Estoque Inicial (un.) *"
                  required
                  value={novoProduto.quantidade}
                  onChange={(e) => setNovoProduto({ ...novoProduto, quantidade: e.target.value })}
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" className="btn-primary">Salvar no Catálogo</button>
                  <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '10px', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grid de Produtos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {produtos.map((p) => {
            const ehSelecionado = String(p.id) === String(produtoIdSelecionado);
            return (
              <div
                key={p.id}
                style={{
                  border: ehSelecionado ? '3px solid #2563eb' : '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '18px',
                  background: '#fff',
                  boxShadow: ehSelecionado ? '0 0 10px rgba(37,99,235,0.3)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>CÓD #{p.id}</span>
                  <h4 style={{ marginTop: '2px' }}>{p.nome}</h4>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '8px 0 14px 0' }}>
                    {p.descricao || 'Sem descrição cadastrada.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                    R$ {Number(p.preco).toFixed(2)}
                  </p>
                  <p style={{ fontSize: '13px', marginTop: '4px', color: p.quantidade <= 3 ? '#dc2626' : '#059669', fontWeight: '600' }}>
                    Disponível em estoque: {p.quantidade} un.
                  </p>

                  {/* Botão excluir aparece APENAS para Admin */}
                  {ehAdmin && (
                    <button
                      onClick={() => handleExcluir(p.id)}
                      style={{ marginTop: '12px', width: '100%', background: 'transparent', color: '#dc2626', border: '1px solid #fecaca', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Remover do Catálogo
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}