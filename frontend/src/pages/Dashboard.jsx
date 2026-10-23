import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function Dashboard() {
  const [alertas, setAlertas] = useState([]);
  const [faturamentoDia, setFaturamentoDia] = useState(0);
  const [totalVendas, setTotalVendas] = useState(0);
  const [totalVendedores, setTotalVendedores] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarMétricas() {
      try {
        const [resProdutos, resVendas, resUsuarios] = await Promise.all([
          api.get('/produtos'),
          api.get('/vendas'),
          api.get('/usuarios')
        ]);

        // 1. Filtrar alertas de estoque baixo (quantidade <= 3)
        const baixos = resProdutos.data.filter((prod) => Number(prod.quantidade) <= 3);
        setAlertas(baixos);

        // 2. Calcular Faturamento do Dia e Total de Vendas
        const vendas = resVendas.data;
        setTotalVendas(vendas.length);
        
        const somaFaturamento = vendas.reduce((acc, v) => acc + Number(v.valorTotal || 0), 0);
        setFaturamentoDia(somaFaturamento);

        // 3. Contar número de vendedores (colaboradores que não são administradores)
        const vendedores = resUsuarios.data.filter((u) => u.administrador === false);
        setTotalVendedores(vendedores.length);

      } catch (error) {
        console.error('Erro ao carregar métricas da dashboard:', error);
      }
    }
    carregarMétricas();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h2>Dashboard</h2>
        <br />

        {/* Cards de Métricas Dinâmicas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ border: '1px solid var(--border)', padding: '20px', borderRadius: '8px', background: '#fff' }}>
            <h3>FATURAMENTO DO DIA</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '10px' }}>
              R$ {faturamentoDia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div style={{ border: '1px solid var(--border)', padding: '20px', borderRadius: '8px', background: '#fff' }}>
            <h3>VENDAS REALIZADAS</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '10px' }}>
              {totalVendas}
            </p>
          </div>

          <div style={{ border: '1px solid var(--border)', padding: '20px', borderRadius: '8px', background: '#fff' }}>
            <h3>VENDEDORES CADASTRADOS</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '10px', color: 'var(--gold)' }}>
              {totalVendedores}
            </p>
          </div>
        </div>

        {/* Tabela de Alertas de Estoque Baixo */}
        <section className="form-container">
          <h3>△ ALERTAS DE ESTOQUE BAIXO</h3>
          <br />
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Estoque Atual</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {alertas.length === 0 ? (
                <tr>
                  <td colSpan="3">Nenhum produto em estoque baixo no momento.</td>
                </tr>
              ) : (
                alertas.map((prod) => (
                  <tr key={prod.id}>
                    <td>{prod.nome}</td>
                    <td>{prod.quantidade} unidades</td>
                    <td>
                      <button
                        className="btn-primary"
                        onClick={() => navigate(`/produtos?id=${prod.id}`)}
                      >
                        Ver Produto
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}