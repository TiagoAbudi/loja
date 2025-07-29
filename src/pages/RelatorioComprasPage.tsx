import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Paper, Typography, Grid, TextField, Button, Chip } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { QueryData } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { CustomDataGrid } from '../componets/CustomDataGrid';

const contasQuery = supabase
    .from('contas_a_pagar')
    .select(`*, fornecedor:fornecedores ( nome_fantasia )`);

type Contas = QueryData<typeof contasQuery>;
type Conta = Contas[number];

type ContaPaga = Conta & { status: 'Pago' };

const getPrimeiroDiaDoMes = (): string => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toLocaleDateString('en-CA');
};

const getHoje = (): string => {
    return new Date().toLocaleDateString('en-CA');
};

const RelatorioComprasPage: React.FC = () => {
    const [contasPagas, setContasPagas] = useState<ContaPaga[]>([]);
    const [loading, setLoading] = useState(false);
    const [dataInicio, setDataInicio] = useState(getPrimeiroDiaDoMes());
    const [dataFim, setDataFim] = useState(getHoje());

    const fetchContasPagas = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('contas_a_pagar')
            .select(`*, fornecedor:fornecedores ( nome_fantasia )`)
            .eq('status', 'Pago')
            .gte('data_pagamento', dataInicio)
            .lte('data_pagamento', `${dataFim}T23:59:59`);

        if (error) {
            console.error("Erro ao buscar contas pagas:", error);
            setContasPagas([]);
        } else {
            setContasPagas((data as ContaPaga[]) || []);
        }
        setLoading(false);
    }, [dataInicio, dataFim]);

    useEffect(() => {
        fetchContasPagas();
    }, [fetchContasPagas]);

    const totaisPeriodo = useMemo(() => {
        const totalGasto = contasPagas.reduce((acc, conta) => acc + (conta.valor || 0), 0);
        const numeroDeContas = contasPagas.length;
        return { totalGasto, numeroDeContas };
    }, [contasPagas]);

    const columns: GridColDef<ContaPaga>[] = [
        {
            field: 'data_pagamento',
            headerName: 'Data do Pgto.',
            width: 150,
            valueGetter: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : '',
        },
        {
            field: 'descricao',
            headerName: 'Descrição da Despesa',
            flex: 1,
            minWidth: 250
        },
        {
            field: 'fornecedor',
            headerName: 'Fornecedor',
            minWidth: 200,
            valueGetter: (_, row) => row.fornecedor?.nome_fantasia || 'Despesa Geral'
        },
        {
            field: 'valor',
            headerName: 'Valor Pago',
            width: 150,
            type: 'number',
            renderCell: (params) => (params.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip label={params.value} color="success" variant="outlined" size="small" />
            )
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Relatório de Compras e Despesas</Typography>

            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    label="Data de Início"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Data Final"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <Button variant="contained" onClick={fetchContasPagas}>Filtrar</Button>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Total Gasto no Período</Typography>
                        <Typography variant="h4" color="error.main">{totaisPeriodo.totalGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Nº de Contas Pagas</Typography>
                        <Typography variant="h4">{totaisPeriodo.numeroDeContas}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ height: 600, width: '100%' }}>
                <CustomDataGrid
                    title='Reatório de compras'
                    rows={contasPagas}
                    columns={columns}
                    loading={loading}
                />
            </Paper>
        </Box>
    );
};

export default RelatorioComprasPage;