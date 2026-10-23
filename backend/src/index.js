import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Dados em memória
// Dados em memória no backend/src/index.js
let usuarios = [
  { id: 1, nome: "Gabriel Hipolito", cpf: "12345678900", senha: "123", status: true, administrador: true },
  { id: 2, nome: "Vendedor Teste", cpf: "98765432100", senha: "123", status: true, administrador: false }
];

let produtos = [
  { id: 1, nome: "Legging Basic Preta P", descricao: "Legging esportiva", preco: 89.9, quantidade: 3 },
  { id: 2, nome: "Top Fitness Impacto Médio M", descricao: "Top de sustentação", preco: 59.9, quantidade: 2 },
  { id: 3, nome: "Camiseta Dry Fit Masculina G", descricao: "Camiseta para treino", preco: 49.9, quantidade: 1 }
];

let vendas = [];

// --- ROTAS DE USUÁRIOS ---
app.get('/usuarios', (req, res) => res.json(usuarios));

app.post('/usuarios', (req, res) => {
  const novoUsuario = { id: Date.now(), ...req.body };
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
  const novoProduto = { id: Date.now(), ...req.body };
  produtos.push(novoProduto);
  res.status(201).json(novoProduto);
});

app.delete('/produtos/:id', (req, res) => {
  const { id } = req.params;
  produtos = produtos.filter(p => String(p.id) !== String(id));
  res.json({ mensagem: "Produto removido com sucesso" });
});

// --- ROTA DE VENDAS (Com baixa automática no estoque) ---
app.get('/vendas', (req, res) => res.json(vendas));

app.post('/vendas', (req, res) => {
  const { produtoId, quantidade } = req.body;
  const prodIndex = produtos.findIndex(p => String(p.id) === String(produtoId));

  if (prodIndex === -1) {
    return res.status(404).json({ mensagem: "Produto não encontrado." });
  }

  if (produtos[prodIndex].quantidade < quantidade) {
    return res.status(400).json({ mensagem: "Estoque insuficiente para esta venda." });
  }

  // Dar baixa no estoque
  produtos[prodIndex].quantidade -= Number(quantidade);

  const novaVenda = {
    id: Date.now(),
    produtoId,
    nomeProduto: produtos[prodIndex].nome,
    quantidade: Number(quantidade),
    valorTotal: produtos[prodIndex].preco * Number(quantidade),
    data: new Date().toLocaleString('pt-BR')
  };

  vendas.push(novaVenda);
  res.status(201).json(novaVenda);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso em http://localhost:${PORT}`);
});