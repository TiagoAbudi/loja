import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, Divider, TextField, CircularProgress } from '@mui/material';
import { supabase } from '../supabaseClient';

// Importando a interface principal de Produto para consistência
import { Product } from './ProductsPage';
import { Pagamento, PagamentoDialog } from '../componets/PagamentoDialog';
import { BuscaProduto } from '../componets/BuscaProduto';
import { CarrinhoItens } from '../componets/CarrinhoItens';
import { Link } from 'react-router-dom';
import { BuscaCliente } from '../componets/BuscaCliente';

// Interfaces específicas da Venda
interface Cliente {
    id: number;
    nome: string;
}

interface CarrinhoItem {
    produto_id: number;
    nome: string;
    quantidade: number;
    preco_unitario: number;
    preco_total: number;
}


const AvisoCaixaFechado = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>O Caixa está Fechado!</Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>Você precisa abrir o caixa para poder registrar novas vendas.</Typography>
        <Button component={Link} to="/caixa" variant="contained" size="large">
            Ir para o Módulo de Caixa
        </Button>
    </Box>
);

const VendasPage: React.FC = () => {
    // --- ESTADOS DO COMPONENTE ---
    const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
    const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
    const [desconto, setDesconto] = useState<number>(0);
    const [pagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);
    const [caixaAberto, setCaixaAberto] = useState<any>(null);
    const [verificandoCaixa, setVerificandoCaixa] = useState(true);

    useEffect(() => {
        const verificarCaixa = async () => {
            const { data } = await supabase.from('caixas').select('*').eq('status', 'Aberto').maybeSingle();
            setCaixaAberto(data);
            setVerificandoCaixa(false);
        };
        verificarCaixa();
    }, []);

    // --- CÁLCULOS AUTOMÁTICOS ---
    const totais = useMemo(() => {
        const valorBruto = carrinho.reduce((acc, item) => acc + item.preco_total, 0);
        const valorLiquido = valorBruto - desconto;
        return { valorBruto, valorLiquido };
    }, [carrinho, desconto]);

    // --- FUNÇÕES DE MANIPULAÇÃO DO CARRINHO ---
    const handleAddItemAoCarrinho = useCallback((produto: Product) => {
        // Trava de segurança para produtos com preço inválido
        if (typeof produto.preco !== 'number' || isNaN(Number(produto.preco))) {
            alert(`O produto "${produto.nome}" está com um preço inválido e não pode ser adicionado à venda.`);
            return;
        }

        setCarrinho(prevCarrinho => {
            const itemExistente = prevCarrinho.find(item => item.produto_id === produto.id);

            if (itemExistente) {
                // Se o item já existe, apenas incrementa a quantidade
                return prevCarrinho.map(item =>
                    item.produto_id === produto.id
                        ? { ...item, quantidade: item.quantidade + 1, preco_total: (item.quantidade + 1) * item.preco_unitario }
                        : item
                );
            } else {
                // Se é um novo item, adiciona ao carrinho com quantidade 1
                const novoItem: CarrinhoItem = {
                    produto_id: produto.id,
                    nome: produto.nome,
                    quantidade: 1,
                    preco_unitario: Number(produto.preco),
                    preco_total: Number(produto.preco)
                };
                return [...prevCarrinho, novoItem];
            }
        });
    }, []);

    const handleUpdateQuantidade = useCallback((produtoId: number, novaQuantidade: number) => {
        setCarrinho(prevCarrinho => {
            if (novaQuantidade <= 0) {
                // Remove o item se a quantidade for 0 ou menor
                return prevCarrinho.filter(item => item.produto_id !== produtoId);
            }
            // Atualiza a quantidade e o total do item
            return prevCarrinho.map(item =>
                item.produto_id === produtoId
                    ? { ...item, quantidade: novaQuantidade, preco_total: novaQuantidade * item.preco_unitario }
                    : item
            );
        });
    }, []);

    const handleRemoveItem = useCallback((produtoId: number) => {
        setCarrinho(prevCarrinho => prevCarrinho.filter(item => item.produto_id !== produtoId));
    }, []);

    // --- FUNÇÃO PRINCIPAL PARA FINALIZAR A VENDA ---
    const handleFinalizarVenda = async (pagamentos: Pagamento[]) => {
        setPagamentoDialogOpen(false);
        if (!clienteSelecionado) { alert("Selecione um cliente para a venda."); return; }
        if (carrinho.length === 0) { alert("O carrinho está vazio."); return; }

        // 1. Pega ou cria o cliente usando a função do back-end
        const { data: clienteId, error: clienteError } = await supabase.rpc('get_or_create_cliente', { nome_cliente: clienteSelecionado.nome });
        if (clienteError) {
            console.error("Erro ao buscar/criar cliente:", clienteError);
            alert(`Erro com o cliente: ${clienteError.message}`);
            return;
        }

        // 2. Insere o registro principal da venda
        const { data: vendaData, error: vendaError } = await supabase
            .from('vendas')
            .insert({
                cliente_id: clienteId,
                valor_bruto: totais.valorBruto,
                desconto: desconto,
                valor_liquido: totais.valorLiquido,
                status: 'Em Aberto',
            })
            .select()
            .single();
            
        if (vendaError) {
            console.error("Erro ao criar venda:", vendaError);
            alert(`Erro ao criar venda: ${vendaError.message}`);
            return;
        }

        const vendaId = vendaData.id;

        // 3. Insere os itens e os pagamentos
        const itensParaInserir = carrinho.map(item => ({
            venda_id: vendaId,
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
            preco_total: item.preco_total
        }));
        const { error: itensError } = await supabase.from('venda_itens').insert(itensParaInserir);
        if (itensError) {
            console.error("Erro ao inserir itens:", itensError);
            alert(`Erro ao inserir itens: ${itensError.message}`);
            return;
        }

        const pagamentosParaInserir = pagamentos.map(pag => ({
            venda_id: vendaId,
            metodo: pag.metodo,
            valor: pag.valor
        }));
        const { error: pagamentosError } = await supabase.from('venda_pagamentos').insert(pagamentosParaInserir);
        if (pagamentosError) {
            console.error("Erro ao inserir pagamentos:", pagamentosError);
            alert(`Erro ao inserir pagamentos: ${pagamentosError.message}`);
            return;
        }

        // 4. Lógica para Contas a Receber e Movimentação de Caixa
        for (const pag of pagamentos) {
            if (pag.metodo === 'A Prazo') {
                const hoje = new Date();
                const dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 6);
                await supabase.from('contas_a_receber').insert({
                    descricao: `Referente à Venda #${vendaId}`,
                    valor: pag.valor,
                    data_vencimento: dataVencimento.toISOString().slice(0, 10),
                    cliente_id: clienteId,
                    status: 'Pendente'
                });
            }
            if (pag.metodo === 'Dinheiro' && caixaAberto) {
                await supabase.from('caixa_movimentacoes').insert({
                    caixa_id: caixaAberto.id,
                    tipo: 'VENDA',
                    descricao: `Recebimento da Venda #${vendaId}`,
                    valor: pag.valor
                });
            }
        }
        
        // 5. Chama a função do back-end para finalizar e dar baixa no estoque
        const { error: rpcError } = await supabase.rpc('finalizar_venda', { id_da_venda: vendaId });
        if (rpcError) {
            console.error("Erro na reta final:", rpcError);
            alert(`Erro ao finalizar venda: ${rpcError.message}`);
            return;
        }
        
        alert("Venda finalizada com sucesso!");
        setCarrinho([]);
        setClienteSelecionado(null);
        setDesconto(0);
    };

    if (verificandoCaixa) return <CircularProgress />;
    if (!caixaAberto) return <AvisoCaixaFechado />;

    return (
        <Grid container spacing={2} sx={{ p: 2 }}>
            {/* Coluna da Esquerda: Itens da Venda */}
            <Grid size={{ xs: 12, lg: 7 }}>
                <Typography variant="h5" gutterBottom>PDV - Ponto de Venda</Typography>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <BuscaCliente onClienteChange={setClienteSelecionado} />
                </Paper>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <BuscaProduto onAddProduto={handleAddItemAoCarrinho} />
                </Paper>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Carrinho</Typography>
                    <CarrinhoItens
                        items={carrinho}
                        onUpdateQuantidade={handleUpdateQuantidade}
                        onRemoveItem={handleRemoveItem}
                    />
                </Paper>
            </Grid>

            {/* Coluna da Direita: Resumo e Finalização */}
            <Grid size={{ xs: 12, lg: 5 }}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Resumo da Venda</Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Subtotal</Typography>
                        <Typography>{totais.valorBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    </Box>
                    <TextField
                        label="Desconto (R$)"
                        type="number"
                        size="small"
                        fullWidth
                        value={desconto || ''}
                        onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                        sx={{ my: 1 }}
                    />
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h5">Total</Typography>
                        <Typography variant="h5" color="primary">{totais.valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={carrinho.length === 0}
                        onClick={() => setPagamentoDialogOpen(true)}
                    >
                        Finalizar Venda
                    </Button>
                </Paper>
            </Grid>

            <PagamentoDialog
                open={pagamentoDialogOpen}
                onClose={() => setPagamentoDialogOpen(false)}
                valorTotal={totais.valorLiquido}
                onFinalizarVenda={handleFinalizarVenda}
            />
        </Grid>
    );
};

export default VendasPage;