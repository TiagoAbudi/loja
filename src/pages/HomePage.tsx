import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, Alert, SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { SalesChart } from '../componets/SalesChart';
import { supabase } from '../supabaseClient';
import { LatestSalesList, Sale } from '../componets/LatestSalesList';
interface DashboardStats {
    total_produtos: number;
    valor_total_estoque: number;
    produtos_estoque_baixo: number;
    produtos_sem_estoque: number;
}
interface StatCardProps {
    title: string;
    value: string | number;
    icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
    <Paper
        elevation={3}
        sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 2,
            height: '100%'
        }}
    >
        <Box>
            <Typography color="text.secondary" gutterBottom variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                {title}
            </Typography>
            <Typography component="h2" variant="h4" sx={{ fontWeight: 'bold' }}>
                {value}
            </Typography>
        </Box>
        <Box sx={{
            backgroundColor: color,
            borderRadius: '50%',
            height: 56,
            width: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 3
        }}>
            <Icon sx={{ color: '#fff', fontSize: 30 }} />
        </Box>
    </Paper>
);

export const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [latestSales, setLatestSales] = useState<Sale[]>([]);
    const [chartData, setChartData] = useState<{ name: string; Vendas: number }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            const [statsResponse, chartResponse, salesResponse] = await Promise.all([
                supabase.rpc('get_dashboard_stats'),
                supabase.rpc('get_vendas_ultimos_7_dias'),
                supabase
                    .from('vendas')
                    .select('id, valor_liquido, data_venda, cliente:Clientes ( nome )')
                    .eq('status', 'Finalizada')
                    .order('data_venda', { ascending: false })
                    .limit(5)
            ]);

            if (statsResponse.error) {
                console.error('Erro ao buscar stats:', statsResponse.error);
                setError('Não foi possível carregar os dados do dashboard.');
            } else if (statsResponse.data) {
                setStats(statsResponse.data[0]);
            }

            if (chartResponse.error) {
                console.error("Erro no gráfico:", chartResponse.error);
            } else if (chartResponse.data) {
                const formattedChartData = chartResponse.data.map((item: any) => ({
                    name: item.dia,
                    Vendas: item.vendas
                }));
                setChartData(formattedChartData);
            }

            if (salesResponse.error) {
                console.error("Erro nas últimas vendas:", salesResponse.error);
            } else if (salesResponse.data) {
                const formattedSales = salesResponse.data.map((sale) => ({
                    id: sale.id,
                    customerName: sale.cliente?.nome ?? 'Consumidor Final',
                    totalValue: sale.valor_liquido,
                    date: new Date(sale.data_venda),
                    sellerName: 'Sistema'
                }));
                setLatestSales(formattedSales);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    const formattedStockValue = stats ?
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.valor_total_estoque)
        : 'R$ 0,00';

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Dashboard
            </Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Total de Produtos (Ativos)"
                        value={stats?.total_produtos ?? 0}
                        icon={Inventory2Icon}
                        color="#1976d2"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Valor do Estoque"
                        value={formattedStockValue}
                        icon={AttachMoneyIcon}
                        color="#388e3c"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Estoque Baixo (<10)"
                        value={stats?.produtos_estoque_baixo ?? 0}
                        icon={WarningAmberIcon}
                        color="#f57c00"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Sem Estoque"
                        value={stats?.produtos_sem_estoque ?? 0}
                        icon={ReportProblemIcon}
                        color="#d32f2f"
                    />
                </Grid>

                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper elevation={3} sx={{ p: 2, height: '450px', borderRadius: 2 }}>
                        <Typography variant="h6">Vendas nos últimos 7 dias</Typography>
                        <SalesChart data={chartData} />
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Paper elevation={3} sx={{ p: 2, height: '450px', borderRadius: 2 }}>
                        <Typography variant="h6">Últimas vendas</Typography>
                        <LatestSalesList sales={latestSales} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;