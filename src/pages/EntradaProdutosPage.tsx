import React, { useState, useMemo } from 'react';
import { Box, Paper, Typography, Grid, Button, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import { supabase } from '../supabaseClient';
import { Product } from './ProductsPage';
import { BuscaProduto } from '../componets/BuscaProduto';
import { BuscaFornecedor } from '../componets/BuscaFornecedor';
import { CompraItensTable, ItemCompra } from '../componets/CompraItensTable';
import { Fornecedor } from './FornecedoresPage';

const getAmanha = () => {
    const amanhã = new Date();
    amanhã.setDate(amanhã.getDate() + 1);
    return amanhã.toISOString().slice(0, 10);
};

const EntradaProdutosPage: React.FC = () => {
    const [itens, setItens] = useState<ItemCompra[]>([]);
    const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
    const [formaPagamento, setFormaPagamento] = useState<'Pago' | 'A Prazo'>('Pago');
    const [metodoPagamentoDinheiro, setMetodoPagamentoDinheiro] = useState<'Dinheiro' | 'Pix' | 'Cartão de Débito'>('Dinheiro');
    const [descricao, setDescricao] = useState('');
    const [dataVencimento, setDataVencimento] = useState(getAmanha());

    const handleAddItem = (produto: Product) => {
        if (typeof produto.id === 'undefined') {
            alert("Erro: O produto selecionado não tem um ID válido.");
            return;
        }

        const itemExistente = itens.find(i => i.produto.id === produto.id);
        if (itemExistente) {
            alert("Este produto já foi adicionado. Altere a quantidade na tabela abaixo.");
            return;
        }

        const custoInicial = produto.valor_de_custo ? String(produto.valor_de_custo) : String(produto.preco);
        const custo = parseFloat(prompt(`Custo unitário para ${produto.nome}:`, custoInicial) || '0');

        if (custo >= 0) {
            setItens([...itens, { produto: produto as Product & { id: number }, quantidade: 1, custo_unitario: custo }]);
        }
    };


    const handleUpdateItem = (produtoId: number, campo: 'quantidade' | 'custo_unitario', valor: number) => {
        setItens(prevItens => prevItens.map(item =>
            item.produto.id === produtoId ? { ...item, [campo]: valor } : item
        ));
    };

    const handleRemoveItem = (produtoId: number) => {
        setItens(prevItens => prevItens.filter(item => item.produto.id !== produtoId));
    };


    const valorTotal = useMemo(() => itens.reduce((acc, item) => acc + (item.quantidade * item.custo_unitario), 0), [itens]);

    const handleRegistrarCompra = async () => {
        if (!fornecedor) { alert("Selecione um fornecedor."); return; }
        if (itens.length === 0) { alert("Adicione pelo menos um item."); return; }
        if (!descricao) { alert("Adicione uma descrição para a compra."); return; }

        const { data: fornecedorId, error: fornecedorError } = await supabase.rpc('get_or_create_fornecedor', { nome_fornecedor: fornecedor.nome_fantasia });
        if (fornecedorError || !fornecedorId) {
            console.error("Erro ao obter ID do fornecedor:", fornecedorError);
            alert("Ocorreu um erro ao processar o fornecedor. A compra não foi registrada.");
            return;
        }

        const compraParaInserir = {
            fornecedor_id: fornecedorId,
            valor_total: valorTotal,
            status_pagamento: formaPagamento,
            descricao: descricao,
            data_vencimento: formaPagamento === 'A Prazo' ? dataVencimento : null
        };
        const { data: compraData, error: compraError } = await supabase
            .from('compras')
            .insert(compraParaInserir)
            .select()
            .single();

        if (compraError || !compraData) {
            console.error("Erro ao criar o registro da compra:", compraError);
            alert(`Não foi possível registrar a compra. Erro: ${compraError?.message || 'Erro desconhecido.'}`);
            return;
        }

        const compraId = compraData.id;

        const itensParaInserir = itens.map(i => ({
            compra_id: compraId,
            produto_id: i.produto.id,
            quantidade: i.quantidade,
            custo_unitario: i.custo_unitario
        }));

        const { error: itensError } = await supabase.from('compra_itens').insert(itensParaInserir);
        if (itensError) {
            console.error("Erro ao inserir itens:", itensError);
            alert(`Erro ao inserir itens: ${itensError.message}`);
            return;
        }

        if (formaPagamento === 'A Prazo') {
            const { error: contasError } = await supabase.from('contas_a_pagar').insert({
                descricao: `Ref. Compra #${compraId}: ${descricao}`,
                valor: valorTotal,
                data_vencimento: dataVencimento,
                fornecedor_id: fornecedorId,
                status: 'Pendente'
            });

            if (contasError) {
                console.error("Erro ao criar conta a pagar:", contasError);
                alert("A compra foi salva, mas houve um erro ao criar a conta a pagar.");
            }
        }

        if (formaPagamento === 'Pago' && metodoPagamentoDinheiro === 'Dinheiro') {
            const { data: caixaAberto, error: caixaError } = await supabase
                .from('caixas')
                .select('id')
                .eq('status', 'Aberto')
                .maybeSingle();

            if (caixaError) {
                console.error("Erro ao verificar caixa:", caixaError);
                alert("Atenção: Houve um erro ao verificar o status do caixa.");
            } else if (caixaAberto) {
                const { error: movError } = await supabase.from('caixa_movimentacoes').insert({
                    caixa_id: caixaAberto.id,
                    tipo: 'PAGAMENTO_CONTA',
                    descricao: `Pagamento da Compra #${compraId}: ${descricao}`,
                    valor: -valorTotal
                });

                if (movError) {
                    console.error("Erro ao registrar movimentação de caixa:", movError);
                    alert("A compra foi salva, mas houve um erro ao registrar a saída no caixa.");
                }
            } else {
                alert("Atenção: Nenhum caixa aberto para registrar a saída do dinheiro.");
            }
        }

        await supabase.rpc('processar_entrada_de_produto', { id_da_compra: compraId });

        alert("Entrada de produtos registrada com sucesso!");
        setItens([]);
        setFornecedor(null);
        setDescricao('');
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Entrada de Produtos / Compras</Typography>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6">1. Informações da Compra</Typography>
                        {/* 3. NOVOS CAMPOS ADICIONADOS AQUI */}
                        <TextField
                            label="Descrição da Compra (Ex: NF 1234, Compra de Mercadorias, etc)"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            fullWidth
                            required
                        />
                        <BuscaFornecedor onFornecedorChange={setFornecedor} />
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">2. Produtos da Compra</Typography>
                        <BuscaProduto onAddProduto={handleAddItem} />
                        <CompraItensTable items={itens} onUpdateItem={handleUpdateItem} onRemoveItem={handleRemoveItem} />
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6">3. Pagamento</Typography>
                        <FormControl fullWidth>
                            <InputLabel>Status do Pagamento</InputLabel>
                            <Select value={formaPagamento} label="Status do Pagamento" onChange={(e) => setFormaPagamento(e.target.value as any)}>
                                <MenuItem value="Pago">Pago à Vista</MenuItem>
                                <MenuItem value="A Prazo">A Prazo</MenuItem>
                            </Select>
                        </FormControl>
                        {formaPagamento === 'A Prazo' && (
                            <TextField
                                label="Data de Vencimento"
                                type="date"
                                value={dataVencimento}
                                onChange={(e) => setDataVencimento(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        )}
                        {formaPagamento === 'Pago' && (
                            <FormControl fullWidth>
                                <InputLabel>Forma de Pagamento</InputLabel>
                                <Select value={metodoPagamentoDinheiro} label="Forma de Pagamento" onChange={(e) => setMetodoPagamentoDinheiro(e.target.value as any)}>
                                    <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                                    <MenuItem value="Pix">Pix</MenuItem>
                                    <MenuItem value="Cartão de Débito">Cartão de Débito</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12 }} sx={{ textAlign: 'right' }}>
                    <Typography variant="h5">Total da Compra: {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    <Button variant="contained" size="large" sx={{ mt: 2 }} onClick={handleRegistrarCompra}>
                        Registrar Compra
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default EntradaProdutosPage;