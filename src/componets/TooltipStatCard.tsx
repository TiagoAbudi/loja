import React, { useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Tooltip, List, ListItem, ListItemText } from '@mui/material';
import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { supabase } from '../supabaseClient';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
    color: string;
}

interface TooltipStatCardProps extends StatCardProps {
    fetchType: 'low-stock' | 'out-of-stock';
}

interface ProductInfo {
    nome: string;
    estoque: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
    <Paper
        elevation={3}
        sx={{
            p: 3, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', borderRadius: 2, height: '100%'
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
            backgroundColor: color, borderRadius: '50%', height: 56, width: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 3
        }}>
            <Icon sx={{ color: '#fff', fontSize: 30 }} />
        </Box>
    </Paper>
);


export const TooltipStatCard: React.FC<TooltipStatCardProps> = ({ fetchType, ...statCardProps }) => {
    const [products, setProducts] = useState<ProductInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    const fetchProductList = async () => {
        if (hasFetched || isLoading || statCardProps.value === 0) {
            return;
        }

        setIsLoading(true);

        let query = supabase.from('Produtos').select('nome, estoque');

        if (fetchType === 'low-stock') {
            query = query.gt('estoque', 0).lt('estoque', 10);
        } else {
            query = query.eq('estoque', 0);
        }

        const { data, error } = await query.order('nome', { ascending: true });

        if (error) {
            console.error(`Erro ao buscar produtos com ${fetchType}:`, error);
        } else {
            const cleanedData = (data || []).map(product => ({
                nome: product.nome ?? 'Produto sem nome',
                estoque: product.estoque ?? 0,
            }));
            setProducts(cleanedData);
        }

        setIsLoading(false);
        setHasFetched(true);
    };

    const renderTooltipContent = () => {
        if (isLoading) {
            return <CircularProgress size={20} />;
        }
        if (!hasFetched) {
            return 'Passe o mouse para ver os produtos';
        }
        if (products.length === 0) {
            return 'Nenhum produto encontrado nesta categoria.';
        }

        return (
            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'white' }}>
                    {fetchType === 'low-stock' ? 'Produtos com Estoque Baixo' : 'Produtos Sem Estoque'}
                </Typography>
                <List
                    dense
                    sx={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        pr: 1,
                    }} disablePadding
                >
                    {products.map((product) => (
                        <ListItem key={product.nome} disableGutters sx={{ p: 0 }}>
                            <ListItemText
                                primary={product.nome}
                                secondary={`Estoque: ${product.estoque}`}
                                primaryTypographyProps={{ color: 'white', fontSize: '0.875rem' }}
                                secondaryTypographyProps={{ color: '#ccc', fontSize: '0.75rem' }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        );
    };

    return (
        <Tooltip
            title={renderTooltipContent()}
            onOpen={fetchProductList}
            placement="top"
            arrow
        >
            <div>
                <StatCard {...statCardProps} />
            </div>
        </Tooltip>
    );
};