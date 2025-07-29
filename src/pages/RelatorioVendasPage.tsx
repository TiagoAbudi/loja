import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Paper, Typography, Grid, TextField, Button } from '@mui/material';
import { GridColDef, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { supabase } from '../supabaseClient';
import { VendaDetalhesDialog } from '../componets/VendaDetalhesDialog';
import { CustomDataGrid } from '../componets/CustomDataGrid';
import { QueryData } from '@supabase/supabase-js';

const vendasQuery = supabase
    .from('vendas')
    .select(`
        *, 
        cliente:Clientes(nome), 
        venda_itens(*, produto:Produtos(nome)), 
        venda_pagamentos(*)
    `);

export type Vendas = QueryData<typeof vendasQuery>;
export type Venda = Vendas[number];


const getPrimeiroDiaDoMes = (): string => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    return primeiroDia.toLocaleDateString('en-CA');
};

const getHoje = (): string => {
    return new Date().toLocaleDateString('en-CA');
};

const RelatorioVendasPage: React.FC = () => {
    const [vendas, setVendas] = useState<Vendas>([]);
    const [loading, setLoading] = useState(false);
    const [dataInicio, setDataInicio] = useState(getPrimeiroDiaDoMes());
    const [dataFim, setDataFim] = useState(getHoje());

    const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
    const [detalhesOpen, setDetalhesOpen] = useState(false);

    const fetchVendas = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('vendas')
            .select(`*, cliente:Clientes(nome), venda_itens(*, produto:Produtos(nome)), venda_pagamentos(*)`)
            .eq('status', 'Finalizada')
            .gte('data_venda', dataInicio)
            .lte('data_venda', `${dataFim}T23:59:59`);

        if (error) {
            console.error("Erro ao buscar vendas:", error);
            setVendas([]);
        } else {
            setVendas(data || []);
        }

        setLoading(false);
    }, [dataInicio, dataFim]);

    useEffect(() => {
        fetchVendas();
    }, [fetchVendas]);

    const totaisPeriodo = useMemo(() => {
        const totalVendido = vendas.reduce((acc, venda) => acc + (venda.valor_liquido || 0), 0);
        const numeroVendas = vendas.length;
        const ticketMedio = numeroVendas > 0 ? totalVendido / numeroVendas : 0;
        return { totalVendido, numeroVendas, ticketMedio };
    }, [vendas]);

    const handleVerDetalhes = (venda: Venda) => {
        setVendaSelecionada(venda);
        setDetalhesOpen(true);
    };

    const columns: GridColDef<Venda>[] = [
        { field: 'id', headerName: 'ID Venda', width: 90 },
        {
            field: 'data_venda',
            headerName: 'Data',
            width: 180,
            valueGetter: (value) => value ? new Date(value) : null,
            renderCell: (params) => params.value ? params.value.toLocaleString('pt-BR') : ''
        },
        {
            field: 'cliente',
            headerName: 'Cliente',
            flex: 1,
            valueGetter: (_, row) => row.cliente?.nome || 'Consumidor Final'
        },
        {
            field: 'valor_liquido',
            headerName: 'Valor Total',
            width: 150,
            type: 'number',
            renderCell: (params) => (params.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Detalhes',
            width: 100,
            getActions: (params: GridRowParams<Venda>) => [
                <GridActionsCellItem
                    icon={<VisibilityIcon />}
                    label="Ver Detalhes"
                    onClick={() => handleVerDetalhes(params.row)}
                />
            ]
        }
    ];


    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Relatório de Vendas</Typography>

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
                <Button variant="contained" onClick={fetchVendas}>Filtrar</Button>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Total Vendido</Typography>
                        <Typography variant="h4" color="success.main">{totaisPeriodo.totalVendido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Nº de Vendas</Typography>
                        <Typography variant="h4">{totaisPeriodo.numeroVendas}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Ticket Médio</Typography>
                        <Typography variant="h4" color="primary.main">{totaisPeriodo.ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ height: 600, width: '100%' }}>
                <CustomDataGrid
                    title="Relatório de Vendas"
                    rows={vendas}
                    columns={columns}
                    loading={loading}
                />
            </Paper>

            <VendaDetalhesDialog
                venda={vendaSelecionada}
                open={detalhesOpen}
                onClose={() => setDetalhesOpen(false)}
            />
        </Box>
    );
};

export default RelatorioVendasPage;