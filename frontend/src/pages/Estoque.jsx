import React, { useEffect, useState } from 'react';

export default function Estoque({ usuarioLogado }) {
  const [produtos, setProdutos] = useState([]);
  const [historico, setHistorico] = useState([]);
  
  // Form para Entrada de Estoque
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [qtdEntrada, setQtdEntrada] = useState(1);

  // Form para Edição de Produto
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    fetch('http://localhost:3000/produtos').then(res => res.json()).then(setProdutos);
    fetch('http://localhost:3000/estoque/historico').then(res => res.json()).then(setHistorico);
  };

  // Registar Entrada no Estoque
  const handleEntradaEstoque = async (e) => {
    e.preventDefault();
    if (!produtoSelecionado) return alert("Selecione um produto!");

    await fetch('http://localhost:3000/estoque/entrada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        produtoId: produtoSelecionado,
        quantidade: Number(qtdEntrada),
        operadorId: usuarioLogado?.id,
        operadorNome: usuarioLogado?.nome
      })
    });

    alert("Entrada de estoque registrada com sucesso!");
    setQtdEntrada(1);
    carregarDados();
  };

  // Salvar Edição do Produto
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    await fetch(`http://localhost:3000/produtos/${produtoEmEdicao.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(produtoEmEdicao)
    });

    alert("Produto atualizado com sucesso!");
    setProdutoEmEdicao(null);
    carregarDados();
  };

  return (
    <div style={{ backgroundColor: '#f5f5f0', minHeight: '100vh', padding: '25px', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ color: '#111', marginBottom: '20px' }}>Gestão e Histórico de Estoque</h2>

      {/* PAINEL DE REGISTAR ENTRADA */}
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '6px', marginBottom: '25px' }}>
        <h3>📥 Registrar Entrada de Estoque</h3>
        <form onSubmit={handleEntradaEstoque} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Selecione o Produto:</label>
            <select 
              value={produtoSelecionado} 
              onChange={e => setProdutoSelecionado(e.target.value)}
              style={{ padding: '8px', minWidth: '220px', marginTop: '5px' }}
              required
            >
              <option value="">-- Selecione --</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>{p.nome} (Atual: {p.quantidade})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Quantidade Entrando:</label>
            <input 
              type="number" 
              min="1" 
              value={qtdEntrada} 
              onChange={e => setQtdEntrada(e.target.value)}
              style={{ padding: '8px', width: '100px', marginTop: '5px' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Operador Responsável:</label>
            <input 
              type="text" 
              value={`${usuarioLogado?.nome || 'Operador'} (ID: ${usuarioLogado?.id || 'N/A'})`}
              disabled
              style={{ padding: '8px', background: '#eee', marginTop: '5px' }}
            />
          </div>

          <button type="submit" style={{ backgroundColor: '#111', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Registar Entrada
          </button>
        </form>
      </div>

      {/* TABELA DE PRODUTOS E EDIÇÃO */}
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '6px', marginBottom: '25px' }}>
        <h3>📦 Produtos em Stock</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>ID</th>
              <th style={{ padding: '10px' }}>Nome</th>
              <th style={{ padding: '10px' }}>Quantidade</th>
              {usuarioLogado?.administrador && <th style={{ padding: '10px' }}>Preço Custo (ADM)</th>}
              <th style={{ padding: '10px' }}>Preço Venda</th>
              <th style={{ padding: '10px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{p.id}</td>
                <td style={{ padding: '10px' }}>{p.nome}</td>
                <td style={{ padding: '10px' }}><strong>{p.quantidade} un</strong></td>
                {usuarioLogado?.administrador && (
                  <td style={{ padding: '10px', color: '#dc3545' }}>R$ {(p.precoCusto || 0).toFixed(2)}</td>
                )}
                <td style={{ padding: '10px', color: '#28a745' }}>R$ {(p.precoVenda || p.preco || 0).toFixed(2)}</td>
                <td style={{ padding: '10px' }}>
                  <button 
                    onClick={() => setProdutoEmEdicao(p)}
                    style={{ backgroundColor: '#ff6600', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Editar Produto
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {produtoEmEdicao && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '400px' }}>
            <h3>Editar Produto: {produtoEmEdicao.nome}</h3>
            <form onSubmit={handleSalvarEdicao} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label>Nome:
                <input type="text" value={produtoEmEdicao.nome} onChange={e => setProdutoEmEdicao({...produtoEmEdicao, nome: e.target.value})} style={{ width: '100%', padding: '8px' }} required />
              </label>

              <label>Preço de Venda (R$):
                <input type="number" step="0.01" value={produtoEmEdicao.precoVenda || produtoEmEdicao.preco} onChange={e => setProdutoEmEdicao({...produtoEmEdicao, precoVenda: Number(e.target.value)})} style={{ width: '100%', padding: '8px' }} required />
              </label>

              {usuarioLogado?.administrador && (
                <label style={{ color: '#dc3545' }}>Preço de Custo (Exclusivo ADM):
                  <input type="number" step="0.01" value={produtoEmEdicao.precoCusto || 0} onChange={e => setProdutoEmEdicao({...produtoEmEdicao, precoCusto: Number(e.target.value)})} style={{ width: '100%', padding: '8px' }} required />
                </label>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>Salvar</button>
                <button type="button" onClick={() => setProdutoEmEdicao(null)} style={{ flex: 1, backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HISTÓRICO DE ENTRADAS COM OPERADOR */}
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '6px' }}>
        <h3>📋 Histórico de Movimentações de Estoque</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Data/Hora</th>
              <th style={{ padding: '8px' }}>Produto</th>
              <th style={{ padding: '8px' }}>Qtd Entrou</th>
              <th style={{ padding: '8px' }}>Registrado por (Operador)</th>
            </tr>
          </thead>
          <tbody>
            {historico.map(h => (
              <tr key={h.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{h.dataHora}</td>
                <td style={{ padding: '8px' }}>{h.nomeProduto}</td>
                <td style={{ padding: '8px', color: '#28a745', fontWeight: 'bold' }}>+{h.quantidade}</td>
                <td style={{ padding: '8px' }}>{h.operadorNome} (ID: {h.operadorId})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}