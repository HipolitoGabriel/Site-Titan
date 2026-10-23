import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function Vendas() {
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);

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

  async function handleRegistrarVenda(e) {
    e.preventDefault();

    if (!produtoSelecionado) {
      alert('Selecione um produto.');
      return;
    }

    try {
      await api.post('/vendas', {
        produtoId: produtoSelecionado,
        quantidade: Number(quantidade)
      });

      alert('Venda registrada com sucesso!');
      setProdutoSelecionado('');
      setQuantidade(1);
      carregarDados(); // Recarrega vendas e o novo estoque do produto
    } catch (error) {
      alert(error.response?.data?.mensagem || 'Erro ao registrar venda.');
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h2>Ponto de Vendas (PDV)</h2>
        <br />

        {/* Form para Registrar Venda */}
        <div className="form-container">
          <h3>Registrar Nova Venda</h3>
          <br />
          <form onSubmit={handleRegistrarVenda} className="form-grid">
            <div>
              <label>Selecione o Produto:</label>
              <select
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border)' }}
                value={produtoSelecionado}
                onChange={(e) => setProdutoSelecionado(e.target.value)}
                required
              >
                <option value="">-- Escolha um produto --</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.quantidade <= 0}>
                    {p.nome} - R$ {p.preco.toFixed(2)} (Estoque: {p.quantidade})
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
                required
              />
            </div>

            <button type="submit" className="btn-primary">Concluir Venda</button>
          </form>
        </div>

        {/* Histórico de Vendas */}
        <h3>Histórico de Vendas Realizadas</h3>
        <br />
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Valor Total</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length === 0 ? (
              <tr>
                <td colSpan="5">Nenhuma venda registrada até o momento.</td>
              </tr>
            ) : (
              vendas.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.data}</td>
                  <td>{v.nomeProduto}</td>
                  <td>{v.quantidade}</td>
                  <td>R$ {v.valorTotal.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}