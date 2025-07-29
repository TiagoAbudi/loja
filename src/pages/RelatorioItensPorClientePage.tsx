import React, { useState, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, Grid, TextField, Button } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { supabase } from '../supabaseClient';
import { BuscaCliente, Cliente } from '../componets/BuscaCliente';
import { CustomDataGrid } from '../componets/CustomDataGrid';

const getPrimeiroDiaDoMes = (): string => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
};

const getHoje = (): string => {
    return new Date().toISOString().slice(0, 10);
};

const RelatorioItensPorClientePage: React.FC = () => {
    const [itens, setItens] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [dataInicio, setDataInicio] = useState(getPrimeiroDiaDoMes());
    const [dataFim, setDataFim] = useState(getHoje());
    const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

    const handleGerarRelatorio = useCallback(async () => {
        if (!clienteSelecionado) {
            alert("Por favor, selecione um cliente para gerar o relatório.");
            return;
        }

        setLoading(true);

        const { data, error } = await supabase
            .from('venda_itens')
            .select(`
                *,
                produto:Produtos ( nome, sku ),
                venda:vendas!inner ( data_venda, cliente_id )
            `)
            .eq('venda.cliente_id', clienteSelecionado.id)
            .gte('venda.data_venda', dataInicio)
            .lte('venda.data_venda', `${dataFim}T23:59:59`);

        if (error) {
            console.error("Erro ao buscar itens do cliente:", error);
        } else {
            setItens(data || []);
        }
        setLoading(false);
    }, [dataInicio, dataFim, clienteSelecionado]);

    const totais = useMemo(() => {
        const totalGasto = itens.reduce((acc, item) => acc + Number(item.preco_total), 0);
        const totalItens = itens.reduce((acc, item) => acc + Number(item.quantidade), 0);
        return { totalGasto, totalItens };
    }, [itens]);

    const columns: GridColDef[] = [
        {
            field: 'venda_id',
            headerName: 'ID Venda',
            width: 100
        },
        {
            field: 'data_venda',
            headerName: 'Data da Compra',
            width: 180,
            valueGetter: (value, row) => new Date(row.venda.data_venda).toLocaleString('pt-Br')
        },
        {
            field: 'sku',
            headerName: 'SKU',
            width: 150,
            valueGetter: (value, row) => row.produto?.sku || 'N/A'
        },
        {
            field: 'nome',
            headerName: 'Nome do Produto',
            flex: 1,
            minWidth: 250,
            valueGetter: (value, row) => row.produto?.nome || 'Produto Removido'
        },
        { field: 'quantidade', headerName: 'Qtd.', width: 80, type: 'number' },
        {
            field: 'preco_total',
            headerName: 'Valor Total',
            width: 150,
            type: 'number',
            renderCell: (params) => Number(params.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Relatório de Itens por Cliente</Typography>

            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: '300px', flexGrow: 1 }}>
                    <BuscaCliente onClienteChange={setClienteSelecionado} />
                </Box>
                <TextField label="Data de Início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} InputLabelProps={{ shrink: true }} />
                <TextField label="Data Final" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} InputLabelProps={{ shrink: true }} />
                <Button variant="contained" onClick={handleGerarRelatorio} disabled={!clienteSelecionado || loading}>
                    {loading ? 'Gerando...' : 'Gerar Relatório'}
                </Button>
            </Paper>

            {itens.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">Total Gasto no Período</Typography>
                            <Typography variant="h4" color="success.main">{totais.totalGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">Nº de Itens Comprados</Typography>
                            <Typography variant="h4">{totais.totalItens}</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <Paper sx={{ height: 600, width: '100%' }}>
                <CustomDataGrid
                    title="Relatório de Itens por Cliente"
                    rows={itens}
                    columns={columns}
                    loading={loading}
                />
            </Paper>
        </Box>
    );
};

export default RelatorioItensPorClientePage;