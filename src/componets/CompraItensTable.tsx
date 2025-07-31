import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Product } from '../pages/ProductsPage';

export interface ItemCompra {
    produto: Product & { id: number };
    quantidade: number;
    custo_unitario: number;
}


interface CompraItensTableProps {
    items: ItemCompra[];
    onUpdateItem: (produtoId: number, campo: 'quantidade' | 'custo_unitario', valor: number) => void;
    onRemoveItem: (produtoId: number) => void;
}

export const CompraItensTable: React.FC<CompraItensTableProps> = ({ items, onUpdateItem, onRemoveItem }) => {
    if (items.length === 0) {
        return <Typography sx={{ mt: 2, p: 2, color: 'text.secondary', textAlign: 'center' }}>Nenhum produto adicionado à compra.</Typography>;
    }

    const handleQuantidadeChange = (produtoId: number, quantidadeStr: string) => {
        const novaQuantidade = parseInt(quantidadeStr, 10);
        onUpdateItem(produtoId, 'quantidade', isNaN(novaQuantidade) ? 0 : novaQuantidade);
    };

    const handleCustoChange = (produtoId: number, custoStr: string) => {
        const novoCusto = parseFloat(custoStr);
        onUpdateItem(produtoId, 'custo_unitario', isNaN(novoCusto) ? 0 : novoCusto);
    };

    return (
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Produto</TableCell>
                        <TableCell align="center">Custo Unitário (R$)</TableCell>
                        <TableCell align="center">Quantidade</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                        <TableCell align="center">Ações</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.produto.id}>
                            <TableCell>{item.produto.nome}</TableCell>
                            <TableCell align="center">
                                <TextField
                                    type="number"
                                    size="small"
                                    value={item.custo_unitario || ''} 
                                    onChange={(e) => handleCustoChange(item.produto.id, e.target.value)}
                                    sx={{ width: '120px' }}
                                    InputProps={{startAdornment: 'R$'}}
                                />
                            </TableCell>
                            <TableCell align="center">
                                <TextField
                                    type="number"
                                    size="small"
                                    value={item.quantidade || ''} 
                                    onChange={(e) => handleQuantidadeChange(item.produto.id, e.target.value)}
                                    sx={{ width: '80px' }}
                                />
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {(item.custo_unitario * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
                            <TableCell align="center">
                                <IconButton onClick={() => onRemoveItem(item.produto.id)} color="error"><DeleteIcon /></IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};