import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [historico, setHistorico] = useState([]);

  // Form para Entrada de Estoque
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [qtdEntrada, setQtdEntrada] = useState(1);

  // Form para Edição Cadastral de Produto (Preço/Custo/Nome)
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);

  const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || 'null');

  const carregarDados = async () => {
    try {
      const [resProd, resHist] = await Promise.all([
        api.get('/produtos'),
        api.get('/estoque/historico')
      ]);
      setProdutos(resProd.data);
      setHistorico(resHist.data);
    } catch (error) {
      console.error('Erro ao carregar dados do estoque:', error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Registrar Entrada no Estoque
  const handleEntradaEstoque = async (e) => {
    e.preventDefault();
    if (!produtoSelecionado) return alert('Selecione um produto!');

    try {
      await api.post('/estoque/entrada', {
        produtoId: produtoSelecionado,
        quantidade: Number(qtdEntrada),
        operadorId: usuarioLogado?.id,
        operadorNome: usuarioLogado?.nome
      });

      alert('Entrada de estoque registrada com sucesso!');
      setProdutoSelecionado('');
      setQtdEntrada(1);
      carregarDados();
    } catch (error) {
      alert(error.response?.data?.mensagem || 'Erro ao registrar entrada.');
    }
  };

  // Salvar Edição Cadastral do Produto
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/produtos/${produtoEmEdicao.id}`, {
        nome: produtoEmEdicao.nome,
        descricao: produtoEmEdicao.descricao,
        preco: Number(produtoEmEdicao.preco),
        custo: Number(produtoEmEdicao.custo)
      });

      alert('Dados do produto atualizados! Vendas anteriores permanecem intactas.');
      setProdutoEmEdicao(null);
      carregarDados();
    } catch (error) {
      alert(error.response?.data?.mensagem || 'Erro ao editar produto.');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h2 style={{ marginBottom: '20px' }}>Gestão e Auditoria de Estoque</h2>

        {/* PAINEL DE REGISTRAR ENTRADA */}
        <div className="form-container" style={{ marginBottom: '25px' }}>
          <h3>📥 Registrar Entrada de Mercadoria</h3>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', marginBottom: '15px' }}>
            Toda reposição fica gravada com data, hora e responsável para controle gerencial.
          </p>
          <form onSubmit={handleEntradaEstoque} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Selecione o Produto:</label>
              <select
                value={produtoSelecionado}
                onChange={(e) => setProdutoSelecionado(e.target.value)}
                style={{ padding: '10px', minWidth: '240px', marginTop: '5px', borderRadius: '5px', border: '1px solid var(--border)' }}
                required
              >
                <option value="">-- Selecione --</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} (Saldo atual: {p.quantidade} un.)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Quantidade Entrando:</label>
              <input
                type="number"
                min="1"
                value={qtdEntrada}
                onChange={(e) => setQtdEntrada(e.target.value)}
                style={{ padding: '10px', width: '120px', marginTop: '5px' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Operador Responsável:</label>
              <input
                type="text"
                value={`${usuarioLogado?.nome || 'Operador'} (ID: ${usuarioLogado?.id || 'N/A'})`}
                disabled
                style={{ padding: '10px', background: '#f3f4f6', marginTop: '5px', color: '#4b5563' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ height: '42px' }}>
              Registrar Entrada
            </button>
          </form>
        </div>

        {/* TABELA DE PRODUTOS E EDIÇÃO DE PREÇO/CUSTO */}
        <div className="form-container" style={{ marginBottom: '25px' }}>
          <h3>📦 Posição Atual de Estoque e Precificação</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>ID</th>
                <th style={{ padding: '10px' }}>Produto</th>
                <th style={{ padding: '10px' }}>Saldo Atual</th>
                {usuarioLogado?.administrador && <th style={{ padding: '10px' }}>Custo Unit. (ADM)</th>}
                <th style={{ padding: '10px' }}>Preço Venda</th>
                <th style={{ padding: '10px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{p.id}</td>
                  <td style={{ padding: '10px', fontWeight: '500' }}>{p.nome}</td>
                  <td style={{ padding: '10px', color: p.quantidade <= 3 ? '#dc2626' : '#111827' }}>
                    <strong>{p.quantidade} un.</strong>
                  </td>
                  {usuarioLogado?.administrador && (
                    <td style={{ padding: '10px', color: '#dc2626' }}>R$ {Number(p.custo || 0).toFixed(2)}</td>
                  )}
                  <td style={{ padding: '10px', color: '#059669', fontWeight: '600' }}>R$ {Number(p.preco || 0).toFixed(2)}</td>
                  <td style={{ padding: '10px' }}>
                    <button
                      onClick={() => setProdutoEmEdicao({ ...p })}
                      style={{ backgroundColor: '#111827', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Editar Preço / Info
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL DE EDIÇÃO (SEM EDIÇÃO MANUAL DE QUANTIDADE PARA MANTER AUDITORIA) */}
        {produtoEmEdicao && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '420px' }}>
              <h3>Editar Produto: {produtoEmEdicao.nome}</h3>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', marginBottom: '15px' }}>
                Para alterar a quantidade em estoque, utilize o formulário de entrada acima.
              </p>
              <form onSubmit={handleSalvarEdicao} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  Nome:
                  <input
                    type="text"
                    value={produtoEmEdicao.nome}
                    onChange={(e) => setProdutoEmEdicao({ ...produtoEmEdicao, nome: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                    required
                  />
                </label>

                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  Descrição:
                  <input
                    type="text"
                    value={produtoEmEdicao.descricao || ''}
                    onChange={(e) => setProdutoEmEdicao({ ...produtoEmEdicao, descricao: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                  />
                </label>

                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  Preço de Venda (R$):
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={produtoEmEdicao.preco}
                    onChange={(e) => setProdutoEmEdicao({ ...produtoEmEdicao, preco: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                    required
                  />
                </label>

                {usuarioLogado?.administrador && (
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#dc2626' }}>
                    Preço de Custo (Exclusivo ADM):
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={produtoEmEdicao.custo || 0}
                      onChange={(e) => setProdutoEmEdicao({ ...produtoEmEdicao, custo: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                      required
                    />
                  </label>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Salvar</button>
                  <button type="button" onClick={() => setProdutoEmEdicao(null)} style={{ flex: 1, padding: '10px', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* HISTÓRICO DE MOVIMENTAÇÕES (ENTRADAS E SAÍDAS) */}
        <div className="form-container">
          <h3>📋 Histórico de Movimentações de Estoque</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Data / Hora</th>
                <th style={{ padding: '10px' }}>Tipo</th>
                <th style={{ padding: '10px' }}>Produto</th>
                <th style={{ padding: '10px' }}>Movimentação</th>
                <th style={{ padding: '10px' }}>Responsável</th>
              </tr>
            </thead>
            <tbody>
              {historico.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '12px', color: '#6b7280' }}>Nenhuma movimentação registrada.</td>
                </tr>
              ) : (
                historico.map((h) => {
                  const ehEntrada = h.quantidade > 0;
                  return (
                    <tr key={h.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px', fontSize: '13px' }}>{h.dataHora}</td>
                      <td style={{ padding: '10px', fontSize: '12px', fontWeight: 'bold' }}>{h.tipo}</td>
                      <td style={{ padding: '10px' }}>{h.nomeProduto}</td>
                      <td style={{ padding: '10px', color: ehEntrada ? '#059669' : '#dc2626', fontWeight: 'bold' }}>
                        {ehEntrada ? `+${h.quantidade} un.` : `${h.quantidade} un.`}
                      </td>
                      <td style={{ padding: '10px', fontSize: '13px' }}>
                        {h.operadorNome} (ID: {h.operadorId})
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}