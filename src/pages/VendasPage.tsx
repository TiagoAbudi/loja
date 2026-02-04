import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
    Box, Typography, Paper, Grid, Button, Divider, TextField, Dialog,
    DialogActions, DialogContent, DialogContentText, DialogTitle,
    CircularProgress, Snackbar, Alert
} from '@mui/material';
import { supabase } from '../supabaseClient';
import { Product } from './ProductsPage';
import { Pagamento, PagamentoDialog } from '../componets/PagamentoDialog';
import { BuscaProduto } from '../componets/BuscaProduto';
import { CarrinhoItens } from '../componets/CarrinhoItens';
import { Link, useBlocker } from 'react-router-dom';
import { BuscaPessoa, Pessoa } from '../componets/BuscaPessoa';

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
    // ESTADOS PRINCIPAIS
    const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
    const [desconto, setDesconto] = useState<number>(0);
    const [pagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);
    const [caixaAberto, setCaixaAberto] = useState<any>(null);
    const [estaSalvando, setEstaSalvando] = useState(false);

    // ESTADOS DO TOAST (NOTIFICAÇÃO)
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

    const clienteInputRef = useRef<HTMLDivElement>(null);
    const produtoInputRef = useRef<HTMLDivElement>(null);
    const [pessoaSelecionada, setPessoaSelecionada] = useState<Pessoa | null>(null);

    // FOCO AUTOMÁTICO
    useEffect(() => {
        setTimeout(() => {
            clienteInputRef.current?.querySelector('input')?.focus();
        }, 100);
    }, []);

    useEffect(() => {
        if (pessoaSelecionada) {
            produtoInputRef.current?.querySelector('input')?.focus();
        }
    }, [pessoaSelecionada]);

    // BLOQUEADOR DE NAVEGAÇÃO SE HOUVER ITENS NO CARRINHO
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            carrinho.length > 0 &&
            currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (carrinho.length > 0) {
                event.preventDefault();
                event.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [carrinho.length]);

    // VERIFICAÇÃO DE CAIXA
    useEffect(() => {
        const verificarCaixa = async () => {
            const { data } = await supabase.from('caixas').select('*').eq('status', 'Aberto').maybeSingle();
            setCaixaAberto(data);
        };
        verificarCaixa();
    }, []);

    const totais = useMemo(() => {
        const valorBruto = carrinho.reduce((acc, item) => acc + item.preco_total, 0);
        const valorLiquido = valorBruto - desconto;
        return { valorBruto, valorLiquido };
    }, [carrinho, desconto]);

    const handleAddItemAoCarrinho = useCallback((produto: Product) => {
        if (typeof produto.id === 'undefined') return;
        const precoNumerico = Number(produto.preco);
        if (isNaN(precoNumerico)) return;

        setCarrinho(prev => {
            const itemExistente = prev.find(item => item.produto_id === produto.id);
            if (itemExistente) {
                return prev.map(item =>
                    item.produto_id === produto.id
                        ? { ...item, quantidade: item.quantidade + 1, preco_total: (item.quantidade + 1) * item.preco_unitario }
                        : item
                );
            }
            return [...prev, {
                produto_id: produto.id!,
                nome: produto.nome ?? 'Produto',
                quantidade: 1,
                preco_unitario: precoNumerico,
                preco_total: precoNumerico
            }];
        });
    }, []);

    const handleUpdateQuantidade = useCallback((produtoId: number, novaQuantidade: number) => {
        setCarrinho(prev => {
            if (novaQuantidade <= 0) return prev.filter(item => item.produto_id !== produtoId);
            return prev.map(item =>
                item.produto_id === produtoId
                    ? { ...item, quantidade: novaQuantidade, preco_total: novaQuantidade * item.preco_unitario }
                    : item
            );
        });
    }, []);

    const handleRemoveItem = useCallback((produtoId: number) => {
        setCarrinho(prev => prev.filter(item => item.produto_id !== produtoId));
    }, []);

    // FUNÇÃO PRINCIPAL: FINALIZAR VENDA
    const handleFinalizarVenda = async (pagamentos: Pagamento[]) => {
        if (estaSalvando) return; // Trava cliques múltiplos

        setEstaSalvando(true);
        setPagamentoDialogOpen(false);

        try {
            if (!pessoaSelecionada || !pessoaSelecionada.nome) {
                throw new Error("Selecione um cliente antes de finalizar.");
            }

            // 1. Criar/Buscar Cliente
            const { data: clienteId, error: clienteError } = await supabase.rpc('get_or_create_cliente', {
                nome_cliente: pessoaSelecionada.nome,
            });
            if (clienteError) throw clienteError;

            // 2. Inserir Venda (Sequence do banco gera o ID automaticamente)
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

            if (vendaError) throw vendaError;
            const vendaId = vendaData.id;

            // 3. Inserir Itens
            const { error: itensError } = await supabase.from('venda_itens').insert(
                carrinho.map(item => ({
                    venda_id: vendaId,
                    produto_id: item.produto_id,
                    quantidade: item.quantidade,
                    preco_unitario: item.preco_unitario,
                    preco_total: item.preco_total
                }))
            );
            if (itensError) throw itensError;

            // 4. Inserir Pagamentos
            const { error: pagamentosError } = await supabase.from('venda_pagamentos').insert(
                pagamentos.map(pag => ({
                    venda_id: vendaId,
                    metodo: pag.metodo,
                    valor: pag.valor
                }))
            );
            if (pagamentosError) throw pagamentosError;

            // 5. Processar Regras de Negócio
            for (const pag of pagamentos) {
                if (pag.metodo === 'A Prazo') {
                    const hoje = new Date();
                    const dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 6);
                    await supabase.from('contas_a_receber').insert({
                        descricao: `Venda #${vendaId}`,
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
                        descricao: `Venda #${vendaId}`,
                        valor: pag.valor
                    });
                }
                if (pag.metodo === 'Crédito Funcionário' && pessoaSelecionada.tipo === 'Funcionario') {
                    await supabase.rpc('descontar_credito_funcionario', {
                        id_funcionario: pessoaSelecionada.id,
                        valor_desconto: pag.valor
                    });
                }
            }

            // 6. Finalizar via RPC
            const { error: rpcError } = await supabase.rpc('finalizar_venda', { id_da_venda: vendaId });
            if (rpcError) throw rpcError;

            // SUCESSO
            setToastMsg("Venda realizada com sucesso!");
            setToastSeverity('success');
            setToastOpen(true);

            setCarrinho([]);
            setPessoaSelecionada(null);
            setDesconto(0);

        } catch (error: any) {
            console.error("Erro Crítico:", error);
            setToastMsg(error.message || "Erro inesperado ao salvar venda.");
            setToastSeverity('error');
            setToastOpen(true);
        } finally {
            setEstaSalvando(false);
        }
    };

    if (!caixaAberto) return <AvisoCaixaFechado />;

    return (
        <Grid container spacing={2} sx={{ p: 2 }}>
            <Grid size={{ xs: 12, lg: 7 }}>
                <Typography variant="h5" gutterBottom>PDV - Ponto de Venda</Typography>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <BuscaPessoa ref={clienteInputRef} onPessoaChange={setPessoaSelecionada} />
                </Paper>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <BuscaProduto ref={produtoInputRef} onAddProduto={handleAddItemAoCarrinho} />
                </Paper>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Carrinho</Typography>
                    <CarrinhoItens items={carrinho} onUpdateQuantidade={handleUpdateQuantidade} onRemoveItem={handleRemoveItem} />
                </Paper>
            </Grid>

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
                        disabled={carrinho.length === 0 || estaSalvando}
                        onClick={() => setPagamentoDialogOpen(true)}
                        startIcon={estaSalvando && <CircularProgress size={20} color="inherit" />}
                    >
                        {estaSalvando ? 'Processando...' : 'Finalizar Venda'}
                    </Button>
                </Paper>
            </Grid>

            {/* COMPONENTE DE NOTIFICAÇÃO (TOAST) */}
            <Snackbar
                open={toastOpen}
                autoHideDuration={3000}
                onClose={() => setToastOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} variant="filled" sx={{ width: '100%' }}>
                    {toastMsg}
                </Alert>
            </Snackbar>

            {/* MODAL DE PAGAMENTO */}
            <PagamentoDialog
                open={pagamentoDialogOpen}
                onClose={() => setPagamentoDialogOpen(false)}
                valorTotal={totais.valorLiquido}
                onFinalizarVenda={handleFinalizarVenda}
                isFuncionario={pessoaSelecionada?.tipo === 'Funcionario'}
                creditoDisponivel={pessoaSelecionada?.credito_disponivel ?? 0}
            />

            {/* DIÁLOGO DE BLOQUEIO DE SAÍDA */}
            {blocker.state === "blocked" && (
                <Dialog open={true} onClose={() => blocker.reset?.()}>
                    <DialogTitle>Descartar Pedido?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Você tem itens no carrinho. Deseja realmente sair e perder os dados desta venda?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => blocker.reset?.()}>Ficar</Button>
                        <Button onClick={() => blocker.proceed?.()} color="warning">Sair da Página</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Grid>
    );
};

export default VendasPage;