import React from 'react';
import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Divider } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';

export interface Sale {
    id: number;
    customerName: string;
    totalValue: number;
    sellerName: string;
    date: Date;
}

interface LatestSalesListProps {
    sales: Sale[];
}

export const LatestSalesList: React.FC<LatestSalesListProps> = ({ sales }) => {
    if (!sales || sales.length === 0) {
        return <Typography sx={{ p: 2, color: 'text.secondary' }}>Nenhuma venda recente encontrada.</Typography>;
    }

    return (
        <Box sx={{ width: '100%', pt: 1 }}>
            <List>
                {sales.map((sale, index) => (
                    <React.Fragment key={sale.id}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar><Avatar><ReceiptIcon /></Avatar></ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{sale.customerName}</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            {sale.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                        {index < sales.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};