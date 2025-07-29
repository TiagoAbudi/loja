import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    IconButton,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface CarrinhoItem {
    produto_id: number;
    nome: string;
    quantidade: number;
    preco_unitario: number;
    preco_total: number;
}

interface CarrinhoItensProps {
    items: CarrinhoItem[];
    onUpdateQuantidade: (produtoId: number, novaQuantidade: number) => void;
    onRemoveItem: (produtoId: number) => void;
}

export const CarrinhoItens: React.FC<CarrinhoItensProps> = ({ items, onUpdateQuantidade, onRemoveItem }) => {
    if (items.length === 0) {
        return <Typography sx={{ mt: 2, color: 'text.secondary' }}>O carrinho está vazio.</Typography>;
    }

    const handleQuantidadeChange = (produtoId: number, quantidadeStr: string) => {
        const novaQuantidade = parseInt(quantidadeStr, 10);
        if (!isNaN(novaQuantidade) && novaQuantidade >= 0) {
            onUpdateQuantidade(produtoId, novaQuantidade);
        }
    };

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Produto</TableCell>
                        <TableCell align="center">Qtd.</TableCell>
                        <TableCell align="right">Preço Unit.</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Ações</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.produto_id}>
                            <TableCell component="th" scope="row">
                                {item.nome}
                            </TableCell>
                            <TableCell align="center">
                                <TextField
                                    type="number"
                                    value={item.quantidade}
                                    onChange={(e) => handleQuantidadeChange(item.produto_id, e.target.value)}
                                    inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                    sx={{ width: '80px' }}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell align="right">{item.preco_unitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                            <TableCell align="right" sx={{fontWeight: 'bold'}}>{item.preco_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                            <TableCell align="center">
                                <IconButton onClick={() => onRemoveItem(item.produto_id)} color="error" size="small">
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};