import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, Grid, Paper, Chip } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { supabase } from '../supabaseClient';
import { CustomDataGrid } from '../componets/CustomDataGrid';
import { formatCurrency, formatDate } from '../utils/formatters';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

interface Caixa {
    id: number;
    data_abertura: string;
    valor_inicial: number;
    data_fechamento: string | null;
    valor_final_calculado: number | null;
    valor_final_informado: number | null;
    diferenca: number | null;
    status: string;
}

const SummaryCard = ({ title, value, icon, color }: any) => (
    <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box sx={{
            backgroundColor: color, color: 'white', borderRadius: '50%',
            height: 56, width: 56, display: 'flex',
            alignItems: 'center', justifyContent: 'center', mr: 2
        }}>
            {icon}
        </Box>
        <Box>
            <Typography color="text.secondary">{title}</Typography>
            <Typography variant="h5" fontWeight="bold">{formatCurrency(value)}</Typography>
        </Box>
    </Paper>
);

export const RelatorioCaixaPage: React.FC = () => {
    const [caixas, setCaixas] = useState<Caixa[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const hoje = new Date();
        const dataFim = hoje.toISOString().split('T')[0];
        const dataInicio = new Date(new Date().setDate(hoje.getDate() - 30)).toISOString().split('T')[0];

        const [caixasResponse, summaryResponse] = await Promise.all([
            supabase.from('caixas').select('*').order('data_abertura', { ascending: false }),
            supabase.rpc('get_relatorio_caixa_totalizadores', { data_inicio: dataInicio, data_fim: dataFim })
        ]);

        if (caixasResponse.error || summaryResponse.error) {
            console.error("Erro ao buscar dados do relatório:", caixasResponse.error || summaryResponse.error);
            setError("Não foi possível carregar os dados do relatório.");
        } else {
            setCaixas(caixasResponse.data);
            setSummary(summaryResponse.data[0]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: GridColDef<Caixa>[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 80
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 100,
            renderCell: (params) =>
                <Chip
                    label={params.value}
                    color={
                        params.value === 'Aberto' ?
                            'success' :
                            'default'
                    }
                    size="small"
                />
        },
        {
            field: 'data_abertura',
            headerName: 'Abertura',
            width: 180,
            valueFormatter: (value: string) =>
                value ?
                    formatDate(value) :
                    '-'
        },
        {
            field: 'data_fechamento',
            headerName: 'Fechamento',
            width: 180,
            valueFormatter: (value: string | null) =>
                value ?
                    formatDate(value) :
                    'Caixa Aberto'
        },
        {
            field: 'valor_inicial',
            headerName: 'Valor Inicial',
            width: 130,
            align: 'right',
            headerAlign: 'right',
            valueFormatter: (value: number) =>
                value != null ?
                    formatCurrency(value) :
                    '-'
        },
        {
            field: 'valor_final_calculado',
            headerName: 'Valor Calculado',
            width: 150,
            align: 'right',
            headerAlign: 'right',
            valueFormatter: (value: number | null) =>
                value != null ?
                    formatCurrency(value) :
                    '-'
        },
        {
            field: 'valor_final_informado',
            headerName: 'Valor Informado',
            width: 150,
            align: 'right',
            headerAlign: 'right',
            valueFormatter: (value: number | null) =>
                value != null ?
                    formatCurrency(value) :
                    '-'
        },
        {
            field: 'diferenca',
            headerName: 'Diferença',
            width: 130,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => {
                if (params.value == null) return '-';
                return (
                    <Typography
                        color={
                            params.value > 0 ?
                                'success.main' :
                                params.value < 0 ?
                                    'error.main' :
                                    'text.primary'
                        }
                        fontWeight="bold"
                    >
                        {formatCurrency(params.value)}
                    </Typography>
                );
            }
        },
    ];

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>Relatório de Caixa</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>Resumo dos últimos 30 dias</Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><SummaryCard title="Total de Vendas" value={summary?.total_vendas} icon={<AttachMoneyIcon />} color="#388e3c" /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><SummaryCard title="Total de Suprimentos" value={summary?.total_suprimentos} icon={<ArrowUpwardIcon />} color="#1976d2" /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><SummaryCard title="Total de Sangrias" value={summary?.total_sangrias} icon={<ArrowDownwardIcon />} color="#f57c00" /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><SummaryCard title="Diferença Total" value={summary?.diferenca_total} icon={<CompareArrowsIcon />} color={summary?.diferenca_total < 0 ? '#d32f2f' : '#616161'} /></Grid>
            </Grid>

            <CustomDataGrid
                title="Histórico de Caixas"
                rows={caixas}
                columns={columns}
                loading={loading}
            />
        </Box>
    );
};

export default RelatorioCaixaPage;