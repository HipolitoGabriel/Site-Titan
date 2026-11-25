import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- DADOS EM MEMÓRIA ---
let usuarios = [
  { id: 1, nome: "Gabriel Hipolito", cpf: "12345678900", senha: "123", status: true, administrador: true },
  { id: 2, nome: "Vithor", cpf: "1", senha: "a", status: true, administrador: true },
  { id: 3, nome: "Vendedor Teste", cpf: "98765432100", senha: "123", status: true, administrador: false }
];

let produtos = [
  { id: 1, nome: "Legging Basic Preta P", descricao: "Legging esportiva", custo: 35.0, preco: 89.9, quantidade: 8 },
  { id: 2, nome: "Top Fitness Impacto Médio M", descricao: "Top de sustentação", custo: 22.0, preco: 59.9, quantidade: 5 },
  { id: 3, nome: "Camiseta Dry Fit Masculina G", descricao: "Camiseta para treino", custo: 18.5, preco: 49.9, quantidade: 2 },
  { id: 4, nome: "Short Compression Titan M", descricao: "Short de alta compressão", custo: 28.0, preco: 79.9, quantidade: 12 }
];

let movimentacoesEstoque = [
  {
    id: 1,
    tipo: "ENTRADA",
    produtoId: 1,
    nomeProduto: "Legging Basic Preta P",
    quantidade: 10,
    dataHora: "18/11/2026, 09:00:00",
    operadorId: 1,
    operadorNome: "Gabriel Hipolito"
  },
  {
    id: 2,
    tipo: "ENTRADA",
    produtoId: 4,
    nomeProduto: "Short Compression Titan M",
    quantidade: 15,
    dataHora: "19/11/2026, 11:30:00",
    operadorId: 2,
    operadorNome: "Vithor"
  }
];

let vendas = [
  {
    id: 101,
    data: "20/11/2026, 14:30:00",
    vendedorId: 3,
    vendedorNome: "Vendedor Teste",
    itens: [{ produtoId: 1, nomeProduto: "Legging Basic Preta P", quantidade: 2, precoUnitario: 89.9, custoUnitario: 35.0 }],
    subtotal: 179.80,
    descontoPercentual: 0,
    descontoValorFixo: 0,
    descontoTotal: 0,
    valorTotal: 179.80,
    custoTotal: 70.00
  },
  {
    id: 102,
    data: "21/11/2026, 16:15:00",
    vendedorId: 1,
    vendedorNome: "Gabriel Hipolito",
    itens: [{ produtoId: 4, nomeProduto: "Short Compression Titan M", quantidade: 3, precoUnitario: 79.9, custoUnitario: 28.0 }],
    subtotal: 239.70,
    descontoPercentual: 10,
    descontoValorFixo: 0,
    descontoTotal: 23.97,
    valorTotal: 215.73,
    custoTotal: 84.00
  }
];

// Função auxiliar para gerar IDs sequenciais limpos (ex: 103, 104...)
function gerarProximoId(lista, inicio = 1) {
  if (lista.length === 0) return inicio;
  const maiorId = Math.max(...lista.map(item => Number(item.id) || 0));
  return maiorId + 1;
}

// --- ROTAS DE USUÁRIOS ---
app.get('/usuarios', (req, res) => res.json(usuarios));

app.post('/usuarios', (req, res) => {
  const novoUsuario = { id: gerarProximoId(usuarios, 1), ...req.body };
  usuarios.push(novoUsuario);
  res.status(201).json(novoUsuario);
});

app.patch('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const index = usuarios.findIndex(u => String(u.id) === String(id));
  if (index !== -1) {
    usuarios[index] = { ...usuarios[index], ...req.body };
    return res.json(usuarios[index]);
  }
  res.status(404).json({ mensagem: "Usuário não encontrado" });
});

// --- ROTAS DE PRODUTOS ---
app.get('/produtos', (req, res) => res.json(produtos));

app.post('/produtos', (req, res) => {
  const preco = Number(req.body.preco);
  const qtdInicial = Number(req.body.quantidade) || 0;
  const novoProduto = {
    id: gerarProximoId(produtos, 1),
    nome: req.body.nome,
    descricao: req.body.descricao || '',
    custo: req.body.custo !== undefined && req.body.custo !== '' ? Number(req.body.custo) : Number((preco * 0.4).toFixed(2)),
    preco: preco,
    quantidade: qtdInicial
  };
  produtos.push(novoProduto);

  if (qtdInicial > 0) {
    movimentacoesEstoque.unshift({
      id: gerarProximoId(movimentacoesEstoque, 1),
      tipo: "ENTRADA (CADASTRO)",
      produtoId: novoProduto.id,
      nomeProduto: novoProduto.nome,
      quantidade: qtdInicial,
      dataHora: new Date().toLocaleString('pt-BR'),
      operadorId: req.body.operadorId || 0,
      operadorNome: req.body.operadorNome || "Sistema / Admin"
    });
  }

  res.status(201).json(novoProduto);
});

app.put('/produtos/:id', (req, res) => {
  const { id } = req.params;
  const index = produtos.findIndex(p => String(p.id) === String(id));

  if (index === -1) {
    return res.status(404).json({ mensagem: "Produto não encontrado" });
  }

  produtos[index] = {
    ...produtos[index],
    nome: req.body.nome ?? produtos[index].nome,
    descricao: req.body.descricao ?? produtos[index].descricao,
    preco: req.body.preco !== undefined ? Number(req.body.preco) : produtos[index].preco,
    custo: req.body.custo !== undefined ? Number(req.body.custo) : produtos[index].custo
  };

  res.json(produtos[index]);
});

app.delete('/produtos/:id', (req, res) => {
  const { id } = req.params;
  produtos = produtos.filter(p => String(p.id) !== String(id));
  res.json({ mensagem: "Produto removido com sucesso" });
});

// --- ROTAS DE ESTOQUE ---
app.get('/estoque/historico', (req, res) => {
  res.json(movimentacoesEstoque);
});

app.post('/estoque/entrada', (req, res) => {
  const { produtoId, quantidade, operadorId, operadorNome } = req.body;
  const qtd = Number(quantidade);

  if (!produtoId || qtd <= 0) {
    return res.status(400).json({ mensagem: "Produto e quantidade válida são obrigatórios." });
  }

  const prodIndex = produtos.findIndex(p => String(p.id) === String(produtoId));
  if (prodIndex === -1) {
    return res.status(404).json({ mensagem: "Produto não encontrado." });
  }

  produtos[prodIndex].quantidade += qtd;

  const registro = {
    id: gerarProximoId(movimentacoesEstoque, 1),
    tipo: "ENTRADA",
    produtoId: produtos[prodIndex].id,
    nomeProduto: produtos[prodIndex].nome,
    quantidade: qtd,
    dataHora: new Date().toLocaleString('pt-BR'),
    operadorId: operadorId || 'N/A',
    operadorNome: operadorNome || 'Operador'
  };

  movimentacoesEstoque.unshift(registro);
  res.status(201).json(registro);
});

// --- ROTA DE VENDAS ---
app.get('/vendas', (req, res) => res.json(vendas));

app.post('/vendas', (req, res) => {
  const {
    itens,
    descontoPercentual = 0,
    descontoValorFixo = 0,
    vendedorId = 'N/A',
    vendedorNome = 'Não identificado'
  } = req.body;

  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ mensagem: "Adicione pelo menos um produto à venda." });
  }

  const itensProcessados = [];
  for (const item of itens) {
    const prod = produtos.find(p => String(p.id) === String(item.produtoId));
    if (!prod) {
      return res.status(404).json({ mensagem: `Produto ID ${item.produtoId} não encontrado.` });
    }
    if (prod.quantidade < Number(item.quantidade)) {
      return res.status(400).json({
        mensagem: `Estoque insuficiente para "${prod.nome}". Disponível: ${prod.quantidade} un.`
      });
    }

    const custoUnit = prod.custo ?? Number((prod.preco * 0.4).toFixed(2));
    itensProcessados.push({
      produtoId: prod.id,
      nomeProduto: prod.nome,
      quantidade: Number(item.quantidade),
      precoUnitario: prod.preco,
      custoUnitario: custoUnit
    });
  }

  const dataAtual = new Date().toLocaleString('pt-BR');

  for (const item of itensProcessados) {
    const prodIndex = produtos.findIndex(p => String(p.id) === String(item.produtoId));
    produtos[prodIndex].quantidade -= item.quantidade;

    movimentacoesEstoque.unshift({
      id: gerarProximoId(movimentacoesEstoque, 1),
      tipo: "SAÍDA (VENDA)",
      produtoId: item.produtoId,
      nomeProduto: item.nomeProduto,
      quantidade: -item.quantidade,
      dataHora: dataAtual,
      operadorId: vendedorId,
      operadorNome: vendedorNome
    });
  }

  const subtotal = itensProcessados.reduce((acc, i) => acc + (i.precoUnitario * i.quantidade), 0);
  const custoTotal = itensProcessados.reduce((acc, i) => acc + (i.custoUnitario * i.quantidade), 0);

  const perc = Math.max(0, Number(descontoPercentual) || 0);
  const fixo = Math.max(0, Number(descontoValorFixo) || 0);

  const valorDescontoPerc = subtotal * (perc / 100);
  const descontoTotal = Math.min(subtotal, valorDescontoPerc + fixo);
  const valorTotal = Math.max(0, subtotal - descontoTotal);

  const novaVenda = {
    id: gerarProximoId(vendas, 101),
    data: dataAtual,
    vendedorId,
    vendedorNome,
    itens: itensProcessados,
    subtotal: Number(subtotal.toFixed(2)),
    descontoPercentual: perc,
    descontoValorFixo: fixo,
    descontoTotal: Number(descontoTotal.toFixed(2)),
    valorTotal: Number(valorTotal.toFixed(2)),
    custoTotal: Number(custoTotal.toFixed(2))
  };

  vendas.push(novaVenda);
  res.status(201).json(novaVenda);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Titan rodando com sucesso em http://localhost:${PORT}`);
});