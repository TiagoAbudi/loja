import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography
} from '@mui/material';

interface Movimentacao {
    id: number;
    data_movimentacao: string;
    tipo: string;
    descricao: string;
    valor: number;
}

interface MovimentacoesCaixaListProps {
    movimentacoes: Movimentacao[];
}

export const MovimentacoesCaixaList: React.FC<MovimentacoesCaixaListProps> = ({ movimentacoes }) => {
    if (movimentacoes.length === 0) {
        return <Typography>Nenhuma movimentação registrada nesta sessão.</Typography>;
    }

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell align="right">Valor</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {movimentacoes.map((mov) => (
                        <TableRow key={mov.id}>
                            <TableCell>
                                {new Date(mov.data_movimentacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </TableCell>
                            <TableCell>{mov.descricao}</TableCell>
                            <TableCell>
                                <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                    {mov.tipo.toLowerCase()}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography
                                    color={mov.valor >= 0 ? 'success.main' : 'error.main'}
                                    fontWeight="bold"
                                >
                                    {mov.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};