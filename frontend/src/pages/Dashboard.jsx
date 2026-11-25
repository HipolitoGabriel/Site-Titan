import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const [alertas, setAlertas] = useState([]);
  const [vendasLista, setVendasLista] = useState([]);
  const [rankingVendedores, setRankingVendedores] = useState([]);
  const [metricas, setMetricas] = useState({
    receitaBruta: 0,
    descontoTotal: 0,
    taxaDesconto: 0,
    faturamentoLiquido: 0,
    lucroTotal: 0,
    margemLucro: 0,
    ticketMedio: 0,
    totalVendas: 0,
    valorEstoque: 0,
    totalUnidadesRepostas: 0,
    ultimaReposicaoInfo: 'Nenhuma entrada registrada'
  });

  const [dadosLinha, setDadosLinha] = useState([]);
  const [dadosColuna, setDadosColuna] = useState([]);
  const [dadosPizza, setDadosPizza] = useState([]);

  const navigate = useNavigate();

  const CORES_PIZZA = ['#111111', '#4B5563', '#9CA3AF', '#D97706', '#1F2937'];

  useEffect(() => {
    async function carregarDadosGerenciais() {
      try {
        const [resProdutos, resVendas, resHistorico] = await Promise.all([
          api.get('/produtos'),
          api.get('/vendas'),
          api.get('/estoque/historico')
        ]);

        const produtos = resProdutos.data;
        const vendas = resVendas.data;
        const historicoEstoque = resHistorico.data;

        setVendasLista([...vendas].reverse());

        // 1. Alertas de estoque baixo (<= 3 unidades)
        const baixos = produtos.filter((prod) => Number(prod.quantidade) <= 3);
        setAlertas(baixos);

        // 2. Indicadores Financeiros e de Gestão
        const faturamentoLiquido = vendas.reduce((acc, v) => acc + Number(v.valorTotal || 0), 0);
        const totalDescontado = vendas.reduce((acc, v) => acc + Number(v.descontoTotal || 0), 0);
        const receitaBruta = vendas.reduce((acc, v) => acc + Number(v.subtotal ?? v.valorTotal ?? 0), 0);
        const custo = vendas.reduce((acc, v) => acc + Number(v.custoTotal || 0), 0);

        const lucro = faturamentoLiquido - custo;
        const margem = faturamentoLiquido > 0 ? (lucro / faturamentoLiquido) * 100 : 0;
        const taxaDesc = receitaBruta > 0 ? (totalDescontado / receitaBruta) * 100 : 0;
        const ticket = vendas.length > 0 ? faturamentoLiquido / vendas.length : 0;
        const capitalEstoque = produtos.reduce((acc, p) => acc + (Number(p.preco) * Number(p.quantidade)), 0);

        // 3. Indicadores de Entrada de Estoque
        const entradas = historicoEstoque.filter((h) => Number(h.quantidade) > 0);
        const totalRepostas = entradas.reduce((acc, h) => acc + Number(h.quantidade), 0);
        const ultima = entradas[0];
        const ultimaInfo = ultima
          ? `+${ultima.quantidade} un. (${ultima.nomeProduto}) em ${ultima.dataHora.split(',')[0]}`
          : 'Nenhuma entrada registrada';

        setMetricas({
          receitaBruta,
          descontoTotal: totalDescontado,
          taxaDesconto: taxaDesc,
          faturamentoLiquido,
          lucroTotal: lucro,
          margemLucro: margem,
          ticketMedio: ticket,
          totalVendas: vendas.length,
          valorEstoque: capitalEstoque,
          totalUnidadesRepostas: totalRepostas,
          ultimaReposicaoInfo: ultimaInfo
        });

        // 4. Desempenho por Vendedor
        const porVendedor = {};
        vendas.forEach((v) => {
          const nomeVend = v.vendedorNome || 'Não identificado';
          if (!porVendedor[nomeVend]) {
            porVendedor[nomeVend] = { nome: nomeVend, pedidos: 0, faturamento: 0, descontos: 0 };
          }
          porVendedor[nomeVend].pedidos += 1;
          porVendedor[nomeVend].faturamento += Number(v.valorTotal || 0);
          porVendedor[nomeVend].descontos += Number(v.descontoTotal || 0);
        });
        setRankingVendedores(Object.values(porVendedor).sort((a, b) => b.faturamento - a.faturamento));

        // 5. GRÁFICO DE LINHAS
        const agrupadoPorData = {};
        vendas.forEach((v) => {
          const dataLimpa = v.data ? v.data.split(',')[0].slice(0, 5) : 'Hoje';
          if (!agrupadoPorData[dataLimpa]) {
            agrupadoPorData[dataLimpa] = { data: dataLimpa, Faturamento: 0, Lucro: 0, Descontos: 0 };
          }
          const vTotal = Number(v.valorTotal || 0);
          const cTotal = Number(v.custoTotal || 0);
          const dTotal = Number(v.descontoTotal || 0);

          agrupadoPorData[dataLimpa].Faturamento += vTotal;
          agrupadoPorData[dataLimpa].Lucro += (vTotal - cTotal);
          agrupadoPorData[dataLimpa].Descontos += dTotal;
        });
        setDadosLinha(Object.values(agrupadoPorData));

        // 6. GRÁFICO DE COLUNAS e PIZZA
        const agrupadoPorProduto = {};
        vendas.forEach((v) => {
          const listaItens = v.itens && v.itens.length > 0
            ? v.itens
            : [{ nomeProduto: v.nomeProduto || 'Outros', quantidade: v.quantidade || 0, precoUnitario: (v.valorTotal || 0) / (v.quantidade || 1) }];

          listaItens.forEach((item) => {
            const nome = item.nomeProduto || 'Outros';
            if (!agrupadoPorProduto[nome]) {
              agrupadoPorProduto[nome] = {
                nome: nome.length > 18 ? nome.substring(0, 18) + '...' : nome,
                Quantidade: 0,
                Receita: 0
              };
            }
            const qtd = Number(item.quantidade || 0);
            const rec = Number(item.precoUnitario || 0) * qtd;
            agrupadoPorProduto[nome].Quantidade += qtd;
            agrupadoPorProduto[nome].Receita += rec;
          });
        });

        const listaProdutos = Object.values(agrupadoPorProduto);
        setDadosColuna(listaProdutos);
        setDadosPizza(listaProdutos.map((item) => ({ name: item.nome, value: Number(item.Receita.toFixed(2)) })));

      } catch (error) {
        console.error('Erro ao carregar métricas da dashboard:', error);
      }
    }
    carregarDadosGerenciais();
  }, []);

  const formatarMoeda = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const cardStyle = {
    border: '1px solid #e5e7eb',
    padding: '20px',
    borderRadius: '8px',
    background: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  };

  const chartBoxStyle = {
    border: '1px solid #e5e7eb',
    padding: '20px',
    borderRadius: '8px',
    background: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    minHeight: '350px'
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0 }}>Painel Executivo — TITAN PERFORMANCE</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
              Indicadores financeiros, auditoria de vendas por operador, estoque e performance comercial
            </p>
          </div>
        </div>

        {/* BLOCO 1: KPIs GERENCIAIS (6 Cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={cardStyle}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Faturamento Líquido</span>
            <p style={{ fontSize: '26px', fontWeight: '800', marginTop: '8px', color: '#111827' }}>
              {formatarMoeda(metricas.faturamentoLiquido)}
            </p>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              Bruto: {formatarMoeda(metricas.receitaBruta)} ({metricas.totalVendas} pedidos)
            </span>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Lucro Líquido Real</span>
            <p style={{ fontSize: '26px', fontWeight: '800', marginTop: '8px', color: '#059669' }}>
              {formatarMoeda(metricas.lucroTotal)}
            </p>
            <span style={{ fontSize: '12px', color: '#374151' }}>
              Margem líquida: <strong>{metricas.margemLucro.toFixed(1)}%</strong>
            </span>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Descontos Concedidos</span>
            <p style={{ fontSize: '26px', fontWeight: '800', marginTop: '8px', color: '#dc2626' }}>
              {formatarMoeda(metricas.descontoTotal)}
            </p>
            <span style={{ fontSize: '12px', color: '#374151' }}>
              Impacto na receita: <strong>{metricas.taxaDesconto.toFixed(1)}%</strong>
            </span>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Ticket Médio</span>
            <p style={{ fontSize: '26px', fontWeight: '800', marginTop: '8px', color: '#111827' }}>
              {formatarMoeda(metricas.ticketMedio)}
            </p>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Valor médio por venda</span>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Capital em Estoque</span>
            <p style={{ fontSize: '26px', fontWeight: '800', marginTop: '8px', color: '#111827' }}>
              {formatarMoeda(metricas.valorEstoque)}
            </p>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Potencial de venda parado</span>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Entradas no Estoque</span>
            <p style={{ fontSize: '26px', fontWeight: '800', marginTop: '8px', color: '#111827' }}>
              +{metricas.totalUnidadesRepostas} un.
            </p>
            <span style={{ fontSize: '11px', color: '#059669', display: 'block', marginTop: '2px' }}>
              Última: {metricas.ultimaReposicaoInfo}
            </span>
          </div>
        </div>

        {/* BLOCO 2: GRÁFICOS ESTRATÉGICOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <div style={chartBoxStyle}>
            <h3 style={{ fontSize: '15px', marginBottom: '4px' }}>EVOLUÇÃO DE RECEITA, LUCRO E DESCONTOS (R$)</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>Acompanhamento diário do fluxo financeiro</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dadosLinha}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="data" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => formatarMoeda(value)} />
                <Legend />
                <Line type="monotone" dataKey="Faturamento" stroke="#111111" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Lucro" stroke="#059669" strokeWidth={3} />
                <Line type="monotone" dataKey="Descontos" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={chartBoxStyle}>
            <h3 style={{ fontSize: '15px', marginBottom: '4px' }}>GIRO DE PRODUTOS (UNIDADES VENDIDAS)</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>Volume total de saída por item do catálogo</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dadosColuna}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="nome" fontSize={11} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Quantidade" name="Unidades Vendidas" fill="#1f2937" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BLOCO 3: CURVA ABC + ALERTAS DE RUPTURA + DESEMPENHO POR VENDEDOR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <div style={chartBoxStyle}>
            <h3 style={{ fontSize: '15px', marginBottom: '4px' }}>CURVA ABC — PARTICIPAÇÃO NA RECEITA</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>Representatividade bruta de cada produto</p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dadosPizza}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {dadosPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES_PIZZA[index % CORES_PIZZA.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatarMoeda(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* DESEMPENHO POR VENDEDOR */}
          <div style={chartBoxStyle}>
            <h3 style={{ fontSize: '15px', marginBottom: '4px' }}>PERFORMANCE POR VENDEDOR</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>Faturamento e descontos concedidos por operador</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', fontSize: '13px' }}>
                  <th style={{ padding: '10px 8px' }}>Vendedor</th>
                  <th style={{ padding: '10px 8px' }}>Vendas</th>
                  <th style={{ padding: '10px 8px' }}>Descontos</th>
                  <th style={{ padding: '10px 8px' }}>Total Vendido</th>
                </tr>
              </thead>
              <tbody>
                {rankingVendedores.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '16px 8px', color: '#6b7280' }}>Nenhuma venda registrada.</td>
                  </tr>
                ) : (
                  rankingVendedores.map((v, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '14px' }}>
                      <td style={{ padding: '10px 8px', fontWeight: '600' }}>{v.nome}</td>
                      <td style={{ padding: '10px 8px' }}>{v.pedidos}</td>
                      <td style={{ padding: '10px 8px', color: '#dc2626' }}>{formatarMoeda(v.descontos)}</td>
                      <td style={{ padding: '10px 8px', color: '#059669', fontWeight: 'bold' }}>{formatarMoeda(v.faturamento)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ALERTAS DE RUPTURA */}
          <div style={chartBoxStyle}>
            <h3 style={{ fontSize: '15px', marginBottom: '4px', color: '#b91c1c' }}>
              △ RISCO DE RUPTURA (ESTOQUE &le; 3)
            </h3>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
              Itens com reposição urgente necessária
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', fontSize: '13px' }}>
                  <th style={{ padding: '10px 8px' }}>Produto</th>
                  <th style={{ padding: '10px 8px' }}>Saldo</th>
                  <th style={{ padding: '10px 8px' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {alertas.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: '16px 8px', color: '#6b7280' }}>
                      Estoque saudável.
                    </td>
                  </tr>
                ) : (
                  alertas.map((prod) => (
                    <tr key={prod.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '14px' }}>
                      <td style={{ padding: '10px 8px', fontWeight: '500' }}>{prod.nome}</td>
                      <td style={{ padding: '10px 8px', color: '#dc2626', fontWeight: 'bold' }}>
                        {prod.quantidade} un.
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <button
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => navigate('/estoque')}
                        >
                          Repor
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BLOCO 4: AUDITORIA DE VENDAS (QUEM FEZ CADA VENDA) */}
        <div style={{ ...cardStyle }}>
          <h3 style={{ fontSize: '15px', marginBottom: '4px' }}>REGISTRO GERAL DE VENDAS — AUDITORIA POR OPERADOR</h3>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
            Histórico detalhado identificando o responsável por cada operação no PDV
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', fontSize: '13px' }}>
                <th style={{ padding: '10px 8px' }}>Pedido</th>
                <th style={{ padding: '10px 8px' }}>Data / Hora</th>
                <th style={{ padding: '10px 8px' }}>Responsável (Vendedor)</th>
                <th style={{ padding: '10px 8px' }}>Itens Vendidos</th>
                <th style={{ padding: '10px 8px' }}>Desconto</th>
                <th style={{ padding: '10px 8px' }}>Valor Final</th>
              </tr>
            </thead>
            <tbody>
              {vendasLista.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '16px 8px', color: '#6b7280' }}>Nenhuma venda registrada.</td>
                </tr>
              ) : (
                vendasLista.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '13px' }}>
                    <td style={{ padding: '10px 8px', color: '#6b7280' }}>#{v.id}</td>
                    <td style={{ padding: '10px 8px' }}>{v.data}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
                        {v.vendedorNome || 'Não identificado'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {v.itens && v.itens.length > 0
                        ? v.itens.map((i) => `${i.quantidade}x ${i.nomeProduto}`).join(', ')
                        : `${v.quantidade}x ${v.nomeProduto}`}
                    </td>
                    <td style={{ padding: '10px 8px', color: Number(v.descontoTotal) > 0 ? '#dc2626' : '#6b7280' }}>
                      {Number(v.descontoTotal) > 0 ? `- ${formatarMoeda(Number(v.descontoTotal))}` : 'R$ 0,00'}
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: 'bold' }}>{formatarMoeda(Number(v.valorTotal))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}