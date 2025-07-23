// src/components/LatestSalesList.tsx

import React from 'react';
import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Divider } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';

// Estrutura de dados para uma venda (mock)
export interface Sale {
    id: number;
    customerName: string;
    totalValue: number;
    sellerName: string;
    date: Date;
}

// Nossos dados de mentira para preencher a lista
const mockLatestSales: Sale[] = [
    { id: 101, customerName: 'Ana Silva', totalValue: 450.50, sellerName: 'Tiago', date: new Date() },
    { id: 100, customerName: 'João Oliveira', totalValue: 1299.00, sellerName: 'Lucas', date: new Date(new Date().setDate(new Date().getDate() - 1)) },
    { id: 99, customerName: 'Mariana Costa', totalValue: 75.20, sellerName: 'Tiago', date: new Date(new Date().setDate(new Date().getDate() - 1)) },
    { id: 98, customerName: 'Beatriz Santos', totalValue: 3200.00, sellerName: 'Lucas', date: new Date(new Date().setDate(new Date().getDate() - 2)) },
    { id: 97, customerName: 'Lucas Souza', totalValue: 89.90, sellerName: 'Tiago', date: new Date(new Date().setDate(new Date().getDate() - 3)) },
];

export const LatestSalesList: React.FC = () => {
    return (
        <Box sx={{ width: '100%', pt: 1 }}>
            <List>
                {mockLatestSales.map((sale, index) => (
                    <React.Fragment key={sale.id}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar>
                                    <ReceiptIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                            {sale.customerName}
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.totalValue)}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Atendido por: {sale.sellerName} em {sale.date.toLocaleDateString('pt-BR')}
                                    </Typography>
                                }
                            />
                        </ListItem>
                        {index < mockLatestSales.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};