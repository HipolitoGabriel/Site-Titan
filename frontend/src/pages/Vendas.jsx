import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function Vendas() {
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);

  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [carrinho, setCarrinho] = useState([]);

  const [descontoPercentual, setDescontoPercentual] = useState('');
  const [descontoValorFixo, setDescontoValorFixo] = useState('');

  const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || 'null');

  async function carregarDados() {
    try {
      const [resProdutos, resVendas] = await Promise.all([
        api.get('/produtos'),
        api.get('/vendas')
      ]);
      setProdutos(resProdutos.data);
      setVendas(resVendas.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function handleAdicionarItem(e) {
    e.preventDefault();
    if (!produtoSelecionado) {
      alert('Selecione um produto.');
      return;
    }

    const prod = produtos.find((p) => String(p.id) === String(produtoSelecionado));
    if (!prod) return;

    const qtdAdicionar = Number(quantidade);
    if (qtdAdicionar <= 0) return;

    const itemExistenteIndex = carrinho.findIndex((i) => String(i.produtoId) === String(prod.id));
    const qtdJaNoCarrinho = itemExistenteIndex !== -1 ? carrinho[itemExistenteIndex].quantidade : 0;

    if (qtdJaNoCarrinho + qtdAdicionar > prod.quantidade) {
      alert(`Estoque insuficiente! Você já tem ${qtdJaNoCarrinho} no carrinho e o estoque máximo é ${prod.quantidade}.`);
      return;
    }

    if (itemExistenteIndex !== -1) {
      const novoCarrinho = [...carrinho];
      novoCarrinho[itemExistenteIndex].quantidade += qtdAdicionar;
      setCarrinho(novoCarrinho);
    } else {
      setCarrinho([
        ...carrinho,
        {
          produtoId: prod.id,
          nome: prod.nome,
          precoUnitario: Number(prod.preco),
          quantidade: qtdAdicionar
        }
      ]);
    }

    setProdutoSelecionado('');
    setQuantidade(1);
  }

  function handleRemoverItem(produtoId) {
    setCarrinho(carrinho.filter((item) => String(item.produtoId) !== String(produtoId)));
  }

  const subtotal = carrinho.reduce((acc, item) => acc + item.precoUnitario * item.quantidade, 0);
  const perc = Math.max(0, Number(descontoPercentual) || 0);
  const fixo = Math.max(0, Number(descontoValorFixo) || 0);
  const valorDescontoPerc = subtotal * (perc / 100);
  const descontoTotalCalculado = Math.min(subtotal, valorDescontoPerc + fixo);
  const totalFinal = Math.max(0, subtotal - descontoTotalCalculado);

  async function handleConcluirVenda() {
    if (carrinho.length === 0) {
      alert('Adicione pelo menos 1 produto ao carrinho antes de concluir a venda.');
      return;
    }

    try {
      await api.post('/vendas', {
        itens: carrinho.map((i) => ({
          produtoId: i.produtoId,
          quantidade: i.quantidade
        })),
        descontoPercentual: perc,
        descontoValorFixo: fixo,
        vendedorId: usuarioLogado?.id,
        vendedorNome: usuarioLogado?.nome
      });

      alert('Venda registrada com sucesso!');
      setCarrinho([]);
      setDescontoPercentual('');
      setDescontoValorFixo('');
      carregarDados();
    } catch (error) {
      alert(error.response?.data?.mensagem || 'Erro ao registrar venda.');
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Ponto de Vendas (PDV)</h2>
          <span style={{ fontSize: '13px', background: '#f3f4f6', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
            Operador: <strong>{usuarioLogado?.nome || 'Vendedor'}</strong>
          </span>
        </div>

        {/* BLOCO 1: Adicionar Produtos ao Carrinho */}
        <div className="form-container">
          <h3>1. Adicionar Produtos à Venda</h3>
          <br />
          <form onSubmit={handleAdicionarItem} className="form-grid">
            <div>
              <label>Selecione o Produto:</label>
              <select
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border)' }}
                value={produtoSelecionado}
                onChange={(e) => setProdutoSelecionado(e.target.value)}
              >
                <option value="">-- Escolha um produto --</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.quantidade <= 0}>
                    {p.nome} - R$ {Number(p.preco).toFixed(2)} (Estoque: {p.quantidade})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Quantidade:</label>
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary">+ Adicionar ao Carrinho</button>
          </form>

          {/* Lista de Itens no Carrinho Atual */}
          <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
            <h4>Itens desta Venda ({carrinho.length})</h4>
            {carrinho.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
                Nenhum item adicionado ainda. Selecione os produtos acima.
              </p>
            ) : (
              <table style={{ marginTop: '10px' }}>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Preço Unit.</th>
                    <th>Qtd</th>
                    <th>Subtotal Item</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {carrinho.map((item) => (
                    <tr key={item.produtoId}>
                      <td>{item.nome}</td>
                      <td>R$ {item.precoUnitario.toFixed(2)}</td>
                      <td>{item.quantidade}</td>
                      <td>R$ {(item.precoUnitario * item.quantidade).toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleRemoverItem(item.produtoId)}
                          style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* BLOCO 2: Descontos e Fechamento */}
          <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Desconto em Porcentagem (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Ex: 10"
                value={descontoPercentual}
                onChange={(e) => setDescontoPercentual(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Desconto em Valor Fixo (R$):</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 15.00"
                value={descontoValorFixo}
                onChange={(e) => setDescontoValorFixo(e.target.value)}
              />
            </div>

            <div style={{ background: '#f9fafb', padding: '14px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '13px', color: '#4b5563' }}>Subtotal: <strong>R$ {subtotal.toFixed(2)}</strong></p>
              <p style={{ fontSize: '13px', color: '#dc2626' }}>Desconto Aplicado: <strong>- R$ {descontoTotalCalculado.toFixed(2)}</strong></p>
              <p style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', color: '#111827' }}>
                Total Final: R$ {totalFinal.toFixed(2)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleConcluirVenda}
              className="btn-primary"
              style={{ height: '48px', fontSize: '15px' }}
            >
              Concluir Venda
            </button>
          </div>
        </div>

        {/* BLOCO 3: Histórico de Vendas */}
        <h3>Histórico de Vendas Realizadas</h3>
        <br />
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Vendedor</th>
              <th>Produtos Vendidos</th>
              <th>Desconto</th>
              <th>Valor Final</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length === 0 ? (
              <tr>
                <td colSpan="6">Nenhuma venda registrada até o momento.</td>
              </tr>
            ) : (
              vendas.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.data}</td>
                  <td><strong>{v.vendedorNome || 'N/A'}</strong></td>
                  <td>
                    {v.itens && v.itens.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px' }}>
                        {v.itens.map((item, idx) => (
                          <li key={idx}>
                            {item.quantidade}x {item.nomeProduto} (R$ {Number(item.precoUnitario).toFixed(2)} un.)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      `${v.quantidade}x ${v.nomeProduto}`
                    )}
                  </td>
                  <td style={{ color: Number(v.descontoTotal) > 0 ? '#dc2626' : '#6b7280' }}>
                    {Number(v.descontoTotal) > 0 ? `- R$ ${Number(v.descontoTotal).toFixed(2)}` : 'R$ 0,00'}
                  </td>
                  <td style={{ fontWeight: 'bold' }}>R$ {Number(v.valorTotal).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}