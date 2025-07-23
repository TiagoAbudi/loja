import React from 'react';
import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography } from '@mui/material';
import { blue, green, orange, red, purple } from '@mui/material/colors';

interface Product {
    id: number;
    name: string;
    sold: number;
}

interface TopProductsListProps {
    products: Product[];
}

const avatarColors = [blue[500], green[500], orange[500], red[500], purple[500]];

export const TopProductsList: React.FC<TopProductsListProps> = ({ products }) => {
    return (
        <Box sx={{ width: '100%', pt: 1 }}>
            <List>
                {products.map((product, index) => (
                    <ListItem key={product.id}>
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: avatarColors[index % avatarColors.length] }}>
                                {index + 1}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={<Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{product.name}</Typography>}
                            secondary={`${product.sold} unidades vendidas`}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};