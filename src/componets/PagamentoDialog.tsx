// src/components/PagamentoDialog.tsx

import React, { useState, useMemo, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box,
    Select, MenuItem, TextField, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Divider
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';

// Definindo os tipos pra ficar tudo nos trinques
export interface Pagamento {
    metodo: 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Pix' | 'A Prazo';
    valor: number;
}

interface PagamentoDialogProps {
    open: boolean;
    onClose: () => void;
    valorTotal: number;
    onFinalizarVenda: (pagamentos: Pagamento[]) => void;
}

export const PagamentoDialog: React.FC<PagamentoDialogProps> = ({ open, onClose, valorTotal, onFinalizarVenda }) => {
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [metodoAtual, setMetodoAtual] = useState<'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Pix' | 'A Prazo'>('Dinheiro');
    const [valorAtual, setValorAtual] = useState('');

    // Limpa tudo quando o dialog abre
    useEffect(() => {
        if (open) {
            setPagamentos([]);
            setValorAtual(valorTotal.toFixed(2)); // Sugere o valor total no primeiro pagamento
            setMetodoAtual('Dinheiro');
        }
    }, [open, valorTotal]);

    // O cérebro que calcula tudo sozinho, só na malandragem!
    const totais = useMemo(() => {
        const valorPago = pagamentos.reduce((acc, pag) => acc + pag.valor, 0);
        const restante = valorTotal - valorPago;
        const troco = valorPago > valorTotal ? valorPago - valorTotal : 0;
        return { valorPago, restante, troco };
    }, [pagamentos, valorTotal]);

    const handleAddPagamento = () => {
        const valorNum = parseFloat(valorAtual);
        if (isNaN(valorNum) || valorNum <= 0) {
            alert("Valor inválido, meu parça!");
            return;
        }
        const novoPagamento: Pagamento = { metodo: metodoAtual, valor: valorNum };
        setPagamentos([...pagamentos, novoPagamento]);
        
        // Prepara pro próximo pagamento
        const valorRestante = totais.restante - valorNum;
        setValorAtual(valorRestante > 0 ? valorRestante.toFixed(2) : '');
    };

    const handleRemovePagamento = (index: number) => {
        const novosPagamentos = pagamentos.filter((_, i) => i !== index);
        setPagamentos(novosPagamentos);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogContent>
                <Box sx={{ textAlign: 'center', my: 2 }}>
                    <Typography variant="h6">Total a Pagar</Typography>
                    <Typography variant="h3" color="primary" fontWeight="bold">
                        {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />

                {/* Formulário pra adicionar pagamento */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <Select value={metodoAtual} onChange={(e) => setMetodoAtual(e.target.value as any)} sx={{ flex: 1 }}>
                        <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                        <MenuItem value="Cartão de Crédito">Cartão de Crédito</MenuItem>
                        <MenuItem value="Cartão de Débito">Cartão de Débito</MenuItem>
                        <MenuItem value="Pix">Pix</MenuItem>
                        <MenuItem value="A Prazo">A Prazo</MenuItem>
                    </Select>
                    <TextField
                        label="Valor"
                        type="number"
                        value={valorAtual}
                        onChange={(e) => setValorAtual(e.target.value)}
                        sx={{ flex: 1 }}
                        InputProps={{ startAdornment: 'R$' }}
                    />
                    <IconButton color="primary" onClick={handleAddPagamento}>
                        <AddCircleIcon />
                    </IconButton>
                </Box>

                {/* Lista de pagamentos já adicionados */}
                <Typography variant="subtitle1">Pagamentos Adicionados:</Typography>
                <List dense>
                    {pagamentos.map((pag, index) => (
                        <ListItem key={index} sx={{bgcolor: 'action.hover', borderRadius: 1, mb: 0.5}}>
                            <ListItemText primary={pag.metodo} secondary={pag.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" onClick={() => handleRemovePagamento(index)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ my: 2 }} />

                {/* Resumo final */}
                <Box sx={{ textAlign: 'right' }}>
                    <Typography>Total Pago: {totais.valorPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    {totais.restante > 0 && <Typography color="error">Falta: {totais.restante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>}
                    {totais.troco > 0 && <Typography color="success.main" variant="h6">Troco: {totais.troco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>}
                </Box>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar Venda</Button>
                <Button 
                    onClick={() => onFinalizarVenda(pagamentos)} 
                    variant="contained" 
                    disabled={totais.restante > 0} // Só habilita quando a conta tá zerada!
                    size="large"
                >
                    Confirmar Venda
                </Button>
            </DialogActions>
        </Dialog>
    );
};