import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Paper, Typography, Grid, TextField, Button } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { supabase } from '../supabaseClient';
import { CustomDataGrid } from '../componets/CustomDataGrid';

const getPrimeiroDiaDoMes = (): string => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
};

const getHoje = (): string => {
    return new Date().toISOString().slice(0, 10);
};

const RelatorioLucratividadePage: React.FC = () => {
    const [dados, setDados] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [dataInicio, setDataInicio] = useState(getPrimeiroDiaDoMes());
    const [dataFim, setDataFim] = useState(getHoje());

    const fetchLucratividade = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_lucratividade_periodo', {
            data_inicio: dataInicio,
            data_fim: dataFim
        });

        if (error) {
            console.error("Erro ao buscar lucratividade:", error);
        } else {
            setDados(data || []);
        }
        setLoading(false);
    }, [dataInicio, dataFim]);

    useEffect(() => {
        fetchLucratividade();
    }, [fetchLucratividade]);

    const totais = useMemo(() => {
        const faturamento = dados.reduce((acc, item) => acc + (Number(item.valor_da_venda) || 0), 0);
        const custo = dados.reduce((acc, item) => acc + (Number(item.custo_da_venda) || 0), 0);
        const lucro = dados.reduce((acc, item) => acc + (Number(item.lucro) || 0), 0);
        return { faturamento, custo, lucro };
    }, [dados]);

    const columns: GridColDef[] = [
        { field: 'id_venda', headerName: 'ID Venda', width: 100 },
        { field: 'data_da_venda', headerName: 'Data', width: 180, type: 'dateTime', valueGetter: (value) => new Date(value) },
        { field: 'cliente', headerName: 'Cliente', flex: 1, minWidth: 200, valueGetter: (value) => value || 'Consumidor Final' },
        {
            field: 'valor_da_venda',
            headerName: 'Faturamento',
            width: 150,
            type: 'number',
            renderCell: (params) => Number(params.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        {
            field: 'custo_da_venda',
            headerName: 'Custo',
            width: 150,
            type: 'number',
            renderCell: (params) => Number(params.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        {
            field: 'lucro',
            headerName: 'Lucro',
            width: 150,
            type: 'number',
            renderCell: (params) => (
                <Typography color={params.value >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                    {Number(params.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Typography>
            )
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Relatório de Lucratividade</Typography>

            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField label="Data de Início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} InputLabelProps={{ shrink: true }} />
                <TextField label="Data Final" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} InputLabelProps={{ shrink: true }} />
                <Button variant="contained" onClick={fetchLucratividade}>Filtrar</Button>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Faturamento Total</Typography><Typography variant="h4">{totais.faturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography></Paper></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Custo Total</Typography><Typography variant="h4" color="text.secondary">{totais.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography></Paper></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">Lucro Total</Typography><Typography variant="h4" color={totais.lucro >= 0 ? 'success.main' : 'error.main'}>{totais.lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography></Paper></Grid>
            </Grid>

            <Paper sx={{ height: 600, width: '100%' }}>
                <CustomDataGrid
                    title='Relatório de Lucratividade'
                    rows={dados}
                    columns={columns}
                    getRowId={(row) => row.id_venda}
                    loading={loading}
                />
            </Paper>
        </Box>
    );
};

export default RelatorioLucratividadePage;